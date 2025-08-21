-- RLS policies for financial_settings to allow clinic owners/admins to read and manage settings

-- Ensure RLS is enabled
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;

-- Clean up old policies if they exist
DROP POLICY IF EXISTS "Users can read financial settings in their clinic" ON public.financial_settings;
DROP POLICY IF EXISTS "Owners and admins can insert financial settings for their clinic" ON public.financial_settings;
DROP POLICY IF EXISTS "Owners and admins can update financial settings for their clinic" ON public.financial_settings;

-- Read policy: owners/admins of the same clinic can read
CREATE POLICY "Users can read financial settings in their clinic" ON public.financial_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.clinic_id = financial_settings.clinic_id
        AND ur.role IN ('owner', 'admin')
    )
  );

-- Insert policy: owners/admins can create settings for their clinic
CREATE POLICY "Owners and admins can insert financial settings for their clinic" ON public.financial_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.clinic_id = clinic_id
        AND ur.role IN ('owner', 'admin')
    )
  );

-- Update policy: owners/admins can update settings of their clinic
CREATE POLICY "Owners and admins can update financial settings for their clinic" ON public.financial_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.clinic_id = financial_settings.clinic_id
        AND ur.role IN ('owner', 'admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.clinic_id = financial_settings.clinic_id
        AND ur.role IN ('owner', 'admin')
    )
  );

-- Note: table has UNIQUE(clinic_id) constraint; client code handles first-time creation when SELECT returns 406

