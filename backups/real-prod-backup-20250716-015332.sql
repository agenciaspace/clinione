

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'doctor',
    'receptionist',
    'patient',
    'owner',
    'staff'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_user_medical_data"("target_user_id" "uuid", "target_clinic_id" "uuid", "archival_reason" "text" DEFAULT 'User account deletion'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  archived_count INTEGER := 0;
  user_info JSONB;
  doctor_info JSONB;
  result JSONB;
BEGIN
  -- Get current user info from auth.users (if still exists)
  SELECT to_jsonb(au.*) INTO user_info
  FROM auth.users au 
  WHERE au.id = target_user_id;
  
  -- Get doctor info if user is a doctor
  SELECT to_jsonb(d.*) INTO doctor_info
  FROM public.doctors d 
  WHERE d.user_id = target_user_id AND d.clinic_id = target_clinic_id;
  
  -- Archive appointments where user was the doctor
  INSERT INTO public.archived_medical_data (
    original_table,
    original_id,
    clinic_id,
    archived_user_id,
    archived_user_data,
    medical_data,
    related_entities,
    archival_reason,
    archived_by,
    legal_retention_until
  )
  SELECT 
    'appointments',
    a.id,
    a.clinic_id,
    target_user_id,
    COALESCE(user_info, '{}'),
    to_jsonb(a.*),
    jsonb_build_object(
      'patient_name', a.patient_name,
      'doctor_name', a.doctor_name,
      'doctor_info', doctor_info
    ),
    archival_reason,
    auth.uid(),
    CURRENT_DATE + INTERVAL '5 years'
  FROM public.appointments a
  WHERE a.doctor_id = target_user_id 
    AND a.clinic_id = target_clinic_id
    AND NOT a.is_archived;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Mark appointments as archived
  UPDATE public.appointments 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    archived_by = auth.uid()
  WHERE doctor_id = target_user_id 
    AND clinic_id = target_clinic_id
    AND NOT is_archived;
  
  -- Archive patient records created by the user
  INSERT INTO public.archived_medical_data (
    original_table,
    original_id,
    clinic_id,
    archived_user_id,
    archived_user_data,
    medical_data,
    related_entities,
    archival_reason,
    archived_by,
    legal_retention_until
  )
  SELECT 
    'patient_records',
    pr.id,
    pr.clinic_id,
    target_user_id,
    COALESCE(user_info, '{}'),
    to_jsonb(pr.*),
    jsonb_build_object(
      'patient_id', pr.patient_id,
      'record_type', pr.type
    ),
    archival_reason,
    auth.uid(),
    CURRENT_DATE + INTERVAL '5 years'
  FROM public.patient_records pr
  WHERE pr.created_by = target_user_id 
    AND pr.clinic_id = target_clinic_id
    AND NOT pr.is_archived;
  
  -- Mark patient records as archived
  UPDATE public.patient_records 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    archived_by = auth.uid()
  WHERE created_by = target_user_id 
    AND clinic_id = target_clinic_id
    AND NOT is_archived;
  
  -- Archive doctor profile if user is a doctor
  IF doctor_info IS NOT NULL THEN
    INSERT INTO public.archived_medical_data (
      original_table,
      original_id,
      clinic_id,
      archived_user_id,
      archived_user_data,
      medical_data,
      related_entities,
      archival_reason,
      archived_by,
      legal_retention_until
    )
    VALUES (
      'doctors',
      (doctor_info->>'id')::UUID,
      target_clinic_id,
      target_user_id,
      COALESCE(user_info, '{}'),
      doctor_info,
      jsonb_build_object(),
      archival_reason,
      auth.uid(),
      CURRENT_DATE + INTERVAL '5 years'
    );
    
    -- Mark doctor as archived
    UPDATE public.doctors 
    SET 
      is_archived = TRUE,
      archived_at = NOW(),
      archived_by = auth.uid(),
      original_user_data = user_info
    WHERE user_id = target_user_id 
      AND clinic_id = target_clinic_id
      AND NOT is_archived;
  END IF;
  
  -- Archive user role
  UPDATE public.user_roles 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    archived_by = auth.uid(),
    archival_reason = archival_reason,
    original_user_data = user_info
  WHERE user_id = target_user_id 
    AND clinic_id = target_clinic_id
    AND NOT is_archived;
  
  -- Prepare result
  result := jsonb_build_object(
    'success', true,
    'archived_records', archived_count,
    'user_id', target_user_id,
    'clinic_id', target_clinic_id,
    'archival_reason', archival_reason,
    'legal_retention_until', CURRENT_DATE + INTERVAL '5 years'
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."archive_user_medical_data"("target_user_id" "uuid", "target_clinic_id" "uuid", "archival_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_owner_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  BEGIN
    INSERT INTO public.user_roles (user_id, clinic_id, role)
    VALUES (NEW.owner_id, NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."assign_owner_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_delete_archived_data"("archived_data_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  retention_date DATE;
BEGIN
  SELECT legal_retention_until INTO retention_date
  FROM public.archived_medical_data
  WHERE id = archived_data_id;
  
  RETURN retention_date IS NOT NULL AND retention_date < CURRENT_DATE;
END;
$$;


ALTER FUNCTION "public"."can_delete_archived_data"("archived_data_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_schedule_conflict"("p_doctor_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_exclude_block_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if there's any overlapping schedule block
  RETURN EXISTS (
    SELECT 1 FROM public.schedule_blocks 
    WHERE doctor_id = p_doctor_id 
      AND (p_exclude_block_id IS NULL OR id != p_exclude_block_id)
      AND (
        (start_datetime <= p_start_time AND end_datetime > p_start_time) OR
        (start_datetime < p_end_time AND end_datetime >= p_end_time) OR
        (start_datetime >= p_start_time AND end_datetime <= p_end_time)
      )
  );
END;
$$;


ALTER FUNCTION "public"."check_schedule_conflict"("p_doctor_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_exclude_block_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_expired_archived_data"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Only allow deletion after 5+ years
  DELETE FROM public.archived_medical_data
  WHERE legal_retention_until < CURRENT_DATE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."delete_expired_archived_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate a base slug from the clinic name if no slug is provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    -- Set initial slug
    new_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.clinics WHERE slug = new_slug AND id != NEW.id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := new_slug;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_unique_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_available_slots"("p_clinic_id" "uuid", "p_date" "date", "p_doctor_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("start_time" timestamp with time zone, "end_time" timestamp with time zone, "doctor_id" "uuid", "doctor_name" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_working_hours jsonb;
  v_day_of_week TEXT;
BEGIN
  -- Pegar o dia da semana
  v_day_of_week := LOWER(TO_CHAR(p_date, 'day'));
  v_day_of_week := TRIM(v_day_of_week);

  -- Pegar working_hours da clínica
  SELECT working_hours INTO v_working_hours
  FROM clinics 
  WHERE id = p_clinic_id;

  -- Se não há working_hours configurados, retornar vazio
  IF v_working_hours IS NULL OR v_working_hours->v_day_of_week IS NULL THEN
    RETURN;
  END IF;

  -- Gerar horários disponíveis baseados nos working_hours da clínica
  RETURN QUERY
  WITH working_periods AS (
    SELECT 
      (p_date + (periods->>'start')::time)::timestamp with time zone AS period_start,
      (p_date + (periods->>'end')::time)::timestamp with time zone AS period_end,
      d.id AS doc_id,
      d.name AS doctor_name
    FROM clinics c
    CROSS JOIN LATERAL jsonb_array_elements(c.working_hours->v_day_of_week) AS periods
    CROSS JOIN doctors d
    WHERE c.id = p_clinic_id
    AND d.clinic_id = p_clinic_id
    AND (p_doctor_id IS NULL OR d.id = p_doctor_id)
  ),
  time_slots AS (
    SELECT 
      wp.period_start + (INTERVAL '30 minutes' * slot_number) AS slot_start,
      wp.period_start + (INTERVAL '30 minutes' * (slot_number + 1)) AS slot_end,
      wp.doc_id,
      wp.doctor_name
    FROM working_periods wp
    CROSS JOIN generate_series(0, 
      EXTRACT(EPOCH FROM (wp.period_end - wp.period_start))/1800 - 1
    ) AS slot_number
    WHERE wp.period_start + (INTERVAL '30 minutes' * slot_number) >= NOW()
  ),
  booked_slots AS (
    SELECT 
      date AS start_time,
      a.doctor_id AS doc_id
    FROM appointments a
    WHERE a.clinic_id = p_clinic_id
    AND DATE(a.date) = p_date
    AND a.status NOT IN ('cancelled')
    AND (p_doctor_id IS NULL OR a.doctor_id = p_doctor_id)
  )
  SELECT 
    ts.slot_start,
    ts.slot_end,
    ts.doc_id,
    ts.doctor_name
  FROM time_slots ts
  WHERE NOT EXISTS (
    SELECT 1
    FROM booked_slots bs
    WHERE bs.doc_id = ts.doc_id
    AND bs.start_time = ts.slot_start
  )
  ORDER BY ts.slot_start, ts.doctor_name;
END;
$$;


ALTER FUNCTION "public"."get_available_slots"("p_clinic_id" "uuid", "p_date" "date", "p_doctor_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."user_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."user_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_clinic_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Remove special characters and replace spaces with hyphens
  NEW.slug := lower(regexp_replace(NEW.slug, '[^a-z0-9-]', '-', 'g'));
  -- Remove multiple consecutive hyphens
  NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
  -- Remove hyphens at the beginning and end
  NEW.slug := trim(both '-' from NEW.slug);
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_clinic_slug"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_name" "text" NOT NULL,
    "doctor_name" "text",
    "doctor_id" "uuid",
    "date" timestamp with time zone NOT NULL,
    "status" "text",
    "notes" "text",
    "type" "text",
    "clinic_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "procedure_id" "uuid",
    "payment_type" "text" DEFAULT 'private'::"text",
    "insurance_company_id" "uuid",
    "value" numeric(10,2),
    "phone" "text",
    "email" "text",
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    CONSTRAINT "appointments_payment_type_check" CHECK (("payment_type" = ANY (ARRAY['private'::"text", 'insurance'::"text"]))),
    CONSTRAINT "appointments_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'confirmed'::"text", 'completed'::"text", 'cancelled'::"text", 'no-show'::"text"]))),
    CONSTRAINT "appointments_type_check" CHECK (("type" = ANY (ARRAY['in-person'::"text", 'online'::"text"])))
);

ALTER TABLE ONLY "public"."appointments" REPLICA IDENTITY FULL;


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."archived_medical_data" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "original_table" "text" NOT NULL,
    "original_id" "uuid" NOT NULL,
    "clinic_id" "uuid",
    "archived_user_id" "uuid",
    "archived_user_data" "jsonb" NOT NULL,
    "medical_data" "jsonb" NOT NULL,
    "related_entities" "jsonb" DEFAULT '{}'::"jsonb",
    "archival_reason" "text" NOT NULL,
    "archived_by" "uuid" NOT NULL,
    "archived_at" timestamp with time zone DEFAULT "now"(),
    "legal_retention_until" "date" NOT NULL
);

ALTER TABLE ONLY "public"."archived_medical_data" REPLICA IDENTITY FULL;


ALTER TABLE "public"."archived_medical_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audiences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "filters" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "estimated_size" integer DEFAULT 0,
    "actual_size" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."audiences" REPLICA IDENTITY FULL;


ALTER TABLE "public"."audiences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cid_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."cid_codes" REPLICA IDENTITY FULL;


ALTER TABLE "public"."cid_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text",
    "logo" "text",
    "description" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "facebook_id" "text",
    "instagram_id" "text",
    "specialties" "text"[],
    "working_hours" "jsonb",
    "is_published" boolean DEFAULT false,
    "last_published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "url_format" "text" DEFAULT 'c'::"text",
    "webhook_url" "text",
    "webhook_secret" "text",
    "photo" "text",
    "email_config" "jsonb",
    CONSTRAINT "clinics_url_format_check" CHECK (("url_format" = ANY (ARRAY['c'::"text", 'direct'::"text"])))
);

ALTER TABLE ONLY "public"."clinics" REPLICA IDENTITY FULL;


ALTER TABLE "public"."clinics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dead_webhook_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "error_message" "text",
    "attempts" integer NOT NULL,
    "last_attempt" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."dead_webhook_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctor_availability" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "duration_minutes" integer DEFAULT 30 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."doctor_availability" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "speciality" "text",
    "licensenumber" "text",
    "bio" "text",
    "email" "text",
    "phone" "text",
    "clinic_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "photo_url" "text",
    "working_hours" "jsonb",
    "addresses" "jsonb" DEFAULT '[]'::"jsonb",
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "original_user_data" "jsonb"
);

ALTER TABLE ONLY "public"."doctors" REPLICA IDENTITY FULL;


ALTER TABLE "public"."doctors" OWNER TO "postgres";


COMMENT ON COLUMN "public"."doctors"."working_hours" IS 'JSON object containing doctor working hours schedule';



COMMENT ON COLUMN "public"."doctors"."addresses" IS 'Array of addresses. Each address should have: {name, address, phone, is_primary}';



CREATE TABLE IF NOT EXISTS "public"."drafts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "clinic_id" "uuid",
    "draft_key" "text" NOT NULL,
    "content" "text" NOT NULL,
    "draft_type" "text" NOT NULL,
    "related_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "drafts_draft_type_check" CHECK (("draft_type" = ANY (ARRAY['patient_record'::"text", 'appointment_note'::"text"])))
);


ALTER TABLE "public"."drafts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_automations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "trigger" "jsonb" NOT NULL,
    "email_template" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "email_automations_type_check" CHECK (("type" = ANY (ARRAY['appointment_reminder'::"text", 'birthday'::"text", 'return_visit'::"text", 'feedback'::"text"])))
);

ALTER TABLE ONLY "public"."email_automations" REPLICA IDENTITY FULL;


ALTER TABLE "public"."email_automations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "template_type" character varying(50) NOT NULL,
    "subject" character varying(255) NOT NULL,
    "html_content" "text" NOT NULL,
    "text_content" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "email_templates_template_type_check" CHECK ((("template_type")::"text" = ANY ((ARRAY['confirmation'::character varying, 'reminder'::character varying, 'cancellation'::character varying, 'reschedule'::character varying])::"text"[])))
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."financial_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "color" "text" DEFAULT '#6B7280'::"text",
    "icon" "text" DEFAULT 'wallet'::"text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "financial_categories_type_check" CHECK (("type" = ANY (ARRAY['income'::"text", 'expense'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."financial_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."financial_categories" IS 'Categories for financial transactions';



COMMENT ON COLUMN "public"."financial_categories"."type" IS 'Type of transactions this category applies to: income, expense, or both';



CREATE TABLE IF NOT EXISTS "public"."financial_forecasts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "patient_id" "uuid",
    "doctor_id" "uuid",
    "procedure_id" "uuid",
    "insurance_company_id" "uuid",
    "payment_type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "value" numeric(10,2) NOT NULL,
    "expected_payment_date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "tiss_batch_id" "uuid",
    "glosa_value" numeric(10,2) DEFAULT 0,
    "glosa_reason" "text",
    "glosa_appeal_status" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reconciled_transaction_id" "uuid",
    CONSTRAINT "financial_forecasts_glosa_appeal_status_check" CHECK (("glosa_appeal_status" = ANY (ARRAY[NULL::"text", 'pending'::"text", 'approved'::"text", 'denied'::"text"]))),
    CONSTRAINT "financial_forecasts_payment_type_check" CHECK (("payment_type" = ANY (ARRAY['private'::"text", 'insurance'::"text"]))),
    CONSTRAINT "financial_forecasts_status_check" CHECK (("status" = ANY (ARRAY['forecast'::"text", 'confirmed'::"text", 'sent'::"text", 'partial'::"text", 'paid'::"text", 'denied'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."financial_forecasts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."financial_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "cancellation_fee_percentage" integer DEFAULT 0 NOT NULL,
    "cancellation_tolerance_hours" integer DEFAULT 24 NOT NULL,
    "default_insurance_payment_term" integer DEFAULT 30 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."financial_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insurance_companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "code" character varying(20),
    "payment_term" integer DEFAULT 30 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."insurance_companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketing_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "audience_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "subject" "text",
    "content" "text",
    "scheduled_date" timestamp with time zone,
    "sent" integer DEFAULT 0,
    "opened" integer DEFAULT 0,
    "clicked" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "marketing_campaigns_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "marketing_campaigns_type_check" CHECK (("type" = ANY (ARRAY['email'::"text", 'sms'::"text"])))
);

ALTER TABLE ONLY "public"."marketing_campaigns" REPLICA IDENTITY FULL;


ALTER TABLE "public"."marketing_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medical_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointment_id" "uuid",
    "patient_id" "uuid",
    "doctor_id" "uuid",
    "clinic_id" "uuid",
    "chief_complaint" "text" NOT NULL,
    "history_present_illness" "text",
    "physical_examination" "text",
    "diagnosis" "text",
    "cid_code" "text",
    "cid_description" "text",
    "treatment_plan" "text",
    "medications" "text",
    "follow_up" "text",
    "notes" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "medical_records_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'completed'::"text", 'reviewed'::"text"])))
);

ALTER TABLE ONLY "public"."medical_records" REPLICA IDENTITY FULL;


ALTER TABLE "public"."medical_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "notification_queue_id" "uuid",
    "appointment_id" "uuid",
    "patient_id" "uuid",
    "notification_type" character varying(50) NOT NULL,
    "recipient_email" character varying(255) NOT NULL,
    "status" character varying(20) NOT NULL,
    "sent_at" timestamp with time zone NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "notification_logs_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['sent'::character varying, 'failed'::character varying, 'bounced'::character varying])::"text"[])))
);


ALTER TABLE "public"."notification_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "email_notifications" boolean DEFAULT true NOT NULL,
    "appointment_confirmations" boolean DEFAULT true NOT NULL,
    "appointment_reminders" boolean DEFAULT true NOT NULL,
    "appointment_cancellations" boolean DEFAULT true NOT NULL,
    "reminder_hours_before" integer DEFAULT 24 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "patient_id" "uuid",
    "notification_type" character varying(50) NOT NULL,
    "recipient_email" character varying(255) NOT NULL,
    "subject" character varying(255) NOT NULL,
    "html_content" "text" NOT NULL,
    "text_content" "text" NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "scheduled_for" timestamp with time zone NOT NULL,
    "sent_at" timestamp with time zone,
    "error_message" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "max_retries" integer DEFAULT 3 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "notification_queue_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."notification_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_record_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "content_before" "text",
    "content_after" "text",
    "user_id" "uuid",
    "user_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."patient_record_audit" REPLICA IDENTITY FULL;


ALTER TABLE "public"."patient_record_audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_by" "uuid",
    "created_by_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid"
);

ALTER TABLE ONLY "public"."patient_records" REPLICA IDENTITY FULL;


ALTER TABLE "public"."patient_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "birth_date" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "clinic_id" "uuid",
    "last_visit" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "cpf" "text",
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid"
);

ALTER TABLE ONLY "public"."patients" REPLICA IDENTITY FULL;


ALTER TABLE "public"."patients" OWNER TO "postgres";


COMMENT ON COLUMN "public"."patients"."status" IS 'Patient status - active or inactive';



COMMENT ON COLUMN "public"."patients"."last_visit" IS 'Date of the last visit or appointment';



COMMENT ON COLUMN "public"."patients"."cpf" IS 'Brazilian CPF (Cadastro de Pessoas Físicas) document number';



CREATE TABLE IF NOT EXISTS "public"."procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "code" character varying(20) NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "value_private" numeric(10,2) NOT NULL,
    "value_insurance" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."procedures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text",
    "email" "text",
    "phone" "text",
    "profession" "text" DEFAULT 'Médico'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."profiles" REPLICA IDENTITY FULL;


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedule_blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_datetime" timestamp with time zone NOT NULL,
    "end_datetime" timestamp with time zone NOT NULL,
    "block_type" "text" DEFAULT 'unavailable'::"text" NOT NULL,
    "is_recurring" boolean DEFAULT false,
    "recurrence_pattern" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_datetime_order" CHECK (("end_datetime" > "start_datetime")),
    CONSTRAINT "schedule_blocks_block_type_check" CHECK (("block_type" = ANY (ARRAY['unavailable'::"text", 'break'::"text", 'meeting'::"text", 'vacation'::"text", 'sick_leave'::"text", 'personal'::"text"])))
);

ALTER TABLE ONLY "public"."schedule_blocks" REPLICA IDENTITY FULL;


ALTER TABLE "public"."schedule_blocks" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedule_blocks" IS 'Schedule blocks for managing doctor availability (out of office, breaks, meetings, etc.)';



COMMENT ON COLUMN "public"."schedule_blocks"."block_type" IS 'Type of block: unavailable, break, meeting, vacation, sick_leave, personal';



COMMENT ON COLUMN "public"."schedule_blocks"."recurrence_pattern" IS 'JSON pattern for recurring blocks (frequency, days, etc.)';



CREATE TABLE IF NOT EXISTS "public"."smtp_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "host" character varying(255) NOT NULL,
    "port" integer DEFAULT 587 NOT NULL,
    "username" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "use_tls" boolean DEFAULT true NOT NULL,
    "from_email" character varying(255) NOT NULL,
    "from_name" character varying(255) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."smtp_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiss_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "batch_number" "text" NOT NULL,
    "insurance_company_id" "uuid",
    "submission_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "response_date" timestamp with time zone,
    "status" "text" NOT NULL,
    "total_value" numeric(10,2) DEFAULT 0 NOT NULL,
    "approved_value" numeric(10,2),
    "denied_value" numeric(10,2),
    "response_file_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tiss_batches_status_check" CHECK (("status" = ANY (ARRAY['preparing'::"text", 'sent'::"text", 'processed'::"text", 'finished'::"text"])))
);


