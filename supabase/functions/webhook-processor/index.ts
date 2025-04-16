
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

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
    const { action, eventId } = await req.json();

    // Initialize with the event ID if provided, otherwise process pending events
    if (action === 'process-event' && eventId) {
      return await processEvent(supabase, eventId);
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

async function processEvent(supabase: any, eventId: string) {
  console.log(`Processing event: ${eventId}`);
  
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

  // Get clinic config for webhook URL
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

  // Send the webhook
  return await sendWebhook(supabase, event, clinic);
}

async function sendWebhook(supabase: any, event: WebhookEvent, clinic: ClinicWebhookConfig) {
  console.log(`Sending webhook to ${clinic.webhook_url}`);
  
  const webhookPayload = {
    event_type: event.event_type,
    clinic_id: event.clinic_id,
    timestamp: event.timestamp,
    payload: event.payload
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Add secret token if configured
  if (clinic.webhook_secret) {
    headers['X-Webhook-Secret'] = clinic.webhook_secret;
  }

  try {
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
    const response = await fetch(clinic.webhook_url, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload)
    });

    const responseText = await response.text();
    const isSuccess = response.status >= 200 && response.status < 300;

    // Update event status based on response
    await updateEventStatus(
      supabase, 
      event.id, 
      isSuccess ? 'delivered' : 'failed',
      responseText.substring(0, 500),
      response.status
    );

    // If failed, schedule a retry
    if (!isSuccess) {
      await scheduleRetry(supabase, event.id, event.attempts);
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
    
    // Update event status and schedule retry
    await updateEventStatus(supabase, event.id, 'failed', error.message, 0);
    await scheduleRetry(supabase, event.id, event.attempts);

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

async function scheduleRetry(supabase: any, eventId: string, currentAttempts: number) {
  // Exponential backoff with max of 24 hours
  // 1st retry: 30s, 2nd: 2m, 3rd: 8m, 4th: 32m, 5th: 2h8m, 6th: 8h32m, 7+: 24h
  const maxRetries = 8;
  
  if (currentAttempts >= maxRetries) {
    console.log(`Maximum retries (${maxRetries}) reached for event ${eventId}`);
    return;
  }

  // Calculate backoff time (30 seconds * 4^attempt)
  const backoffSeconds = Math.min(30 * Math.pow(4, currentAttempts), 86400); // max 24 hours
  const retryAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();

  const { error } = await supabase
    .from('webhook_retries')
    .insert({
      event_id: eventId,
      retry_at: retryAt,
      status: 'pending'
    });

  if (error) {
    console.error('Error scheduling retry:', error);
  } else {
    console.log(`Retry scheduled for event ${eventId} at ${retryAt}`);
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

  // Process each event
  const results = await Promise.all(
    events.map(async (event) => {
      const { data: clinic } = await supabase
        .from('clinics')
        .select('id, webhook_url, webhook_secret')
        .eq('id', event.clinic_id)
        .single();

      if (!clinic || !clinic.webhook_url) {
        await updateEventStatus(supabase, event.id, 'failed', 'Webhook URL not configured', 0);
        return { eventId: event.id, status: 'failed', message: 'Webhook URL not configured' };
      }

      const response = await sendWebhook(supabase, event, clinic);
      const result = await response.json();
      return { eventId: event.id, ...result };
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
      const result = await processEvent(supabase, retry.event_id);
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
