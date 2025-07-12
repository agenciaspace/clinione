-- Create drafts table for auto-save functionality
-- This table stores draft versions of medical records and appointment notes

CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  draft_key TEXT NOT NULL, -- Unique key to identify the draft (e.g., 'medical_record_123', 'appointment_note_456')
  content TEXT NOT NULL,
  draft_type TEXT NOT NULL CHECK (draft_type IN ('patient_record', 'appointment_note')),
  related_id UUID, -- ID of the related record (patient_id or appointment_id)
  metadata JSONB DEFAULT '{}', -- Additional metadata like title, patient info, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one draft per user per draft_key
  UNIQUE(user_id, draft_key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON public.drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_clinic_id ON public.drafts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_drafts_draft_key ON public.drafts(draft_key);
CREATE INDEX IF NOT EXISTS idx_drafts_type ON public.drafts(draft_type);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON public.drafts(updated_at);

-- Enable RLS
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own drafts" ON public.drafts
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.drafts REPLICA IDENTITY FULL;

-- Function to automatically delete old drafts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_drafts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.drafts 
  WHERE updated_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a scheduled job to run cleanup (if pg_cron extension is available)
-- This will be handled by the application instead of database triggers