ALTER TABLE "public"."tiss_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category_id" "uuid",
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['completed'::"text", 'pending'::"text"]))),
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['income'::"text", 'expense'::"text"])))
);

ALTER TABLE ONLY "public"."transactions" REPLICA IDENTITY FULL;


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "patient_id" "uuid",
    "transcription_text" "text" NOT NULL,
    "notes" "text",
    "audio_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."transcriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'patient'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "clinic_id" "uuid",
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "archival_reason" "text",
    "original_user_data" "jsonb"
);

ALTER TABLE ONLY "public"."user_roles" REPLICA IDENTITY FULL;


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_endpoints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "secret" "text",
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "event_types" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."webhook_endpoints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "last_attempt" timestamp with time zone,
    "last_response" "text",
    "http_status" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_version" "text" DEFAULT '1.0'::"text" NOT NULL,
    "trigger_source" "text" DEFAULT 'system'::"text" NOT NULL
);


ALTER TABLE "public"."webhook_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "webhook_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "response_code" integer,
    "response_body" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "next_retry_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."webhook_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_retries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "retry_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "webhook_id" "uuid"
);


ALTER TABLE "public"."webhook_retries" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."archived_medical_data"
    ADD CONSTRAINT "archived_medical_data_original_table_original_id_key" UNIQUE ("original_table", "original_id");



