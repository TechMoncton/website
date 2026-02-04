import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function getCorsHeaders() {
  const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:4321';
  return {
    'Access-Control-Allow-Origin': siteUrl,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function getEmailHtml(verifyUrl: string, unsubscribeUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #3b82f6;">Tech Moncton</h1>
      <p>Thanks for subscribing to Tech Moncton updates!</p>
      <p>Please click the button below to verify your email address:</p>
      <p style="margin: 30px 0;">
        <a href="${verifyUrl}"
           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        If you didn't subscribe to Tech Moncton, you can ignore this email or
        <a href="${unsubscribeUrl}" style="color: #999;">unsubscribe</a>.
      </p>
    </body>
    </html>
  `;
}

async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const siteUrl = Deno.env.get('SITE_URL')!;
  const verifyUrl = `${siteUrl}/en/verify?token=${token}`;
  const unsubscribeUrl = `${siteUrl}/en/unsubscribe?token=${token}`;
  const fromAddress = Deno.env.get('EMAIL_FROM') || 'Tech Moncton <noreply@monctontechhive.ca>';
  const subject = 'Verify your Tech Moncton subscription';
  const html = getEmailHtml(verifyUrl, unsubscribeUrl);

  // Production: use Resend
  if (resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: email,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send verification email');
    }
    return;
  }

  // Local dev: log verification URL
  console.log(`[DEV] Verification URL: ${verifyUrl}`);
  console.log(`[DEV] Unsubscribe URL: ${unsubscribeUrl}`);
}

// More robust email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false;
  const [localPart] = email.split('@');
  if (localPart.length > 64) return false;
  return true;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, verified, verification_token')
      .eq('email', normalizedEmail)
      .single();

    let token: string;

    if (existing) {
      if (existing.verified) {
        // Already verified - return same message (prevent enumeration)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Please check your email to verify your subscription',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Regenerate token for unverified
        token = crypto.randomUUID();
        await supabase
          .from('subscribers')
          .update({ verification_token: token })
          .eq('id', existing.id);
      }
    } else {
      // New subscriber
      token = crypto.randomUUID();
      const { error } = await supabase
        .from('subscribers')
        .insert({ email: normalizedEmail, verification_token: token });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to subscribe' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Send verification email
    await sendVerificationEmail(normalizedEmail, token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Please check your email to verify your subscription',
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
