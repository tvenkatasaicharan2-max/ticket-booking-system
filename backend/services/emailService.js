const https = require('https');

// ── Brevo REST API — no SDK, no extra deps, works everywhere ─────────────────
// Free tier: 300 emails/day, sends to ANY recipient worldwide
// Requires: BREVO_API_KEY + sender email verified in Brevo dashboard

const BREVO_API_KEY  = process.env.BREVO_API_KEY;
const SENDER_EMAIL   = process.env.EMAIL_FROM_ADDRESS || 'tvenkatasaicharan2006@gmail.com';
const SENDER_NAME    = 'TicketSphere';

if (!BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY is not set — emails will not be sent!');
} else {
  console.log('✅ Brevo email service ready — sends to any recipient worldwide.');
}

/**
 * Internal: POST to Brevo transactional email API using built-in https.
 */
function sendEmail({ to, subject, html }) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
      to:          [{ email: to }],
      subject,
      htmlContent: html,
    });

    const req = https.request({
      hostname: 'api.brevo.com',
      path:     '/v3/smtp/email',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'api-key':        BREVO_API_KEY,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** QR code image URL — Gmail cannot display base64 data: URLs */
function qrUrl(bookingRef) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bookingRef)}&bgcolor=ffffff&color=000000&margin=10`;
}

// ─── Booking Confirmation ─────────────────────────────────────────────────────
async function sendBookingConfirmation({ to, customerName, eventTitle, showDateTime, seats, bookingRef }) {
  const seatList      = seats.map(s => `<strong>${s.seatNumber}</strong> (${s.category})`).join(', ');
  const formattedDate = new Date(showDateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#07070e;color:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
    <div style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);padding:32px;text-align:center">
      <h1 style="margin:0;font-size:28px;font-weight:700">🎫 Booking Confirmed!</h1>
      <p style="margin:8px 0 0;opacity:0.9;font-size:14px">Your tickets are ready. See you there!</p>
    </div>
    <div style="padding:32px">
      <p style="color:#94a3b8;margin:0 0 24px">Hi <strong style="color:#f8fafc">${customerName}</strong>, your booking is confirmed.</p>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px">
        <h2 style="color:#a78bfa;margin:0 0 16px;font-size:20px">${eventTitle}</h2>
        <p style="color:#94a3b8;margin:8px 0">📅 ${formattedDate}</p>
        <p style="color:#94a3b8;margin:8px 0">💺 Seats: ${seatList}</p>
        <p style="color:#94a3b8;margin:8px 0">🔖 Booking Ref: <strong style="color:#f8fafc;font-size:18px;letter-spacing:2px">${bookingRef}</strong></p>
      </div>
      <div style="text-align:center;margin:32px 0">
        <p style="color:#94a3b8;margin-bottom:16px;font-size:14px">Show this QR code at the venue:</p>
        <img src="${qrUrl(bookingRef)}" alt="QR Code" width="220" height="220"
          style="border-radius:12px;background:#fff;padding:8px;display:block;margin:0 auto"/>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0">Automated message from TicketSphere. Do not reply.</p>
    </div>
  </div>`;

  await sendEmail({ to, subject: `🎫 Booking Confirmed: ${eventTitle}`, html });
}

// ─── Waitlist Offer ───────────────────────────────────────────────────────────
async function sendWaitlistOffer({ to, customerName, eventTitle, category, offerLink, expiresAt }) {
  const formattedExpiry = new Date(expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#07070e;color:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
    <div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:32px;text-align:center">
      <h1 style="margin:0;font-size:28px;font-weight:700">🎟️ A Seat Is Available!</h1>
      <p style="margin:8px 0 0;opacity:0.9;font-size:14px">Your waitlist offer — act fast!</p>
    </div>
    <div style="padding:32px">
      <p style="color:#94a3b8;margin:0 0 16px">Hi <strong style="color:#f8fafc">${customerName}</strong>,</p>
      <p style="color:#94a3b8">A <strong style="color:#f59e0b">${category}</strong> seat is now available for <strong style="color:#f8fafc">${eventTitle}</strong>.</p>
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:16px;margin:20px 0">
        <p style="color:#ef4444;margin:0;font-weight:600">⏰ Offer expires: ${formattedExpiry}</p>
        <p style="color:#94a3b8;font-size:13px;margin:6px 0 0">After expiry, the seat is offered to the next person in queue.</p>
      </div>
      <div style="text-align:center;margin:32px 0">
        <a href="${offerLink}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;text-decoration:none;padding:18px 44px;border-radius:12px;font-size:16px;font-weight:700">
          Claim Your Seat Now →
        </a>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0">Automated message from TicketSphere. Do not reply.</p>
    </div>
  </div>`;

  await sendEmail({ to, subject: `🎟️ Seat Available for ${eventTitle} — Act Fast!`, html });
}

// ─── Test Email ───────────────────────────────────────────────────────────────
async function sendTestEmail(to) {
  await sendEmail({
    to,
    subject: '✅ TicketSphere — Email Delivery Test',
    html: `<div style="font-family:Arial,sans-serif;padding:40px;max-width:500px;background:#07070e;color:#f8fafc;border-radius:16px">
      <h2 style="color:#a78bfa">📧 Email is working!</h2>
      <p style="color:#94a3b8">Brevo is configured correctly. Emails will be delivered to <strong style="color:#f8fafc">${to}</strong> and any other customer worldwide.</p>
    </div>`,
  });
}

module.exports = { sendBookingConfirmation, sendWaitlistOffer, sendTestEmail };