ALTER TABLE ONLY "public"."archived_medical_data"
    ADD CONSTRAINT "archived_medical_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audiences"
    ADD CONSTRAINT "audiences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cid_codes"
    ADD CONSTRAINT "cid_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."cid_codes"
    ADD CONSTRAINT "cid_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."dead_webhook_events"
    ADD CONSTRAINT "dead_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctor_availability"
    ADD CONSTRAINT "doctor_availability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drafts"
    ADD CONSTRAINT "drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drafts"
    ADD CONSTRAINT "drafts_user_id_draft_key_key" UNIQUE ("user_id", "draft_key");



ALTER TABLE ONLY "public"."email_automations"
    ADD CONSTRAINT "email_automations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_clinic_id_template_type_key" UNIQUE ("clinic_id", "template_type");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_categories"
    ADD CONSTRAINT "financial_categories_clinic_id_name_key" UNIQUE ("clinic_id", "name");



ALTER TABLE ONLY "public"."financial_categories"
    ADD CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_forecasts"
    ADD CONSTRAINT "financial_forecasts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_settings"
    ADD CONSTRAINT "financial_settings_clinic_id_key" UNIQUE ("clinic_id");



ALTER TABLE ONLY "public"."financial_settings"
    ADD CONSTRAINT "financial_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_companies"
    ADD CONSTRAINT "insurance_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_clinic_id_key" UNIQUE ("user_id", "clinic_id");



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_record_audit"
    ADD CONSTRAINT "patient_record_audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_records"
    ADD CONSTRAINT "patient_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedures"
    ADD CONSTRAINT "procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."schedule_blocks"
    ADD CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."smtp_config"
    ADD CONSTRAINT "smtp_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tiss_batches"
    ADD CONSTRAINT "tiss_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcriptions"
    ADD CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "unique_clinic_slug" UNIQUE ("slug");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "unique_cpf_per_clinic" UNIQUE ("cpf", "clinic_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_clinic_unique" UNIQUE ("user_id", "clinic_id");



ALTER TABLE ONLY "public"."webhook_endpoints"
    ADD CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_logs"
    ADD CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_retries"
    ADD CONSTRAINT "webhook_retries_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_appointments_archived" ON "public"."appointments" USING "btree" ("is_archived", "archived_at");



CREATE INDEX "idx_archived_medical_data_archived_user_id" ON "public"."archived_medical_data" USING "btree" ("archived_user_id");



CREATE INDEX "idx_archived_medical_data_clinic_id" ON "public"."archived_medical_data" USING "btree" ("clinic_id");



CREATE INDEX "idx_archived_medical_data_original" ON "public"."archived_medical_data" USING "btree" ("original_table", "original_id");



CREATE INDEX "idx_archived_medical_data_retention_date" ON "public"."archived_medical_data" USING "btree" ("legal_retention_until");



CREATE INDEX "idx_audiences_clinic_id" ON "public"."audiences" USING "btree" ("clinic_id");



CREATE INDEX "idx_cid_codes_code" ON "public"."cid_codes" USING "btree" ("code");



CREATE INDEX "idx_cid_codes_description" ON "public"."cid_codes" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "description"));



