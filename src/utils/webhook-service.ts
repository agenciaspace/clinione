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

  // Create a channel to listen for changes
  const channel = supabase
    .channel(`webhook-events-${clinicId}`)
    // Listen for appointment changes
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'appointments' },
      async (payload) => {
        const newAppointment = payload.new;
        if (newAppointment && newAppointment.clinic_id === clinicId) {
          console.log('Appointment created, triggering webhook:', newAppointment);
          await webhookEvents.appointments.created(newAppointment, clinicId);
        }
      }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'appointments' },
      async (payload) => {
        const updatedAppointment = payload.new;
        const oldAppointment = payload.old;
        
        if (updatedAppointment && updatedAppointment.clinic_id === clinicId) {
          console.log('Appointment updated, triggering webhook:', updatedAppointment);
          await webhookEvents.appointments.updated(updatedAppointment, clinicId);
          
          // If status changed, trigger specific status changed event
          if (oldAppointment && oldAppointment.status !== updatedAppointment.status) {
            await webhookEvents.appointments.statusChanged(
              updatedAppointment, 
              clinicId,
              oldAppointment.status,
              updatedAppointment.status
            );
          }
        }
      }
    )
    .on('postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'appointments' },
      async (payload) => {
        const deletedAppointment = payload.old;
        if (deletedAppointment && deletedAppointment.clinic_id === clinicId) {
          console.log('Appointment deleted, triggering webhook:', deletedAppointment);
          await webhookEvents.appointments.deleted(deletedAppointment, clinicId);
        }
      }
    )
    
    // Listen for patient changes with enhanced logging
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'patients' },
      async (payload) => {
        const newPatient = payload.new;
        console.log('[WEBHOOK] Patient INSERT detected:', newPatient);
        
        if (newPatient && newPatient.clinic_id === clinicId) {
          console.log(`[WEBHOOK] Patient created for clinic ${clinicId}, triggering webhook:`, newPatient);
          
          try {
            const result = await webhookEvents.patients.created(newPatient, clinicId);
            console.log('[WEBHOOK] Patient created webhook result:', result);
          } catch (error) {
            console.error('[WEBHOOK] Error triggering patient.created webhook:', error);
          }
        } else {
          console.log(`[WEBHOOK] Patient clinic_id doesn't match: ${newPatient?.clinic_id} vs ${clinicId}`);
        }
      }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'patients' },
      async (payload) => {
        const updatedPatient = payload.new;
        console.log('[WEBHOOK] Patient UPDATE detected:', updatedPatient);
        
        if (updatedPatient && updatedPatient.clinic_id === clinicId) {
          console.log(`[WEBHOOK] Patient updated for clinic ${clinicId}, triggering webhook:`, updatedPatient);
          
          try {
            const result = await webhookEvents.patients.updated(updatedPatient, clinicId);
            console.log('[WEBHOOK] Patient updated webhook result:', result);
          } catch (error) {
            console.error('[WEBHOOK] Error triggering patient.updated webhook:', error);
          }
        } else {
          console.log(`[WEBHOOK] Patient clinic_id doesn't match: ${updatedPatient?.clinic_id} vs ${clinicId}`);
        }
      }
    )
    .on('postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'patients' },
      async (payload) => {
        const deletedPatient = payload.old;
        console.log('[WEBHOOK] Patient DELETE detected:', deletedPatient);
        
        if (deletedPatient && deletedPatient.clinic_id === clinicId) {
          console.log(`[WEBHOOK] Patient deleted for clinic ${clinicId}, triggering webhook:`, deletedPatient);
          
          try {
            const result = await webhookEvents.patients.deleted(deletedPatient, clinicId);
            console.log('[WEBHOOK] Patient deleted webhook result:', result);
          } catch (error) {
            console.error('[WEBHOOK] Error triggering patient.deleted webhook:', error);
          }
        } else {
          console.log(`[WEBHOOK] Patient clinic_id doesn't match: ${deletedPatient?.clinic_id} vs ${clinicId}`);
        }
      }
    )
    
    // Listen for doctor changes
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'doctors' },
      async (payload) => {
        const newDoctor = payload.new;
        if (newDoctor && newDoctor.clinic_id === clinicId) {
          console.log('Doctor created, triggering webhook:', newDoctor);
          await webhookEvents.doctors.created(newDoctor, clinicId);
        }
      }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'doctors' },
      async (payload) => {
        const updatedDoctor = payload.new;
        if (updatedDoctor && updatedDoctor.clinic_id === clinicId) {
          console.log('Doctor updated, triggering webhook:', updatedDoctor);
          await webhookEvents.doctors.updated(updatedDoctor, clinicId);
        }
      }
    )
    .on('postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'doctors' },
      async (payload) => {
        const deletedDoctor = payload.old;
        if (deletedDoctor && deletedDoctor.clinic_id === clinicId) {
          console.log('Doctor deleted, triggering webhook:', deletedDoctor);
          await webhookEvents.doctors.deleted(deletedDoctor, clinicId);
        }
      }
    )
    
    // Listen for clinic changes
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'clinics' },
      async (payload) => {
        const updatedClinic = payload.new;
        if (updatedClinic && updatedClinic.id === clinicId) {
          console.log('Clinic updated, triggering webhook:', updatedClinic);
          await webhookEvents.clinics.updated(updatedClinic, clinicId);
        }
      }
    )
    
    // Listen for transaction changes
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      async (payload) => {
        const newTransaction = payload.new;
        if (newTransaction && newTransaction.clinic_id === clinicId) {
          console.log('Transaction created, triggering webhook:', newTransaction);
          await webhookEvents.transactions.created(newTransaction, clinicId);
        }
      }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'transactions' },
      async (payload) => {
        const updatedTransaction = payload.new;
        if (updatedTransaction && updatedTransaction.clinic_id === clinicId) {
          console.log('Transaction updated, triggering webhook:', updatedTransaction);
          await webhookEvents.transactions.updated(updatedTransaction, clinicId);
        }
      }
    );

  // Subscribe to the channel to start receiving events with enhanced logging
  console.log(`[WEBHOOK] Subscribing to webhook channel for clinic ${clinicId}`);
  
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
  const webhookChannel = channels.find(chan => chan.topic === `realtime:public:patients`);
  
  return {
    hasWebhookChannel: !!webhookChannel,
    isSubscribed: webhookChannel?.state === 'joined',
    channelState: webhookChannel?.state,
    allChannels: channels.map(c => ({ topic: c.topic, state: c.state }))
  };
};
