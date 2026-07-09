// Vercel Serverless Function — receives the form POST and emails it to your inbox via Resend.
// Lives at /api/subscribe (any file in /api becomes a function automatically).
// Requires: `npm install resend`  and a RESEND_API_KEY env var set in the Vercel dashboard.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const INBOX = 'hello@edge-labs.io';                 // where signups land
// FROM must be on a domain you've VERIFIED in Resend.
// Before edge-labs.io is verified, use Resend's sandbox sender to test: 'onboarding@resend.dev'
// (sandbox can only deliver to the email on your own Resend account).
const FROM = 'Edge Labs <signups@edge-labs.io>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel parses JSON and form-encoded bodies into req.body for you.
  const body   = req.body || {};
  const email  = String(body.email  || '').trim();
  const source = String(body.source || 'website');
  const honey  = body._honey || body._gotcha || '';

  if (honey) return res.status(200).json({ success: true });          // bot trap → fake success
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email' });

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: INBOX,
      replyTo: email,                    // hit reply to answer the athlete directly
      subject: `New Edge Labs signup — ${source}`,
      html:
        `<h2 style="margin:0 0 12px">New signup</h2>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Source:</strong> ${source}</p>
         <p style="color:#888"><strong>Received:</strong> ${new Date().toUTCString()}</p>`
    });

    if (error) return res.status(502).json({ error: 'Email provider error' });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Send failed' });
  }
}