CREATE INDEX "idx_doctors_addresses" ON "public"."doctors" USING "gin" ("addresses");



CREATE INDEX "idx_doctors_archived" ON "public"."doctors" USING "btree" ("is_archived", "archived_at");



CREATE INDEX "idx_drafts_clinic_id" ON "public"."drafts" USING "btree" ("clinic_id");



CREATE INDEX "idx_drafts_user_id" ON "public"."drafts" USING "btree" ("user_id");



CREATE INDEX "idx_email_automations_clinic_id" ON "public"."email_automations" USING "btree" ("clinic_id");



CREATE INDEX "idx_email_templates_clinic_id" ON "public"."email_templates" USING "btree" ("clinic_id");



CREATE INDEX "idx_email_templates_type" ON "public"."email_templates" USING "btree" ("template_type");



CREATE INDEX "idx_financial_categories_clinic_id" ON "public"."financial_categories" USING "btree" ("clinic_id");



CREATE INDEX "idx_financial_categories_type" ON "public"."financial_categories" USING "btree" ("type");



CREATE INDEX "idx_marketing_campaigns_audience_id" ON "public"."marketing_campaigns" USING "btree" ("audience_id");



CREATE INDEX "idx_marketing_campaigns_clinic_id" ON "public"."marketing_campaigns" USING "btree" ("clinic_id");



