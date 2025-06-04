
-- Fix the get_available_slots function to resolve the generate_series issue
CREATE OR REPLACE FUNCTION public.get_available_slots(p_clinic_id uuid, p_date date, p_doctor_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(start_time timestamp with time zone, end_time timestamp with time zone, doctor_id uuid, doctor_name text)
 LANGUAGE plpgsql
AS $function$
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
$function$;
