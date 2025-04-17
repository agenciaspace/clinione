
import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a webhook event for the specified event type and payload
 * @param eventType The type of event (e.g., 'appointment.created')
 * @param payload The data to include in the webhook
 * @param clinicId The ID of the clinic
 * @param triggerSource The source of the trigger (ui, api, automation, system)
 * @returns Promise with the result of the webhook trigger
 */
export const triggerWebhook = async (
  eventType: string,
  payload: any,
  clinicId: string,
  triggerSource: 'ui' | 'api' | 'automation' | 'system' = 'ui'
): Promise<{ success: boolean; message: string; eventId?: string }> => {
  try {
    type WebhookTriggerResponse = {
      success: boolean;
      message: string;
      eventId?: string;
    };

    const { data, error } = await supabase.functions.invoke<WebhookTriggerResponse>('webhook-trigger', {
      body: {
        event_type: eventType,
        clinic_id: clinicId,
        payload,
        trigger_source: triggerSource
      }
    });

    if (error) {
      console.error('Error triggering webhook:', error);
      return { success: false, message: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return { success: false, message: error.message || 'Unknown error' };
  }
};

/**
 * Simple type for webhook log responses to avoid recursive type instantiation
 */
export type WebhookLogResponse = {
  data: any[] | null;
  error: Error | null;
};

/**
 * Loads webhook logs for a specific endpoint or legacy webhook
 * @param clinicId The ID of the clinic
 * @param webhookId The ID of the webhook endpoint (or 'legacy' for legacy webhook)
 * @returns Promise with webhook logs or error
 */
export const loadWebhookLogs = async (
  clinicId: string, 
  webhookId: string | null
): Promise<WebhookLogResponse> => {
  try {
    // If it's a legacy webhook, we need a different query
    if (webhookId === 'legacy') {
      // Use webhook_events table instead of webhook_logs for consistency
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('timestamp', { ascending: false })
        .limit(20);
      
      return { data, error };
    } else {
      // For specific webhook endpoints, also using webhook_events
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('timestamp', { ascending: false })
        .limit(20);
      
      return { data, error };
    }
  } catch (error) {
    console.error('Error loading webhook logs:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Event types for the webhook system
 */
export enum WebhookEventType {
  // Appointment events
  APPOINTMENT_CREATED = 'appointment.created',
  APPOINTMENT_UPDATED = 'appointment.updated',
  APPOINTMENT_DELETED = 'appointment.deleted',
  APPOINTMENT_STATUS_CHANGED = 'appointment.status_changed',
  
  // Patient events
  PATIENT_CREATED = 'patient.created',
  PATIENT_UPDATED = 'patient.updated',
  PATIENT_DELETED = 'patient.deleted',
  
  // Doctor events
  DOCTOR_CREATED = 'doctor.created',
  DOCTOR_UPDATED = 'doctor.updated',
  DOCTOR_DELETED = 'doctor.deleted',
  
  // Clinic events
  CLINIC_UPDATED = 'clinic.updated',
  CLINIC_SETTINGS_UPDATED = 'clinic.settings_updated',
  
  // Financial events
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_UPDATED = 'transaction.updated',
  
  // User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_ROLE_CHANGED = 'user.role_changed'
}