CREATE INDEX "idx_medical_records_appointment_id" ON "public"."medical_records" USING "btree" ("appointment_id");



CREATE INDEX "idx_medical_records_cid_code" ON "public"."medical_records" USING "btree" ("cid_code");



CREATE INDEX "idx_medical_records_clinic_id" ON "public"."medical_records" USING "btree" ("clinic_id");



CREATE INDEX "idx_medical_records_doctor_id" ON "public"."medical_records" USING "btree" ("doctor_id");



CREATE INDEX "idx_medical_records_patient_id" ON "public"."medical_records" USING "btree" ("patient_id");



CREATE INDEX "idx_notification_logs_clinic_id" ON "public"."notification_logs" USING "btree" ("clinic_id");



CREATE INDEX "idx_notification_logs_sent_at" ON "public"."notification_logs" USING "btree" ("sent_at");



CREATE INDEX "idx_notification_preferences_user_clinic" ON "public"."notification_preferences" USING "btree" ("user_id", "clinic_id");



CREATE INDEX "idx_notification_queue_clinic_id" ON "public"."notification_queue" USING "btree" ("clinic_id");



CREATE INDEX "idx_notification_queue_scheduled" ON "public"."notification_queue" USING "btree" ("scheduled_for");



CREATE INDEX "idx_notification_queue_status" ON "public"."notification_queue" USING "btree" ("status");



CREATE INDEX "idx_patient_record_audit_record_id" ON "public"."patient_record_audit" USING "btree" ("record_id");



CREATE INDEX "idx_patient_records_archived" ON "public"."patient_records" USING "btree" ("is_archived", "archived_at");



CREATE INDEX "idx_patient_records_patient_id" ON "public"."patient_records" USING "btree" ("patient_id");



CREATE INDEX "idx_patients_archived" ON "public"."patients" USING "btree" ("is_archived", "archived_at");



CREATE INDEX "idx_patients_cpf" ON "public"."patients" USING "btree" ("cpf");



CREATE INDEX "idx_patients_status" ON "public"."patients" USING "btree" ("status");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_schedule_blocks_clinic_id" ON "public"."schedule_blocks" USING "btree" ("clinic_id");



CREATE INDEX "idx_schedule_blocks_datetime" ON "public"."schedule_blocks" USING "btree" ("start_datetime", "end_datetime");



CREATE INDEX "idx_schedule_blocks_doctor_id" ON "public"."schedule_blocks" USING "btree" ("doctor_id");



CREATE INDEX "idx_schedule_blocks_type" ON "public"."schedule_blocks" USING "btree" ("block_type");



CREATE INDEX "idx_smtp_config_clinic_id" ON "public"."smtp_config" USING "btree" ("clinic_id");



CREATE INDEX "idx_transactions_category_id" ON "public"."transactions" USING "btree" ("category_id");



CREATE INDEX "idx_user_roles_archived" ON "public"."user_roles" USING "btree" ("is_archived", "archived_at");



CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "clinic_slug_validation" BEFORE INSERT OR UPDATE OF "slug" ON "public"."clinics" FOR EACH ROW EXECUTE FUNCTION "public"."validate_clinic_slug"();



