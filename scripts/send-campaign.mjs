/**
 * Send a Mailchimp campaign with the next upcoming Tech Moncton event.
 *
 * Required env vars:
 *   MAILCHIMP_API_KEY      — Mailchimp API key (includes dc suffix, e.g. xxx-us19)
 *   MAILCHIMP_LIST_ID      — Audience / list ID
 *   MAILCHIMP_REPLY_TO     — Reply-to email address
 *
 * Optional:
 *   UPDATE_FALLBACK_LINK   — URL used when no upcoming event is found
 *   PUBLIC_SITE_URL         — Base site URL (defaults to https://monctontechhive.ca)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_LIST_ID,
  MAILCHIMP_REPLY_TO,
  UPDATE_FALLBACK_LINK,
  PUBLIC_SITE_URL = 'https://monctontechhive.ca',
} = process.env;

if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_REPLY_TO) {
  console.error('Missing required env vars: MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_REPLY_TO');
  process.exit(1);
}

const dc = MAILCHIMP_API_KEY.split('-').pop(); // e.g. "us19"
const API_BASE = `https://${dc}.api.mailchimp.com/3.0`;
const AUTH_HEADER = `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`;

// ---------------------------------------------------------------------------
// Event fetching (mirrors src/lib/events.ts)
// ---------------------------------------------------------------------------

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/TechMoncton/Meetups/main';

async function fetchEventsForYear(year) {
  const url = `${GITHUB_RAW_BASE}/MeetUps%20${year}/MeetUps%20${year}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const events = await res.json();
    return events.map((e) => ({ ...e, year }));
  } catch {
    return [];
  }
}

async function fetchAllEvents() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2024; y <= currentYear + 1; y++) years.push(y);
  const arrays = await Promise.all(years.map(fetchEventsForYear));
  return arrays.flat();
}

function parseEventDate(dateStr) {
  return new Date(dateStr);
}

function getNextUpcomingEvent(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return events
    .filter((e) => parseEventDate(e.date) >= today)
    .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date))[0];
}

// ---------------------------------------------------------------------------
// Email HTML builder
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildEventHtml(event) {
  const eventsUrl = `${PUBLIC_SITE_URL}/en/`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#3b82f6;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;">Tech Moncton</h1>
            <p style="margin:8px 0 0;color:#dbeafe;font-size:14px;">Upcoming Event</p>
          </td>
        </tr>
        <!-- Event Card -->
        <tr>
          <td style="padding:32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
              <tr>
                <td style="padding:24px;">
                  <h2 style="margin:0 0 12px;color:#1e3a5f;font-size:20px;">${event.topic}</h2>
                  <p style="margin:0 0 8px;color:#4b5563;font-size:14px;"><strong>Speaker:</strong> ${event.presentation}</p>
                  <p style="margin:0 0 8px;color:#4b5563;font-size:14px;"><strong>Date:</strong> ${formatDate(event.date)}</p>
                  <p style="margin:0;color:#4b5563;font-size:14px;"><strong>Time:</strong> ${event.time}</p>
                </td>
              </tr>
            </table>
            <!-- CTA -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td align="center">
                  <a href="${eventsUrl}" style="display:inline-block;background-color:#3b82f6;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:16px;font-weight:600;">View All Events</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background-color:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Tech Moncton &mdash; Moncton, New Brunswick</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildFallbackHtml(fallbackUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#3b82f6;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;">Tech Moncton</h1>
            <p style="margin:8px 0 0;color:#dbeafe;font-size:14px;">Community Update</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;text-align:center;">
            <p style="margin:0 0 24px;color:#4b5563;font-size:16px;">We have an update for the Tech Moncton community. Click below to learn more.</p>
            <a href="${fallbackUrl}" style="display:inline-block;background-color:#3b82f6;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:16px;font-weight:600;">Learn More</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background-color:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Tech Moncton &mdash; Moncton, New Brunswick</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Mailchimp API helpers
// ---------------------------------------------------------------------------

async function mailchimp(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    console.error('Mailchimp API error:', JSON.stringify(data, null, 2));
    throw new Error(`Mailchimp ${method} ${path} failed: ${res.status}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Fetch events and find next upcoming
  console.log('Fetching events...');
  const events = await fetchAllEvents();
  const nextEvent = getNextUpcomingEvent(events);

  let subject;
  let html;

  if (nextEvent) {
    console.log(`Next event: "${nextEvent.topic}" on ${nextEvent.date}`);
    subject = `Upcoming: ${nextEvent.topic}`;
    html = buildEventHtml(nextEvent);
  } else if (UPDATE_FALLBACK_LINK) {
    console.log('No upcoming events found. Using fallback link.');
    subject = 'Tech Moncton Community Update';
    html = buildFallbackHtml(UPDATE_FALLBACK_LINK);
  } else {
    console.log('No upcoming events and no UPDATE_FALLBACK_LINK set. Nothing to send.');
    process.exit(0);
  }

  // 2. Create campaign
  console.log('Creating campaign...');
  const campaign = await mailchimp('POST', '/campaigns', {
    type: 'regular',
    recipients: { list_id: MAILCHIMP_LIST_ID },
    settings: {
      subject_line: subject,
      from_name: 'Tech Moncton',
      reply_to: MAILCHIMP_REPLY_TO,
    },
  });
  const campaignId = campaign.id;
  console.log(`Campaign created: ${campaignId}`);

  // 3. Set content
  console.log('Setting campaign content...');
  await mailchimp('PUT', `/campaigns/${campaignId}/content`, { html });

  // 4. Send
  console.log('Sending campaign...');
  await mailchimp('POST', `/campaigns/${campaignId}/actions/send`);
  console.log('Campaign sent successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
