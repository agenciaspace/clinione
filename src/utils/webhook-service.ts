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

    console.log(`[WEBHOOK] Triggering webhook: ${eventType} for clinic ${clinicId}`, payload);

    const { data, error } = await supabase.functions.invoke<WebhookTriggerResponse>('webhook-trigger', {
      body: {
        event_type: eventType,
        clinic_id: clinicId,
        payload,
        trigger_source: triggerSource
      }
    });

    if (error) {
      console.error('[WEBHOOK] Error triggering webhook:', error);
      return { success: false, message: error.message };
    }

    console.log('[WEBHOOK] Webhook triggered successfully:', data);
    return data;
  } catch (error) {
    console.error('[WEBHOOK] Error triggering webhook:', error);
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
    console.error('[WEBHOOK] Error loading webhook logs:', error);
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

/**
 * A utility to automatically send webhook events when data changes
 */
export const webhookEvents = {
  /**
   * Appointment related webhook triggers
   */
  appointments: {
    created: async (appointmentData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.APPOINTMENT_CREATED,
        appointmentData,
        clinicId
      );
    },
    updated: async (appointmentData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.APPOINTMENT_UPDATED,
        appointmentData,
        clinicId
      );
    },
    deleted: async (appointmentData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.APPOINTMENT_DELETED,
        appointmentData,
        clinicId
      );
    },
    statusChanged: async (appointmentData: any, clinicId: string, oldStatus: string, newStatus: string) => {
      return triggerWebhook(
        WebhookEventType.APPOINTMENT_STATUS_CHANGED,
        { ...appointmentData, old_status: oldStatus, new_status: newStatus },
        clinicId
      );
    }
  },

  /**
   * Patient related webhook triggers
   */
  patients: {
    created: async (patientData: any, clinicId: string) => {
      console.log('[WEBHOOK] Patient created, triggering webhook manually:', patientData);
      return triggerWebhook(
        WebhookEventType.PATIENT_CREATED,
        patientData,
        clinicId
      );
    },
    updated: async (patientData: any, clinicId: string) => {
      console.log('[WEBHOOK] Patient updated, triggering webhook manually:', patientData);
      return triggerWebhook(
        WebhookEventType.PATIENT_UPDATED,
        patientData,
        clinicId
      );
    },
    deleted: async (patientData: any, clinicId: string) => {
      console.log('[WEBHOOK] Patient deleted, triggering webhook manually:', patientData);
      return triggerWebhook(
        WebhookEventType.PATIENT_DELETED,
        patientData,
        clinicId
      );
    }
  },

  /**
   * Doctor related webhook triggers
   */
  doctors: {
    created: async (doctorData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.DOCTOR_CREATED,
        doctorData,
        clinicId
      );
    },
    updated: async (doctorData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.DOCTOR_UPDATED,
        doctorData, 
        clinicId
      );
    },
    deleted: async (doctorData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.DOCTOR_DELETED,
        doctorData,
        clinicId
      );
    }
  },

  /**
   * Clinic related webhook triggers
   */
  clinics: {
    updated: async (clinicData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.CLINIC_UPDATED,
        clinicData,
        clinicId
      );
    },
    settingsUpdated: async (settingsData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.CLINIC_SETTINGS_UPDATED,
        settingsData,
        clinicId
      );
    }
  },

  /**
   * Financial transactions related webhook triggers
   */
  transactions: {
    created: async (transactionData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.TRANSACTION_CREATED,
        transactionData,
        clinicId
      );
    },
    updated: async (transactionData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.TRANSACTION_UPDATED,
        transactionData,
        clinicId
      );
    }
  },

  /**
   * User related webhook triggers
   */
  users: {
    created: async (userData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.USER_CREATED,
        userData,
        clinicId
      );
    },
    updated: async (userData: any, clinicId: string) => {
      return triggerWebhook(
        WebhookEventType.USER_UPDATED,
        userData,
        clinicId
      );
    },
    roleChanged: async (userData: any, clinicId: string, oldRole: string, newRole: string) => {
      return triggerWebhook(
        WebhookEventType.USER_ROLE_CHANGED,
        { ...userData, old_role: oldRole, new_role: newRole },
        clinicId
      );
    }
  }
};