CREATE OR REPLACE TRIGGER "ensure_unique_slug" BEFORE INSERT OR UPDATE ON "public"."clinics" FOR EACH ROW EXECUTE FUNCTION "public"."generate_unique_slug"();



CREATE OR REPLACE TRIGGER "generate_clinic_slug" BEFORE INSERT OR UPDATE ON "public"."clinics" FOR EACH ROW WHEN ((("new"."slug" IS NULL) OR ("new"."slug" = ''::"text"))) EXECUTE FUNCTION "public"."generate_unique_slug"();



CREATE OR REPLACE TRIGGER "set_transcriptions_updated_at" BEFORE UPDATE ON "public"."transcriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_assign_owner_role" AFTER INSERT ON "public"."clinics" FOR EACH ROW EXECUTE FUNCTION "public"."assign_owner_role"();



CREATE OR REPLACE TRIGGER "trigger_audiences_updated_at" BEFORE UPDATE ON "public"."audiences" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_email_automations_updated_at" BEFORE UPDATE ON "public"."email_automations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_marketing_campaigns_updated_at" BEFORE UPDATE ON "public"."marketing_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_doctor_availability_updated_at" BEFORE UPDATE ON "public"."doctor_availability" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_templates_updated_at" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_financial_forecasts_updated_at" BEFORE UPDATE ON "public"."financial_forecasts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_financial_settings_updated_at" BEFORE UPDATE ON "public"."financial_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_insurance_companies_updated_at" BEFORE UPDATE ON "public"."insurance_companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_queue_updated_at" BEFORE UPDATE ON "public"."notification_queue" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_procedures_updated_at" BEFORE UPDATE ON "public"."procedures" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_smtp_config_updated_at" BEFORE UPDATE ON "public"."smtp_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tiss_batches_updated_at" BEFORE UPDATE ON "public"."tiss_batches" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_clinic_slug" BEFORE INSERT OR UPDATE ON "public"."clinics" FOR EACH ROW WHEN ((("new"."slug" IS NOT NULL) AND ("new"."slug" <> ''::"text"))) EXECUTE FUNCTION "public"."validate_clinic_slug"();



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_insurance_company_id_fkey" FOREIGN KEY ("insurance_company_id") REFERENCES "public"."insurance_companies"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id");



ALTER TABLE ONLY "public"."archived_medical_data"
    ADD CONSTRAINT "archived_medical_data_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."archived_medical_data"
    ADD CONSTRAINT "archived_medical_data_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."audiences"
    ADD CONSTRAINT "audiences_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."doctor_availability"
    ADD CONSTRAINT "doctor_availability_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."doctor_availability"
    ADD CONSTRAINT "doctor_availability_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."drafts"
    ADD CONSTRAINT "drafts_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drafts"
    ADD CONSTRAINT "drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_automations"
    ADD CONSTRAINT "email_automations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."financial_categories"
    ADD CONSTRAINT "financial_categories_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."financial_forecasts"
    ADD CONSTRAINT "financial_forecasts_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."financial_forecasts"
    ADD CONSTRAINT "financial_forecasts_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."financial_forecasts"
    ADD CONSTRAINT "financial_forecasts_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id");



ALTER TABLE ONLY "public"."financial_forecasts"
    ADD CONSTRAINT "financial_forecasts_insurance_company_id_fkey" FOREIGN KEY ("insurance_company_id") REFERENCES "public"."insurance_companies"("id");



ALTER TABLE ONLY "public"."financial_forecasts"
    ADD CONSTRAINT "financial_forecasts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id");



ALTER TABLE ONLY "public"."financial_forecasts"
    ADD CONSTRAINT "financial_forecasts_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id");



ALTER TABLE ONLY "public"."financial_settings"
    ADD CONSTRAINT "financial_settings_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."insurance_companies"
    ADD CONSTRAINT "insurance_companies_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_audience_id_fkey" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_notification_queue_id_fkey" FOREIGN KEY ("notification_queue_id") REFERENCES "public"."notification_queue"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_record_audit"
    ADD CONSTRAINT "patient_record_audit_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."patient_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_records"
    ADD CONSTRAINT "patient_records_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_records"
    ADD CONSTRAINT "patient_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."procedures"
    ADD CONSTRAINT "procedures_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."schedule_blocks"
    ADD CONSTRAINT "schedule_blocks_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_blocks"
    ADD CONSTRAINT "schedule_blocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."schedule_blocks"
    ADD CONSTRAINT "schedule_blocks_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."smtp_config"
    ADD CONSTRAINT "smtp_config_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tiss_batches"
    ADD CONSTRAINT "tiss_batches_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."tiss_batches"
    ADD CONSTRAINT "tiss_batches_insurance_company_id_fkey" FOREIGN KEY ("insurance_company_id") REFERENCES "public"."insurance_companies"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."financial_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."transcriptions"
    ADD CONSTRAINT "transcriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcriptions"
    ADD CONSTRAINT "transcriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webhook_endpoints"
    ADD CONSTRAINT "webhook_endpoints_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."webhook_retries"
    ADD CONSTRAINT "webhook_retries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."webhook_events"("id");



CREATE POLICY "Admins can manage categories" ON "public"."financial_categories" USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'owner'::"public"."user_role"]))))));



CREATE POLICY "Admins can manage email templates" ON "public"."email_templates" USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage notification queue" ON "public"."notification_queue" USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage smtp config" ON "public"."smtp_config" USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view webhook events for their clinic" ON "public"."webhook_events" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated users to manage roles" ON "public"."user_roles" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Clinic admins can access archived medical data" ON "public"."archived_medical_data" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."clinic_id" = "archived_medical_data"."clinic_id") AND ("ur"."role" = ANY (ARRAY['owner'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Clinic owners can delete webhook endpoints" ON "public"."webhook_endpoints" FOR DELETE USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "webhook_endpoints"."clinic_id"))));



CREATE POLICY "Clinic owners can insert webhook endpoints" ON "public"."webhook_endpoints" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "webhook_endpoints"."clinic_id"))));



CREATE POLICY "Clinic owners can insert webhook events" ON "public"."webhook_events" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "webhook_events"."clinic_id"))));



CREATE POLICY "Clinic owners can insert webhook retries" ON "public"."webhook_retries" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "c"."owner_id"
   FROM ("public"."clinics" "c"
     JOIN "public"."webhook_events" "e" ON (("e"."clinic_id" = "c"."id")))
  WHERE ("e"."id" = "webhook_retries"."event_id"))));



