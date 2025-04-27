
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export function setupWebhookRealtimeListeners(clinicId: string, channelName?: string): RealtimeChannel | null {
  try {
    // Use a custom channel name if provided, otherwise generate one with timestamp
    const uniqueChannelName = channelName || `webhook-${clinicId}-${Date.now()}`;
    
    console.log('[WEBHOOK] Setting up webhook realtime listeners for clinic', clinicId);
    
    // Create and return the channel
    return supabase
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
      
  } catch (error) {
    console.error('[WEBHOOK] Error setting up webhook listeners:', error);
    return null;
  }
}
