-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_available_slots(uuid, date, uuid);

-- Create the get_available_slots function
CREATE OR REPLACE FUNCTION get_available_slots(
  p_clinic_id UUID,
  p_date DATE,
  p_doctor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  doctor_id UUID,
  doctor_name TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_clinic_working_hours JSONB;
  v_doctor_working_hours JSONB;
  v_working_hours JSONB;
  v_day_name TEXT;
  v_day_hours JSONB;
  v_slot_start TIME;
  v_slot_end TIME;
  v_current_time TIMESTAMP;
  v_doctor RECORD;
BEGIN
  -- Get the day name in English lowercase
  v_day_name := LOWER(TO_CHAR(p_date, 'Day'));
  v_day_name := TRIM(v_day_name);
  
  -- Get clinic working hours as fallback
  SELECT working_hours INTO v_clinic_working_hours
  FROM clinics
  WHERE id = p_clinic_id;
  
  -- For each doctor in the clinic (or specific doctor if provided)
  FOR v_doctor IN 
    SELECT d.id, d.name, d.working_hours 
    FROM doctors d
    WHERE d.clinic_id = p_clinic_id
      AND (p_doctor_id IS NULL OR d.id = p_doctor_id)
  LOOP
    -- Use doctor's individual working hours if available, otherwise use clinic hours
    IF v_doctor.working_hours IS NOT NULL THEN
      v_working_hours := v_doctor.working_hours;
    ELSE
      v_working_hours := v_clinic_working_hours;
    END IF;
    
    -- Skip if no working hours defined
    IF v_working_hours IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Get working hours for the specific day
    v_day_hours := v_working_hours->v_day_name;
    
    -- Skip if no hours for this day or day is closed
    IF v_day_hours IS NULL OR jsonb_array_length(v_day_hours) = 0 THEN
      CONTINUE;
    END IF;
    
    -- For each working period in the day
    FOR i IN 0..jsonb_array_length(v_day_hours) - 1 LOOP
      v_slot_start := (v_day_hours->i->>'start')::TIME;
      v_slot_end := (v_day_hours->i->>'end')::TIME;
      
      -- Generate 30-minute slots using a different approach
      v_current_time := p_date + v_slot_start;
      
      LOOP
        -- Exit if we've reached the end time
        EXIT WHEN v_current_time + INTERVAL '30 minutes' > p_date + v_slot_end;
        
        -- Check if slot is in the future
        IF v_current_time > NOW() THEN
          -- Check if slot is not already booked
          IF NOT EXISTS (
            SELECT 1 
            FROM appointments a
            WHERE a.clinic_id = p_clinic_id
              AND a.doctor_id = v_doctor.id
              AND a.date >= v_current_time
              AND a.date < v_current_time + INTERVAL '30 minutes'
              AND a.status NOT IN ('cancelled')
          ) THEN
            -- Return the available slot
            start_time := v_current_time;
            end_time := v_current_time + INTERVAL '30 minutes';
            doctor_id := v_doctor.id;
            doctor_name := v_doctor.name;
            RETURN NEXT;
          END IF;
        END IF;
        
        v_current_time := v_current_time + INTERVAL '30 minutes';
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_available_slots(UUID, DATE, UUID) TO authenticated;

-- Add comment to the function
COMMENT ON FUNCTION get_available_slots(UUID, DATE, UUID) IS 
'Returns available appointment slots for a clinic on a specific date, optionally filtered by doctor'; 