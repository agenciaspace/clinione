
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Tipos de eventos de webhook
export enum WebhookEventType {
  APPOINTMENT_CREATED = "appointment.created",
  APPOINTMENT_UPDATED = "appointment.updated",
  APPOINTMENT_STATUS_CHANGED = "appointment.status_changed",
  PATIENT_CREATED = "patient.created",
  PATIENT_UPDATED = "patient.updated",
  DOCTOR_CREATED = "doctor.created",
  DOCTOR_UPDATED = "doctor.updated",
  CLINIC_UPDATED = "clinic.updated",
  TRANSACTION_CREATED = "transaction.created",
  TRANSACTION_UPDATED = "transaction.updated"
}

export interface WebhookLogResponse {
  success: boolean;
  message: string;
  eventId?: string;
}

// Mapa de canais ativos
const activeChannels: Record<string, RealtimeChannel> = {};

export function setupWebhookRealtimeListeners(clinicId: string, channelName?: string): RealtimeChannel | null {
  try {
    // Use a custom channel name if provided, otherwise generate one with timestamp
    const uniqueChannelName = channelName || `webhook-${clinicId}-${Date.now()}`;
    
    console.log('[WEBHOOK] Setting up webhook realtime listeners for clinic', clinicId);
    
    // Remove existing channel with same name if it exists
    if (activeChannels[uniqueChannelName]) {
      console.log(`[WEBHOOK] Removing existing channel ${uniqueChannelName}`);
      supabase.removeChannel(activeChannels[uniqueChannelName]);
      delete activeChannels[uniqueChannelName];
    }
    
    // Create and return the channel
    const channel = supabase
      .channel(uniqueChannelName)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'webhook_events',
          filter: `clinic_id=eq.${clinicId}`,
        },
        payload => {
          console.log('[WEBHOOK] Webhook event change detected:', payload);
          // Additional handling as needed
        }
      )
      .subscribe((status) => {
        console.log(`[WEBHOOK] Subscription status for ${uniqueChannelName}:`, status);
      });
      
    // Store the channel reference
    activeChannels[uniqueChannelName] = channel;
    return channel;
      
  } catch (error) {
    console.error('[WEBHOOK] Error setting up webhook listeners:', error);
    return null;
  }
}

export function checkRealtimeSubscription(clinicId: string): {isSubscribed: boolean, channelName?: string} {
  // Check if there are any active channels for this clinic
  const channelNames = Object.keys(activeChannels);
  const clinicChannels = channelNames.filter(name => name.includes(`webhook-${clinicId}`));
  
  if (clinicChannels.length > 0) {
    return {
      isSubscribed: true,
      channelName: clinicChannels[0]
    };
  }
  
  return { isSubscribed: false };
}

// Função auxiliar para criar eventos de webhook
async function createWebhookEvent(
  eventType: WebhookEventType,
  payload: any,
  clinicId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        clinic_id: clinicId,
        event_type: eventType,
        payload,
        timestamp: new Date().toISOString(),
        status: 'pending',
        trigger_source: 'api',
        event_version: '1.0'
      })
      .select('id')
      .single();

    if (error) throw error;
    
    return data?.id || null;
  } catch (error) {
    console.error('[WEBHOOK] Error creating webhook event:', error);
    return null;
  }
}

// Funções para disparar eventos de webhook
export async function triggerWebhook(
  eventType: WebhookEventType,
  payload: any,
  clinicId: string
): Promise<WebhookLogResponse> {
  try {
    const eventId = await createWebhookEvent(eventType, payload, clinicId);
    
    if (!eventId) {
      return {
        success: false,
        message: 'Falha ao criar evento de webhook'
      };
    }
    
    return {
      success: true,
      message: 'Evento de webhook criado com sucesso',
      eventId
    };
  } catch (error) {
    console.error('[WEBHOOK] Error triggering webhook:', error);
    return {
      success: false,
      message: `Erro ao disparar webhook: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Função para testes do webhook de paciente
export async function testPatientWebhook(clinicId: string): Promise<WebhookLogResponse> {
  const testPatient = {
    id: `test-${Date.now()}`,
    name: 'Paciente Teste',
    email: 'teste@exemplo.com',
    phone: '11999999999',
    created_at: new Date().toISOString()
  };
  
  return triggerWebhook(WebhookEventType.PATIENT_CREATED, testPatient, clinicId);
}

// Função para carregar logs de webhook
export async function loadWebhookLogs(clinicId: string, limit = 20): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('timestamp', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('[WEBHOOK] Error loading webhook logs:', error);
    return [];
  }
}

// Objeto com métodos para facilitar o uso dos webhooks
export const webhookEvents = {
  appointments: {
    created: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.APPOINTMENT_CREATED, data, clinicId),
    updated: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.APPOINTMENT_UPDATED, data, clinicId),
    statusChanged: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.APPOINTMENT_STATUS_CHANGED, data, clinicId)
  },
  patients: {
    created: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.PATIENT_CREATED, data, clinicId),
    updated: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.PATIENT_UPDATED, data, clinicId)
  },
  doctors: {
    created: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.DOCTOR_CREATED, data, clinicId),
    updated: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.DOCTOR_UPDATED, data, clinicId)
  },
  clinics: {
    updated: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.CLINIC_UPDATED, data, clinicId)
  },
  transactions: {
    created: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.TRANSACTION_CREATED, data, clinicId),
    updated: (data: any, clinicId: string) => 
      triggerWebhook(WebhookEventType.TRANSACTION_UPDATED, data, clinicId)
  }
};
