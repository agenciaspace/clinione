-- Create doctor-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'doctor-photos',
  'doctor-photos',
  true,
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Create RLS policies for doctor-photos bucket
CREATE POLICY "Anyone can view doctor photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctor-photos');

CREATE POLICY "Authenticated users can upload doctor photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'doctor-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own doctor photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'doctor-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own doctor photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'doctor-photos' 
    AND auth.role() = 'authenticated'
  );
