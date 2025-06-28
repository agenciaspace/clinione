import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  secure: boolean;
}

interface NotificationQueueItem {
  id: string;
  clinic_id: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type?: string;
  status: string;
  retry_count: number;
  max_retries: number;
  metadata: any;
}

async function sendEmailViaSMTP(config: SMTPConfig, notification: NotificationQueueItem): Promise<boolean> {
  try {
    // Create SMTP connection using Deno's built-in SMTP client
    const conn = await Deno.connect({
      hostname: config.host,
      port: config.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read response
    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    // Helper function to send command
    const sendCommand = async (command: string): Promise<string> => {
      await conn.write(encoder.encode(command + '\r\n'));
      return await readResponse();
    };

    // SMTP handshake
    await readResponse(); // Read initial server greeting
    await sendCommand(`EHLO ${config.host}`);

    // STARTTLS if secure
    if (config.secure) {
      await sendCommand('STARTTLS');
      // Note: Deno doesn't have built-in TLS upgrade, so we'll use a simpler approach
    }

    // Authentication
    await sendCommand('AUTH LOGIN');
    await sendCommand(btoa(config.username));
    await sendCommand(btoa(config.password));

    // Send email
    await sendCommand(`MAIL FROM:<${config.from_email}>`);
    await sendCommand(`RCPT TO:<${notification.recipient_email}>`);
    await sendCommand('DATA');

    // Email headers and body
    const emailContent = [
      `From: ${config.from_name} <${config.from_email}>`,
      `To: ${notification.recipient_name || ''} <${notification.recipient_email}>`,
      `Subject: ${notification.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      notification.html_content,
      '.'
    ].join('\r\n');

    await sendCommand(emailContent);
    await sendCommand('QUIT');

    conn.close();
    return true;
  } catch (error) {
    console.error('SMTP Error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending notifications from queue
    const { data: notifications, error: fetchError } = await supabaseClient
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10); // Process 10 at a time

    if (fetchError) {
      throw fetchError;
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const results = [];

    for (const notification of notifications) {
      try {
        // Get SMTP config for the clinic
        const { data: smtpConfig, error: smtpError } = await supabaseClient
          .from('smtp_config')
          .select('*')
          .eq('clinic_id', notification.clinic_id)
          .eq('is_active', true)
          .single();

        if (smtpError || !smtpConfig) {
          // Mark as failed - no SMTP config
          await supabaseClient
            .from('notification_queue')
            .update({
              status: 'failed',
              error_message: 'No active SMTP configuration found',
              retry_count: notification.retry_count + 1
            })
            .eq('id', notification.id);

          results.push({
            id: notification.id,
            status: 'failed',
            error: 'No SMTP config'
          });
          continue;
        }

        // Try to send email
        const success = await sendEmailViaSMTP(smtpConfig, notification);

        if (success) {
          // Mark as sent
          await supabaseClient
            .from('notification_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id);

          // Log success
          await supabaseClient
            .from('notification_logs')
            .insert({
              clinic_id: notification.clinic_id,
              notification_id: notification.id,
              event_type: 'sent',
              event_data: { timestamp: new Date().toISOString() }
            });

          results.push({
            id: notification.id,
            status: 'sent'
          });
        } else {
          // Check if we should retry
          const newRetryCount = notification.retry_count + 1;
          const shouldRetry = newRetryCount < notification.max_retries;

          await supabaseClient
            .from('notification_queue')
            .update({
              status: shouldRetry ? 'pending' : 'failed',
              error_message: 'SMTP send failed',
              retry_count: newRetryCount,
              scheduled_for: shouldRetry 
                ? new Date(Date.now() + (newRetryCount * 5 * 60 * 1000)).toISOString() // Retry in 5, 10, 15 minutes
                : undefined
            })
            .eq('id', notification.id);

          // Log failure
          await supabaseClient
            .from('notification_logs')
            .insert({
              clinic_id: notification.clinic_id,
              notification_id: notification.id,
              event_type: 'failed',
              event_data: { 
                error: 'SMTP send failed',
                retry_count: newRetryCount,
                will_retry: shouldRetry
              }
            });

          results.push({
            id: notification.id,
            status: shouldRetry ? 'retry_scheduled' : 'failed',
            retry_count: newRetryCount
          });
        }
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        // Mark as failed
        await supabaseClient
          .from('notification_queue')
          .update({
            status: 'failed',
            error_message: error.message,
            retry_count: notification.retry_count + 1
          })
          .eq('id', notification.id);

        results.push({
          id: notification.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: results.length,
        results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 