CREATE POLICY "Clinic owners can update webhook endpoints" ON "public"."webhook_endpoints" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "webhook_endpoints"."clinic_id"))));



CREATE POLICY "Clinic owners can update webhook events" ON "public"."webhook_events" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "webhook_events"."clinic_id"))));



CREATE POLICY "Clinic owners can update webhook retries" ON "public"."webhook_retries" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "c"."owner_id"
   FROM ("public"."clinics" "c"
     JOIN "public"."webhook_events" "e" ON (("e"."clinic_id" = "c"."id")))
  WHERE ("e"."id" = "webhook_retries"."event_id"))));



CREATE POLICY "Clinic owners can view their dead webhook events" ON "public"."dead_webhook_events" FOR SELECT USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "dead_webhook_events"."clinic_id"))));



CREATE POLICY "Clinic owners can view their webhook endpoints" ON "public"."webhook_endpoints" FOR SELECT USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "webhook_endpoints"."clinic_id"))));



CREATE POLICY "Clinic owners can view their webhook events" ON "public"."webhook_events" FOR SELECT USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "webhook_events"."clinic_id"))));



CREATE POLICY "Clinic owners can view their webhook logs" ON "public"."webhook_logs" FOR SELECT USING (("auth"."uid"() IN ( SELECT "c"."owner_id"
   FROM ("public"."clinics" "c"
     JOIN "public"."webhook_endpoints" "w" ON (("w"."clinic_id" = "c"."id")))
  WHERE ("w"."id" = "webhook_logs"."webhook_id"))));



CREATE POLICY "Clinic owners can view their webhook retries" ON "public"."webhook_retries" FOR SELECT USING (("auth"."uid"() IN ( SELECT "c"."owner_id"
   FROM ("public"."clinics" "c"
     JOIN "public"."webhook_events" "e" ON (("e"."clinic_id" = "c"."id")))
  WHERE ("e"."id" = "webhook_retries"."event_id"))));



CREATE POLICY "Doctors can create their own transcriptions" ON "public"."transcriptions" FOR INSERT WITH CHECK (("auth"."uid"() = "doctor_id"));



CREATE POLICY "Doctors can delete their own transcriptions" ON "public"."transcriptions" FOR DELETE USING (("auth"."uid"() = "doctor_id"));



CREATE POLICY "Doctors can update their own transcriptions" ON "public"."transcriptions" FOR UPDATE USING (("auth"."uid"() = "doctor_id"));



CREATE POLICY "Doctors can view their own transcriptions" ON "public"."transcriptions" FOR SELECT USING (("auth"."uid"() = "doctor_id"));



CREATE POLICY "Enable delete for authenticated users" ON "public"."medical_records" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable delete for authenticated users" ON "public"."schedule_blocks" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable insert for authenticated users" ON "public"."medical_records" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable insert for authenticated users" ON "public"."schedule_blocks" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read access for authenticated users" ON "public"."cid_codes" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read access for authenticated users" ON "public"."medical_records" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read access for authenticated users" ON "public"."schedule_blocks" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable update for authenticated users" ON "public"."medical_records" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable update for authenticated users" ON "public"."schedule_blocks" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir DELETE em patients para usuários autenticados" ON "public"."patients" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Permitir INSERT em patients para usuários autenticados" ON "public"."patients" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Permitir SELECT em patients para usuários autenticados" ON "public"."patients" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Permitir UPDATE em patients para usuários autenticados" ON "public"."patients" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Service role can access dead webhook events" ON "public"."dead_webhook_events" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can access webhook endpoints" ON "public"."webhook_endpoints" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can access webhook events" ON "public"."webhook_events" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can access webhook logs" ON "public"."webhook_logs" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can access webhook retries" ON "public"."webhook_retries" USING (true) WITH CHECK (true);



CREATE POLICY "Users can access audiences from their clinics" ON "public"."audiences" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can access automations from their clinics" ON "public"."email_automations" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can access campaigns from their clinics" ON "public"."marketing_campaigns" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete own clinic appointments" ON "public"."appointments" FOR DELETE USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete own clinic doctors" ON "public"."doctors" FOR DELETE USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete transactions for their own clinic" ON "public"."transactions" FOR DELETE USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own clinic appointments" ON "public"."appointments" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own clinic doctors" ON "public"."doctors" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert transactions for their own clinic" ON "public"."transactions" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their notification preferences" ON "public"."notification_preferences" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own drafts" ON "public"."drafts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own clinic appointments" ON "public"."appointments" FOR UPDATE USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can update own clinic doctors" ON "public"."doctors" FOR UPDATE USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update transactions for their own clinic" ON "public"."transactions" FOR UPDATE USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can view categories for their clinics" ON "public"."financial_categories" FOR SELECT USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE ("user_roles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view email templates for their clinics" ON "public"."email_templates" FOR SELECT USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE ("user_roles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view notification logs for their clinics" ON "public"."notification_logs" FOR SELECT USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE ("user_roles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view notification queue for their clinics" ON "public"."notification_queue" FOR SELECT USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE ("user_roles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own clinic appointments" ON "public"."appointments" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own clinic doctors" ON "public"."doctors" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view smtp config for their clinics" ON "public"."smtp_config" FOR SELECT USING (("clinic_id" IN ( SELECT "user_roles"."clinic_id"
   FROM "public"."user_roles"
  WHERE ("user_roles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their notification preferences" ON "public"."notification_preferences" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own clinic's transactions" ON "public"."transactions" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Usuários autenticados podem adicionar pacientes" ON "public"."patients" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "patients"."clinic_id"))));



CREATE POLICY "Usuários autenticados podem atualizar pacientes" ON "public"."patients" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "patients"."clinic_id"))));



CREATE POLICY "Usuários autenticados podem excluir pacientes" ON "public"."patients" FOR DELETE USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "patients"."clinic_id"))));



