import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function getCorsHeaders() {
  const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:4321';
  return {
    'Access-Control-Allow-Origin': siteUrl,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface Event {
  date: string;
  time: string;
  topic: string;
  presentation: string;
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/TechMoncton/Meetups/main';

async function fetchEventsForYear(year: number): Promise<Event[]> {
  const url = `${GITHUB_RAW_BASE}/MeetUps%20${year}/MeetUps%20${year}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

async function getNextUpcomingEvent(): Promise<Event | null> {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  const allEvents: Event[] = [];
  for (const year of years) {
    const events = await fetchEventsForYear(year);
    allEvents.push(...events);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = allEvents
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return upcoming[0] || null;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getEmailHtml(
  event: Event | null,
  siteUrl: string,
  unsubscribeUrl: string,
  fallbackLink?: string
): string {
  const footer = `
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">
      You're receiving this because you subscribed to Tech Moncton updates.
      <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
    </p>
  `;

  if (event) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Tech Moncton</h1>
        <p>We have an upcoming event you won't want to miss!</p>

        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1e293b;">${event.topic}</h2>
          <p style="color: #64748b; margin-bottom: 8px;"><strong>Speaker:</strong> ${event.presentation}</p>
          <p style="color: #64748b; margin-bottom: 8px;"><strong>Date:</strong> ${formatEventDate(event.date)}</p>
          <p style="color: #64748b; margin-bottom: 0;"><strong>Time:</strong> ${event.time}</p>
        </div>

        <p style="margin: 30px 0;">
          <a href="${siteUrl}/en/events"
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View All Events
          </a>
        </p>
        ${footer}
      </body>
      </html>
    `;
  }

  // Fallback content when no upcoming events
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #3b82f6;">Tech Moncton</h1>
      <p>Check out what's happening at Tech Moncton!</p>

      <p style="margin: 30px 0;">
        <a href="${fallbackLink}"
           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Learn More
        </a>
      </p>
      ${footer}
    </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders();

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Simple auth check
  const authHeader = req.headers.get('x-admin-key');
  const adminKey = Deno.env.get('ADMIN_KEY');

  if (!adminKey || authHeader !== adminKey) {
    return new Response(
      JSON.stringify({ success: false, message: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const siteUrl = Deno.env.get('SITE_URL')!;
    const fallbackLink = Deno.env.get('UPDATE_FALLBACK_LINK');

    // Get next upcoming event
    const nextEvent = await getNextUpcomingEvent();

    // If no event and no fallback, don't send
    if (!nextEvent && !fallbackLink) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No upcoming events and no UPDATE_FALLBACK_LINK defined. Email not sent.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subject = nextEvent
      ? `Upcoming Event: ${nextEvent.topic}`
      : 'Tech Moncton Update';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all verified subscribers
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email, verification_token')
      .eq('verified', true);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch subscribers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No verified subscribers', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromAddress = Deno.env.get('EMAIL_FROM') || 'Tech Moncton <noreply@monctontechhive.ca>';

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${siteUrl}/en/unsubscribe?token=${subscriber.verification_token}`;
      const html = getEmailHtml(nextEvent, siteUrl, unsubscribeUrl, fallbackLink);

      if (resendApiKey) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromAddress,
              to: subscriber.email,
              subject,
              html,
            }),
          });

          if (response.ok) {
            sent++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      } else {
        console.log(`[DEV] Would send to: ${subscriber.email}`);
        console.log(`[DEV] Subject: ${subject}`);
        console.log(`[DEV] Unsubscribe: ${unsubscribeUrl}`);
        sent++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Update sent to ${sent} subscribers${failed > 0 ? `, ${failed} failed` : ''}`,
        sent,
        failed,
        event: nextEvent ? nextEvent.topic : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'An error occurred' }),
      { status: 500, headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' } }
    );
  }
});
