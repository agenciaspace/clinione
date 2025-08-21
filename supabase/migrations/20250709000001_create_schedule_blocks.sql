-- Create schedule blocks table for doctor availability management
-- This allows doctors to block specific time periods (like "out of office" in Google Calendar)

CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'unavailable' CHECK (block_type IN ('unavailable', 'break', 'lunch', 'meeting', 'conference', 'training', 'vacation', 'sick_leave', 'personal', 'emergency', 'travel', 'maintenance')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- For recurring blocks (daily, weekly, monthly)
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_doctor_id ON public.schedule_blocks(doctor_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_clinic_id ON public.schedule_blocks(clinic_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_datetime ON public.schedule_blocks(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_type ON public.schedule_blocks(block_type);

-- Add constraint to ensure end_datetime is after start_datetime
ALTER TABLE public.schedule_blocks 
ADD CONSTRAINT check_datetime_order 
CHECK (end_datetime > start_datetime);

-- Enable RLS
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.schedule_blocks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.schedule_blocks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.schedule_blocks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.schedule_blocks
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Enable realtime
ALTER TABLE public.schedule_blocks REPLICA IDENTITY FULL;

-- Add comments
COMMENT ON TABLE public.schedule_blocks IS 'Schedule blocks for managing doctor availability (out of office, breaks, meetings, etc.)';
COMMENT ON COLUMN public.schedule_blocks.block_type IS 'Type of block: unavailable, break, lunch, meeting, conference, training, vacation, sick_leave, personal, emergency, travel, maintenance';
COMMENT ON COLUMN public.schedule_blocks.recurrence_pattern IS 'JSON pattern for recurring blocks (frequency, days, etc.)';

-- Create function to check for schedule conflicts
CREATE OR REPLACE FUNCTION check_schedule_conflict(
  p_doctor_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_exclude_block_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;