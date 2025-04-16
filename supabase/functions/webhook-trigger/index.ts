
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  event_type: string;
  clinic_id: string;
  payload: any;
  trigger_source?: string;
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
    const { event_type, clinic_id, payload, trigger_source = 'system' } = await req.json() as WebhookPayload;

    // Validate required fields
    if (!event_type || !clinic_id || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event_type, clinic_id, or payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create webhook event with a unique event_id
    const event_id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Check for webhook endpoints configured for this clinic
    const { data: webhookEndpoints, error: endpointsError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('clinic_id', clinic_id)
      .eq('is_active', true)
      .or(`event_types.is.null,event_types.cs.{${event_type}}`);

    if (endpointsError) {
      throw new Error(`Failed to fetch webhook endpoints: ${endpointsError.message}`);
    }

    // Fall back to clinic's webhook URL if no endpoints are found
    let endpoints = webhookEndpoints;
    if (!webhookEndpoints || webhookEndpoints.length === 0) {
      const { data: clinic } = await supabase
        .from('clinics')
        .select('webhook_url, webhook_secret')
        .eq('id', clinic_id)
        .single();

      // Only create event if webhook URL is configured
      if (clinic && clinic.webhook_url) {
        endpoints = [{
          id: 'legacy',
          clinic_id,
          url: clinic.webhook_url,
          secret: clinic.webhook_secret || null,
          event_types: null
        }];
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No webhook endpoints configured for this clinic' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create webhook event record
    const { data: eventRecord, error: eventError } = await supabase
      .from('webhook_events')
      .insert({
        id: event_id, // Use the generated UUID as the primary key
        event_type,
        clinic_id,
        payload,
        timestamp,
        status: 'pending',
        event_version: '1.0',
        trigger_source
      })
      .select()
      .single();

    if (eventError) {
      throw new Error(`Failed to create webhook event: ${eventError.message}`);
    }

    // For each endpoint, trigger immediate processing of the webhook
    const processingPromises = endpoints.map(async (endpoint) => {
      try {
        await fetch(`${supabaseUrl}/functions/v1/webhook-processor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            action: 'process-event',
            eventId: eventRecord.id,
            webhookId: endpoint.id === 'legacy' ? null : endpoint.id
          })
        });
      } catch (e) {
        console.error(`Error triggering webhook processor for endpoint ${endpoint.id}:`, e);
      }
    });

    // Wait for all processing attempts to complete
    await Promise.allSettled(processingPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook event created', 
        eventId: eventRecord.id,
        endpoints: endpoints.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing webhook trigger:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
