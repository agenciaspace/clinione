
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'
import { createHash, Hmac } from 'https://deno.land/std@0.193.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookEvent {
  id: string;
  clinic_id: string;
  event_type: string;
  payload: any;
  timestamp: string;
  status: string;
  attempts: number;
  last_attempt: string | null;
  last_response: string | null;
  http_status: number | null;
  event_version: string;
  trigger_source: string;
}

interface WebhookEndpoint {
  id: string;
  clinic_id: string;
  url: string;
  secret: string | null;
  description: string | null;
  is_active: boolean;
  event_types: string[] | null;
}

interface ClinicWebhookConfig {
  id: string;
  webhook_url: string | null;
  webhook_secret: string | null;
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
    const { action, eventId, webhookId } = await req.json();

    // Initialize with the event ID if provided, otherwise process pending events
    if (action === 'process-event' && eventId) {
      return await processEvent(supabase, eventId, webhookId);
    } else if (action === 'process-pending') {
      return await processPendingEvents(supabase);
    } else if (action === 'process-retries') {
      return await processRetries(supabase);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

async function processEvent(supabase: any, eventId: string, webhookId: string | null = null) {
  console.log(`Processing event: ${eventId} for webhook: ${webhookId || 'default'}`);
  
  // Get the event
  const { data: event, error: eventError } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (eventError || !event) {
    console.error('Error fetching event:', eventError);
    return new Response(
      JSON.stringify({ error: 'Event not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get webhook endpoint or fall back to clinic config
  let endpoint;
  if (webhookId) {
    const { data: endpointData, error: endpointError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('id', webhookId)
      .single();
    
    if (endpointError || !endpointData) {
      console.error('Error fetching webhook endpoint:', endpointError);
      await updateEventStatus(supabase, event.id, 'failed', 'Webhook endpoint not found', 0);
      return new Response(
        JSON.stringify({ error: 'Webhook endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    endpoint = endpointData;
  } else {
    // Fall back to clinic's webhook_url
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, webhook_url, webhook_secret')
      .eq('id', event.clinic_id)
      .single();
    
    if (clinicError || !clinic || !clinic.webhook_url) {
      console.error('Error fetching clinic or webhook URL not configured:', clinicError);
      await updateEventStatus(supabase, event.id, 'failed', 'Webhook URL not configured', 0);
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    endpoint = {
      id: null,
      clinic_id: clinic.id,
      url: clinic.webhook_url,
      secret: clinic.webhook_secret,
    };
  }

  // Send the webhook
  return await sendWebhook(supabase, event, endpoint);
}

async function sendWebhook(supabase: any, event: WebhookEvent, endpoint: WebhookEndpoint | ClinicWebhookConfig) {
  console.log(`Sending webhook to ${endpoint.url}`);
  
  // Create the final payload with the required format
  const webhookPayload = {
    event_id: `evt_${event.id}`,
    event_type: event.event_type,
    event_version: event.event_version,
    clinic_id: event.clinic_id,
    trigger_source: event.trigger_source,
    timestamp: event.timestamp,
    payload: event.payload
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Clini.One-Webhook/1.0',
    'X-CliniOne-Event': event.event_type,
    'X-CliniOne-Delivery': event.id
  };

  // JSON stringify the payload once to use for both signature and request body
  const payloadString = JSON.stringify(webhookPayload);

  // Add security signature if secret is configured
  if (endpoint.secret) {
    try {
      // Create HMAC SHA-256 signature
      const key = new TextEncoder().encode(endpoint.secret);
      const message = new TextEncoder().encode(payloadString);
      const hmac = await crypto.subtle.importKey(
        "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", hmac, message);
      const hex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Add signature to headers
      headers['X-Hub-Signature'] = `sha256=${hex}`;
    } catch (e) {
      console.error('Error generating HMAC signature:', e);
    }
  }

  try {
    // Create or update log entry
    const webhookId = 'id' in endpoint && endpoint.id ? endpoint.id : null;
    let logId;
    
    // Check if we have an existing log entry
    const { data: existingLog } = await supabase
      .from('webhook_logs')
      .select('id, retry_count')
      .eq('event_id', event.id)
      .eq('webhook_id', webhookId)
      .eq('clinic_id', event.clinic_id)
      .maybeSingle();
      
    if (existingLog) {
      logId = existingLog.id;
      await supabase
        .from('webhook_logs')
        .update({
          retry_count: existingLog.retry_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', logId);
    } else {
      // Create new log entry
      const { data: log, error: logError } = await supabase
        .from('webhook_logs')
        .insert({
          event_id: event.id,
          webhook_id: webhookId,
          clinic_id: event.clinic_id,
          status: 'sending',
          retry_count: 0
        })
        .select()
        .single();
        
      if (logError) {
        console.error('Error creating webhook log:', logError);
      } else {
        logId = log.id;
      }
    }

    // Mark event as in-progress and update attempts
    await supabase
      .from('webhook_events')
      .update({
        status: 'in-progress',
        attempts: event.attempts + 1,
        last_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id);

    // Send the webhook request
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body: payloadString
    });

    const responseText = await response.text();
    const isSuccess = response.status >= 200 && response.status < 300;

    // Update log entry
    if (logId) {
      await supabase
        .from('webhook_logs')
        .update({
          status: isSuccess ? 'delivered' : 'failed',
          response_code: response.status,
          response_body: responseText.substring(0, 500),
          updated_at: new Date().toISOString()
        })
        .eq('id', logId);
    }

    // Update event status
    await updateEventStatus(
      supabase, 
      event.id, 
      isSuccess ? 'delivered' : 'failed',
      responseText.substring(0, 500),
      response.status
    );

    // If failed, schedule a retry
    if (!isSuccess) {
      await scheduleRetry(supabase, event.id, event.attempts, webhookId, event.clinic_id);
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        eventId: event.id,
        status: isSuccess ? 'delivered' : 'failed',
        response: responseText.substring(0, 500)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error sending webhook:', error);
    
    // Update log if we have one
    const webhookId = 'id' in endpoint && endpoint.id ? endpoint.id : null;
    
    // Update event status and schedule retry
    await updateEventStatus(supabase, event.id, 'failed', error.message, 0);
    await scheduleRetry(supabase, event.id, event.attempts, webhookId, event.clinic_id);

    // If all retries have failed, move to dead letter queue
    if (event.attempts >= 7) { // After 7 attempts: 30s, 2m, 8m, 32m, 2h8m, 8h32m, 24h
      await moveToDeadLetterQueue(supabase, event);
    }

    return new Response(
      JSON.stringify({ error: error.message, eventId: event.id }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updateEventStatus(supabase: any, eventId: string, status: string, response: string, httpStatus: number) {
  const { error } = await supabase
    .from('webhook_events')
    .update({
      status,
      last_response: response,
      http_status: httpStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error updating event status:', error);
  }
}

async function scheduleRetry(supabase: any, eventId: string, currentAttempts: number, webhookId: string | null = null, clinicId: string) {
  // New progressive retry schedule: 30s, 2m, 10m
  // This is a simplification of the original schedule to match the requirements
  const retryDelays = [30, 120, 600]; // seconds
  const attemptIndex = Math.min(currentAttempts, retryDelays.length - 1);
  const delaySeconds = retryDelays[attemptIndex];
  const retryAt = new Date(Date.now() + delaySeconds * 1000).toISOString();

  const { error } = await supabase
    .from('webhook_retries')
    .insert({
      event_id: eventId,
      webhook_id: webhookId,
      clinic_id: clinicId,
      retry_at: retryAt,
      status: 'pending'
    });

  if (error) {
    console.error('Error scheduling retry:', error);
  } else {
    console.log(`Retry scheduled for event ${eventId} at ${retryAt}`);
  }
}

async function moveToDeadLetterQueue(supabase: any, event: WebhookEvent) {
  // Create dead letter record
  const { error } = await supabase
    .from('dead_webhook_events')
    .insert({
      event_id: event.id,
      event_type: event.event_type,
      clinic_id: event.clinic_id,
      payload: event.payload,
      attempts: event.attempts,
      last_attempt: event.last_attempt,
      error_message: event.last_response || 'Max retries exceeded'
    });

  if (error) {
    console.error('Error moving event to dead letter queue:', error);
  } else {
    console.log(`Event ${event.id} moved to dead letter queue after ${event.attempts} attempts`);
  }
}

async function processPendingEvents(supabase: any) {
  // Get pending events (limit to 10 at a time)
  const { data: events, error } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching pending events:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (events.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No pending events to process' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // For each event, get all active endpoints for its clinic
  const results = await Promise.all(
    events.map(async (event) => {
      const { data: endpoints } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('clinic_id', event.clinic_id)
        .eq('is_active', true)
        .or(`event_types.is.null,event_types.cs.{${event.event_type}}`);

      // If no endpoints found, fall back to clinic webhook_url
      if (!endpoints || endpoints.length === 0) {
        const { data: clinic } = await supabase
          .from('clinics')
          .select('id, webhook_url, webhook_secret')
          .eq('id', event.clinic_id)
          .single();

        if (!clinic || !clinic.webhook_url) {
          await updateEventStatus(supabase, event.id, 'failed', 'No webhook endpoints configured', 0);
          return { eventId: event.id, status: 'failed', message: 'No webhook endpoints configured' };
        }

        // Process with clinic webhook URL
        const response = await sendWebhook(supabase, event, clinic);
        const result = await response.json();
        return { eventId: event.id, ...result };
      }

      // Process with each configured endpoint
      const endpointResults = await Promise.all(
        endpoints.map(async (endpoint) => {
          const response = await sendWebhook(supabase, event, endpoint);
          return response.json();
        })
      );

      return { eventId: event.id, endpoints: endpointResults.length, results: endpointResults };
    })
  );

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processRetries(supabase: any) {
  // Get retries that are due
  const now = new Date().toISOString();
  const { data: retries, error } = await supabase
    .from('webhook_retries')
    .select('*, webhook_events!inner(*)')
    .eq('status', 'pending')
    .lt('retry_at', now)
    .order('retry_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching retries:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (retries.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No retries to process' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Process each retry
  const results = await Promise.all(
    retries.map(async (retry) => {
      // Mark retry as processing
      await supabase
        .from('webhook_retries')
        .update({ status: 'processing', updated_at: now })
        .eq('id', retry.id);

      // Process the event
      const result = await processEvent(supabase, retry.event_id, retry.webhook_id);
      const response = await result.json();

      // Mark retry as completed
      await supabase
        .from('webhook_retries')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', retry.id);

      return { retryId: retry.id, eventId: retry.event_id, ...response };
    })
  );

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
