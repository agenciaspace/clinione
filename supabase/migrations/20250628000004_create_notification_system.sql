-- Create notification system tables

-- Create smtp_config table
CREATE TABLE IF NOT EXISTS public.smtp_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 587,
  username TEXT NOT NULL,
  password TEXT NOT NULL, -- This should be encrypted in production
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  secure BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_confirmations BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  appointment_cancellations BOOLEAN DEFAULT true,
  appointment_reschedules BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT false,
  financial_reports BOOLEAN DEFAULT true,
  push_new_appointments BOOLEAN DEFAULT true,
  push_cancellations BOOLEAN DEFAULT true,
  push_patient_messages BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '18:00',
  quiet_hours_end TIME DEFAULT '08:00',
  weekend_quiet BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, user_id)
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('appointment_confirmation', 'appointment_reminder', 'appointment_cancellation', 'appointment_reschedule', 'welcome', 'password_reset')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Available variables for the template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, template_type)
);

-- Create notification_queue table
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES public.notification_queue(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('queued', 'sent', 'failed', 'bounced', 'opened', 'clicked')),
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_smtp_config_clinic_id ON public.smtp_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_clinic_id ON public.notification_preferences(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_clinic_id ON public.email_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_notification_queue_clinic_id ON public.notification_queue(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for ON public.notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_logs_clinic_id ON public.notification_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON public.notification_logs(notification_id);

-- Enable RLS on all tables
ALTER TABLE public.smtp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- SMTP Config
CREATE POLICY "Users can manage their clinic's SMTP config" ON public.smtp_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.clinic_id = smtp_config.clinic_id 
      AND ur.role IN ('owner', 'admin')
    )
  );

-- Notification Preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.clinic_id = notification_preferences.clinic_id 
      AND ur.role IN ('owner', 'admin')
    )
  );

-- Email Templates
CREATE POLICY "Users can manage their clinic's email templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.clinic_id = email_templates.clinic_id 
      AND ur.role IN ('owner', 'admin')
    )
  );

-- Notification Queue
CREATE POLICY "Users can view their clinic's notification queue" ON public.notification_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.clinic_id = notification_queue.clinic_id
    )
  );

-- Notification Logs
CREATE POLICY "Users can view their clinic's notification logs" ON public.notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.clinic_id = notification_logs.clinic_id
    )
  );

-- Enable realtime for notification queue and logs
ALTER TABLE public.notification_queue REPLICA IDENTITY FULL;
ALTER TABLE public.notification_logs REPLICA IDENTITY FULL;

-- Insert default email templates
INSERT INTO public.email_templates (clinic_id, template_type, subject, html_content, text_content, variables) 
SELECT 
  c.id,
  template_data.template_type,
  template_data.subject,
  template_data.html_content,
  template_data.text_content,
  template_data.variables::jsonb
FROM public.clinics c
CROSS JOIN (
  VALUES 
    (
      'appointment_confirmation',
      'Confirmação de Agendamento - {{clinic_name}}',
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Confirmação de Agendamento</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #2563eb;">Agendamento Confirmado!</h2><p>Olá <strong>{{patient_name}}</strong>,</p><p>Seu agendamento foi confirmado com sucesso:</p><div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Clínica:</strong> {{clinic_name}}</p><p><strong>Profissional:</strong> {{doctor_name}}</p><p><strong>Data:</strong> {{appointment_date}}</p><p><strong>Horário:</strong> {{appointment_time}}</p><p><strong>Tipo:</strong> {{appointment_type}}</p></div><p>Em caso de dúvidas, entre em contato conosco:</p><p><strong>Telefone:</strong> {{clinic_phone}}<br><strong>Email:</strong> {{clinic_email}}</p><p>Atenciosamente,<br>{{clinic_name}}</p></div></body></html>',
      'Agendamento Confirmado!\n\nOlá {{patient_name}},\n\nSeu agendamento foi confirmado:\n\nClínica: {{clinic_name}}\nProfissional: {{doctor_name}}\nData: {{appointment_date}}\nHorário: {{appointment_time}}\nTipo: {{appointment_type}}\n\nContato: {{clinic_phone}} | {{clinic_email}}\n\nAtenciosamente,\n{{clinic_name}}',
      '["patient_name", "clinic_name", "doctor_name", "appointment_date", "appointment_time", "appointment_type", "clinic_phone", "clinic_email"]'
    ),
    (
      'appointment_reminder',
      'Lembrete: Consulta Amanhã - {{clinic_name}}',
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lembrete de Consulta</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f59e0b;">Lembrete de Consulta</h2><p>Olá <strong>{{patient_name}}</strong>,</p><p>Este é um lembrete de que você tem uma consulta agendada:</p><div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Clínica:</strong> {{clinic_name}}</p><p><strong>Profissional:</strong> {{doctor_name}}</p><p><strong>Data:</strong> {{appointment_date}}</p><p><strong>Horário:</strong> {{appointment_time}}</p><p><strong>Endereço:</strong> {{clinic_address}}</p></div><p>Por favor, chegue com 15 minutos de antecedência.</p><p>Para cancelar ou reagendar, entre em contato:</p><p><strong>Telefone:</strong> {{clinic_phone}}<br><strong>Email:</strong> {{clinic_email}}</p><p>Atenciosamente,<br>{{clinic_name}}</p></div></body></html>',
      'Lembrete de Consulta\n\nOlá {{patient_name}},\n\nVocê tem uma consulta agendada:\n\nClínica: {{clinic_name}}\nProfissional: {{doctor_name}}\nData: {{appointment_date}}\nHorário: {{appointment_time}}\nEndereço: {{clinic_address}}\n\nChegue com 15 minutos de antecedência.\n\nContato: {{clinic_phone}} | {{clinic_email}}\n\nAtenciosamente,\n{{clinic_name}}',
      '["patient_name", "clinic_name", "doctor_name", "appointment_date", "appointment_time", "clinic_address", "clinic_phone", "clinic_email"]'
    ),
    (
      'appointment_cancellation',
      'Cancelamento de Consulta - {{clinic_name}}',
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cancelamento de Consulta</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #dc2626;">Consulta Cancelada</h2><p>Olá <strong>{{patient_name}}</strong>,</p><p>Informamos que sua consulta foi cancelada:</p><div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Clínica:</strong> {{clinic_name}}</p><p><strong>Profissional:</strong> {{doctor_name}}</p><p><strong>Data:</strong> {{appointment_date}}</p><p><strong>Horário:</strong> {{appointment_time}}</p></div><p>Para reagendar sua consulta, entre em contato conosco:</p><p><strong>Telefone:</strong> {{clinic_phone}}<br><strong>Email:</strong> {{clinic_email}}</p><p>Atenciosamente,<br>{{clinic_name}}</p></div></body></html>',
      'Consulta Cancelada\n\nOlá {{patient_name}},\n\nSua consulta foi cancelada:\n\nClínica: {{clinic_name}}\nProfissional: {{doctor_name}}\nData: {{appointment_date}}\nHorário: {{appointment_time}}\n\nPara reagendar: {{clinic_phone}} | {{clinic_email}}\n\nAtenciosamente,\n{{clinic_name}}',
      '["patient_name", "clinic_name", "doctor_name", "appointment_date", "appointment_time", "clinic_phone", "clinic_email"]'
    )
) AS template_data(template_type, subject, html_content, text_content, variables)
ON CONFLICT (clinic_id, template_type) DO NOTHING; 