CREATE POLICY "Usuários autenticados podem visualizar pacientes" ON "public"."patients" FOR SELECT USING (("auth"."uid"() IN ( SELECT "clinics"."owner_id"
   FROM "public"."clinics"
  WHERE ("clinics"."id" = "patients"."clinic_id"))));



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."archived_medical_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audiences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cid_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dead_webhook_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."doctor_availability" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."doctors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_automations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."financial_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."financial_forecasts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."financial_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."insurance_companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marketing_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medical_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_record_audit" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "patient_record_audit_all_authenticated" ON "public"."patient_record_audit" USING (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."patient_records" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "patient_records_all_authenticated" ON "public"."patient_records" USING (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_blocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."smtp_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiss_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_roles_delete_authenticated" ON "public"."user_roles" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "user_roles_insert_authenticated" ON "public"."user_roles" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "user_roles_read_authenticated" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "user_roles_update_authenticated" ON "public"."user_roles" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "users_can_create_clinics" ON "public"."clinics" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "users_delete_own_clinics" ON "public"."clinics" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "users_see_own_clinics" ON "public"."clinics" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "users_update_own_clinics" ON "public"."clinics" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "owner_id")) WITH CHECK (("auth"."uid"() = "owner_id"));



ALTER TABLE "public"."webhook_endpoints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_retries" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."appointments";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."clinics";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."doctors";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."patients";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."transactions";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."archive_user_medical_data"("target_user_id" "uuid", "target_clinic_id" "uuid", "archival_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."archive_user_medical_data"("target_user_id" "uuid", "target_clinic_id" "uuid", "archival_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_user_medical_data"("target_user_id" "uuid", "target_clinic_id" "uuid", "archival_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_owner_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."assign_owner_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_owner_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_delete_archived_data"("archived_data_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_delete_archived_data"("archived_data_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_delete_archived_data"("archived_data_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_schedule_conflict"("p_doctor_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_exclude_block_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_schedule_conflict"("p_doctor_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_exclude_block_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_schedule_conflict"("p_doctor_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_exclude_block_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_expired_archived_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_expired_archived_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_expired_archived_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_available_slots"("p_clinic_id" "uuid", "p_date" "date", "p_doctor_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_available_slots"("p_clinic_id" "uuid", "p_date" "date", "p_doctor_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_slots"("p_clinic_id" "uuid", "p_date" "date", "p_doctor_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."user_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."user_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_clinic_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_clinic_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_clinic_slug"() TO "service_role";


















GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."archived_medical_data" TO "anon";
GRANT ALL ON TABLE "public"."archived_medical_data" TO "authenticated";
GRANT ALL ON TABLE "public"."archived_medical_data" TO "service_role";



GRANT ALL ON TABLE "public"."audiences" TO "anon";
GRANT ALL ON TABLE "public"."audiences" TO "authenticated";
GRANT ALL ON TABLE "public"."audiences" TO "service_role";



GRANT ALL ON TABLE "public"."cid_codes" TO "anon";
GRANT ALL ON TABLE "public"."cid_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."cid_codes" TO "service_role";



GRANT ALL ON TABLE "public"."clinics" TO "authenticated";
GRANT ALL ON TABLE "public"."clinics" TO "service_role";



GRANT ALL ON TABLE "public"."dead_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."dead_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."dead_webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."doctor_availability" TO "anon";
GRANT ALL ON TABLE "public"."doctor_availability" TO "authenticated";
GRANT ALL ON TABLE "public"."doctor_availability" TO "service_role";



GRANT ALL ON TABLE "public"."doctors" TO "anon";
GRANT ALL ON TABLE "public"."doctors" TO "authenticated";
GRANT ALL ON TABLE "public"."doctors" TO "service_role";



GRANT ALL ON TABLE "public"."drafts" TO "anon";
GRANT ALL ON TABLE "public"."drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."drafts" TO "service_role";



GRANT ALL ON TABLE "public"."email_automations" TO "anon";
GRANT ALL ON TABLE "public"."email_automations" TO "authenticated";
GRANT ALL ON TABLE "public"."email_automations" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."financial_categories" TO "anon";
GRANT ALL ON TABLE "public"."financial_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_categories" TO "service_role";



GRANT ALL ON TABLE "public"."financial_forecasts" TO "anon";
GRANT ALL ON TABLE "public"."financial_forecasts" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_forecasts" TO "service_role";



GRANT ALL ON TABLE "public"."financial_settings" TO "anon";
GRANT ALL ON TABLE "public"."financial_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_settings" TO "service_role";



GRANT ALL ON TABLE "public"."insurance_companies" TO "anon";
GRANT ALL ON TABLE "public"."insurance_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance_companies" TO "service_role";



GRANT ALL ON TABLE "public"."marketing_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."marketing_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."marketing_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."medical_records" TO "anon";
GRANT ALL ON TABLE "public"."medical_records" TO "authenticated";
GRANT ALL ON TABLE "public"."medical_records" TO "service_role";



GRANT ALL ON TABLE "public"."notification_logs" TO "anon";
GRANT ALL ON TABLE "public"."notification_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_logs" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notification_queue" TO "anon";
GRANT ALL ON TABLE "public"."notification_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_queue" TO "service_role";



GRANT ALL ON TABLE "public"."patient_record_audit" TO "anon";
GRANT ALL ON TABLE "public"."patient_record_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_record_audit" TO "service_role";



GRANT ALL ON TABLE "public"."patient_records" TO "anon";
GRANT ALL ON TABLE "public"."patient_records" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_records" TO "service_role";



GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";



GRANT ALL ON TABLE "public"."procedures" TO "anon";
GRANT ALL ON TABLE "public"."procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."procedures" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_blocks" TO "anon";
GRANT ALL ON TABLE "public"."schedule_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."smtp_config" TO "anon";
GRANT ALL ON TABLE "public"."smtp_config" TO "authenticated";
GRANT ALL ON TABLE "public"."smtp_config" TO "service_role";



GRANT ALL ON TABLE "public"."tiss_batches" TO "anon";
GRANT ALL ON TABLE "public"."tiss_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."tiss_batches" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."transcriptions" TO "anon";
GRANT ALL ON TABLE "public"."transcriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."transcriptions" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_endpoints" TO "anon";
GRANT ALL ON TABLE "public"."webhook_endpoints" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_endpoints" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_logs" TO "anon";
GRANT ALL ON TABLE "public"."webhook_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_logs" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_retries" TO "anon";
GRANT ALL ON TABLE "public"."webhook_retries" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_retries" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
