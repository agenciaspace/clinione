import { supabase } from '@/integrations/supabase/client';

export interface SMTPConfig {
  id?: string;
  clinic_id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  secure: boolean;
  is_active: boolean;
}

export interface NotificationPreferences {
  id?: string;
  clinic_id: string;
  user_id: string;
  appointment_confirmations: boolean;
  appointment_reminders: boolean;
  appointment_cancellations: boolean;
  appointment_reschedules: boolean;
  system_updates: boolean;
  financial_reports: boolean;
  push_new_appointments: boolean;
  push_cancellations: boolean;
  push_patient_messages: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  weekend_quiet: boolean;
}

export interface EmailTemplate {
  id?: string;
  clinic_id: string;
  template_type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancellation' | 'appointment_reschedule' | 'welcome' | 'password_reset';
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  is_active: boolean;
}

export interface NotificationQueueItem {
  id?: string;
  clinic_id: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  scheduled_for?: string;
  sent_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  metadata: Record<string, any>;
}

export class NotificationService {
  // SMTP Configuration
  static async saveSmtpConfig(config: SMTPConfig): Promise<SMTPConfig> {
    const { data, error } = await supabase
      .from('smtp_config')
      .upsert({
        clinic_id: config.clinic_id,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password, // In production, encrypt this
        from_email: config.from_email,
        from_name: config.from_name,
        secure: config.secure,
        is_active: config.is_active,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSmtpConfig(clinicId: string): Promise<SMTPConfig | null> {
    const { data, error } = await supabase
      .from('smtp_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async testSmtpConfig(config: SMTPConfig): Promise<boolean> {
    try {
      // Queue a test email
      await this.queueNotification({
        clinic_id: config.clinic_id,
        recipient_email: config.from_email,
        recipient_name: 'Teste',
        subject: 'Teste de Configuração SMTP - ' + config.from_name,
        html_content: `
          <h2>Teste de Configuração SMTP</h2>
          <p>Se você recebeu este email, sua configuração SMTP está funcionando corretamente!</p>
          <p><strong>Servidor:</strong> ${config.host}:${config.port}</p>
          <p><strong>Remetente:</strong> ${config.from_name} &lt;${config.from_email}&gt;</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        `,
        text_content: `Teste de Configuração SMTP\n\nSe você recebeu este email, sua configuração SMTP está funcionando!\n\nServidor: ${config.host}:${config.port}\nRemetente: ${config.from_name} <${config.from_email}>\nData: ${new Date().toLocaleString('pt-BR')}`,
        status: 'pending',
        retry_count: 0,
        max_retries: 1,
        metadata: { test: true }
      });

      return true;
    } catch (error) {
      console.error('Error testing SMTP config:', error);
      return false;
    }
  }

  // Notification Preferences
  static async saveNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        clinic_id: preferences.clinic_id,
        user_id: preferences.user_id,
        appointment_confirmations: preferences.appointment_confirmations,
        appointment_reminders: preferences.appointment_reminders,
        appointment_cancellations: preferences.appointment_cancellations,
        appointment_reschedules: preferences.appointment_reschedules,
        system_updates: preferences.system_updates,
        financial_reports: preferences.financial_reports,
        push_new_appointments: preferences.push_new_appointments,
        push_cancellations: preferences.push_cancellations,
        push_patient_messages: preferences.push_patient_messages,
        quiet_hours_start: preferences.quiet_hours_start,
        quiet_hours_end: preferences.quiet_hours_end,
        weekend_quiet: preferences.weekend_quiet,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getNotificationPreferences(clinicId: string, userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Email Templates
  static async getEmailTemplate(clinicId: string, templateType: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('template_type', templateType)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;
    
    // Convert the data to our EmailTemplate interface
    return {
      ...data,
      template_type: data.template_type as EmailTemplate['template_type'],
      variables: Array.isArray(data.variables) ? data.variables : JSON.parse(data.variables as string)
    };
  }

  static async saveEmailTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .upsert({
        clinic_id: template.clinic_id,
        template_type: template.template_type,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content,
        variables: template.variables,
        is_active: template.is_active,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Convert the data to our EmailTemplate interface
    return {
      ...data,
      template_type: data.template_type as EmailTemplate['template_type'],
      variables: Array.isArray(data.variables) ? data.variables : JSON.parse(data.variables as string)
    };
  }

  // Notification Queue
  static async queueNotification(notification: Omit<NotificationQueueItem, 'id'>): Promise<NotificationQueueItem> {
    const { data, error } = await supabase
      .from('notification_queue')
      .insert({
        clinic_id: notification.clinic_id,
        recipient_email: notification.recipient_email,
        recipient_name: notification.recipient_name,
        subject: notification.subject,
        html_content: notification.html_content,
        text_content: notification.text_content,
        template_type: notification.template_type,
        status: notification.status,
        scheduled_for: notification.scheduled_for || new Date().toISOString(),
        retry_count: notification.retry_count,
        max_retries: notification.max_retries,
        metadata: notification.metadata
      })
      .select()
      .single();

    if (error) throw error;
    
    // Convert the data to our NotificationQueueItem interface
    return {
      ...data,
      status: data.status as NotificationQueueItem['status'],
      metadata: data.metadata as Record<string, any>
    };
  }

  static async queueAppointmentNotification(
    clinicId: string,
    templateType: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancellation',
    recipientEmail: string,
    recipientName: string,
    variables: Record<string, string>
  ): Promise<void> {
    // Get the email template
    const template = await this.getEmailTemplate(clinicId, templateType);
    if (!template) {
      console.warn(`No template found for ${templateType} in clinic ${clinicId}`);
      return;
    }

    // Replace variables in template
    let subject = template.subject;
    let htmlContent = template.html_content;
    let textContent = template.text_content || '';

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Queue the notification
    await this.queueNotification({
      clinic_id: clinicId,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      html_content: htmlContent,
      text_content: textContent,
      template_type: templateType,
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      metadata: { variables }
    });
  }

  // Utility method to send appointment confirmation
  static async sendAppointmentConfirmation(appointment: any, clinic: any, doctor?: any): Promise<void> {
    if (!appointment.patient_email) return;

    const variables = {
      patient_name: appointment.patient_name,
      clinic_name: clinic.name,
      doctor_name: doctor?.name || appointment.doctor_name || 'Não especificado',
      appointment_date: new Date(appointment.date).toLocaleDateString('pt-BR'),
      appointment_time: new Date(appointment.date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      appointment_type: appointment.type === 'online' ? 'Online' : 'Presencial',
      clinic_phone: clinic.phone || '',
      clinic_email: clinic.email || '',
      clinic_address: clinic.address || ''
    };

    await this.queueAppointmentNotification(
      clinic.id,
      'appointment_confirmation',
      appointment.patient_email,
      appointment.patient_name,
      variables
    );
  }

  // Utility method to send appointment reminder
  static async sendAppointmentReminder(appointment: any, clinic: any, doctor?: any): Promise<void> {
    if (!appointment.patient_email) return;

    const variables = {
      patient_name: appointment.patient_name,
      clinic_name: clinic.name,
      doctor_name: doctor?.name || appointment.doctor_name || 'Não especificado',
      appointment_date: new Date(appointment.date).toLocaleDateString('pt-BR'),
      appointment_time: new Date(appointment.date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      clinic_phone: clinic.phone || '',
      clinic_email: clinic.email || '',
      clinic_address: clinic.address || ''
    };

    await this.queueAppointmentNotification(
      clinic.id,
      'appointment_reminder',
      appointment.patient_email,
      appointment.patient_name,
      variables
    );
  }

  // Utility method to send appointment cancellation
  static async sendAppointmentCancellation(appointment: any, clinic: any, doctor?: any): Promise<void> {
    if (!appointment.patient_email) return;

    const variables = {
      patient_name: appointment.patient_name,
      clinic_name: clinic.name,
      doctor_name: doctor?.name || appointment.doctor_name || 'Não especificado',
      appointment_date: new Date(appointment.date).toLocaleDateString('pt-BR'),
      appointment_time: new Date(appointment.date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      clinic_phone: clinic.phone || '',
      clinic_email: clinic.email || ''
    };

    await this.queueAppointmentNotification(
      clinic.id,
      'appointment_cancellation',
      appointment.patient_email,
      appointment.patient_name,
      variables
    );
  }
} 