/**
 * Type definition for realtime subscription status
 */
export type RealtimeSubscriptionStatus = {
  hasWebhookChannel: boolean;
  isSubscribed: boolean;
  channelState: string;
  allChannels: { topic: string; state: string }[];
};

/**
 * A hook for Supabase realtime events to automatically trigger webhooks
 */
export const setupWebhookRealtimeListeners = (clinicId: string) => {
  if (!clinicId) {
    console.log('[WEBHOOK] No clinic ID provided, cannot setup webhook listeners');
    return null;
  }
  
  console.log(`[WEBHOOK] Setting up webhook realtime listeners for clinic ${clinicId}`);

  // Create a channel with proper schema:table format
  const channel = supabase
    .channel(`realtime-webhooks-${clinicId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'patients',
        filter: `clinic_id=eq.${clinicId}`
      },
      async (payload) => {
        console.log('[WEBHOOK] Patient change detected:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            await webhookEvents.patients.created(payload.new, clinicId);
            break;
          case 'UPDATE':
            await webhookEvents.patients.updated(payload.new, clinicId);
            break;
          case 'DELETE':
            await webhookEvents.patients.deleted(payload.old, clinicId);
            break;
        }
      }
    )
    .on('postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'appointments',
        filter: `clinic_id=eq.${clinicId}`
      },
      async (payload) => {
        console.log('[WEBHOOK] Appointment change detected:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            await webhookEvents.appointments.created(payload.new, clinicId);
            break;
          case 'UPDATE':
            await webhookEvents.appointments.updated(payload.new, clinicId);
            if (payload.old && payload.old.status !== payload.new.status) {
              await webhookEvents.appointments.statusChanged(
                payload.new,
                clinicId,
                payload.old.status,
                payload.new.status
              );
            }
            break;
          case 'DELETE':
            await webhookEvents.appointments.deleted(payload.old, clinicId);
            break;
        }
      }
    )
    .on('postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'doctors',
        filter: `clinic_id=eq.${clinicId}`
      },
      async (payload) => {
        console.log('[WEBHOOK] Doctor change detected:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            await webhookEvents.doctors.created(payload.new, clinicId);
            break;
          case 'UPDATE':
            await webhookEvents.doctors.updated(payload.new, clinicId);
            break;
          case 'DELETE':
            await webhookEvents.doctors.deleted(payload.old, clinicId);
            break;
        }
      }
    );

  return channel;
};

/**
 * Manually test the webhook for patient creation.
 */
export const testPatientWebhook = async (clinicId: string) => {
  if (!clinicId) {
    console.error('[WEBHOOK] No clinic ID provided for webhook test');
    return { success: false, message: 'No clinic ID provided' };
  }
  
  console.log(`[WEBHOOK] Testing patient webhook for clinic ${clinicId}`);
  
  const testPatient = {
    id: 'test-' + Date.now(),
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '123456789',
    clinic_id: clinicId,
    birth_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return await webhookEvents.patients.created(testPatient, clinicId);
};

/**
 * Manually check if the realtime subscription for the clinic is working.
 * @param clinicId The clinic ID to check
 * @returns RealtimeSubscriptionStatus object or null if clinicId is missing
 */
export const checkRealtimeSubscription = (clinicId: string): RealtimeSubscriptionStatus | null => {
  if (!clinicId) return null;
  
  const channels = supabase.getChannels();
  
  // Check for postgres changes subscriptions
  const hasPatientChannel = channels.some(chan => 
    chan.topic.includes('postgres_changes') && 
    chan.topic.includes('public:patients')
  );
  
  const hasAppointmentChannel = channels.some(chan => 
    chan.topic.includes('postgres_changes') && 
    chan.topic.includes('public:appointments')
  );
  
  const webhookChannel = channels.find(chan => 
    chan.topic === `webhook-events-${clinicId}`
  );
  
  const isActive = !!webhookChannel && webhookChannel.state === 'joined';
  
  return {
    hasWebhookChannel: !!webhookChannel,
    isSubscribed: isActive,
    channelState: webhookChannel?.state || 'no channel',
    allChannels: channels.map(c => ({ topic: c.topic, state: c.state }))
  };
};
