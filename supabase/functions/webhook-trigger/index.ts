
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  event_type: string;
  clinic_id: string;
  payload: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const { event_type, clinic_id, payload } = await req.json() as WebhookPayload;

    // Validate required fields
    if (!event_type || !clinic_id || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event_type, clinic_id, or payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if webhook URL is configured for this clinic
    const { data: clinic } = await supabase
      .from('clinics')
      .select('webhook_url')
      .eq('id', clinic_id)
      .single();

    // Only create event if webhook URL is configured
    if (clinic && clinic.webhook_url) {
      // Create webhook event
      const { data, error } = await supabase
        .from('webhook_events')
        .insert({
          event_type,
          clinic_id,
          payload,
          timestamp: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create webhook event: ${error.message}`);
      }

      // Trigger immediate processing of the webhook
      try {
        await fetch(`${supabaseUrl}/functions/v1/webhook-processor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            action: 'process-event',
            eventId: data.id
          })
        });
      } catch (e) {
        console.error('Error triggering webhook processor:', e);
        // We don't fail the request if this call fails, as the event is already created
        // and will be picked up by the scheduled processor
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook event created', 
          eventId: data.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // No webhook URL configured, just ignore silently
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Webhook URL not configured for this clinic' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing webhook trigger:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
