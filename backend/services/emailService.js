const { Resend } = require('resend');

// Railway blocks all outbound SMTP — using Resend's HTTP API instead
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'TicketSphere <onboarding@resend.dev>';

// Verify API key is configured on startup
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is not set — emails will not be sent!');
} else {
  console.log('✅ Resend email service ready.');
}

/**
 * Send booking confirmation email with embedded QR code.
 */
async function sendBookingConfirmation({ to, customerName, eventTitle, showDateTime, seats, bookingRef, qrCodeDataUrl }) {
  const seatList = seats.map(s => `<strong>${s.seatNumber}</strong> (${s.category})`).join(', ');
  const formattedDate = new Date(showDateTime).toLocaleString('en-IN', {
    dateStyle: 'full', timeStyle: 'short'
  });

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
        <p style="color:#94a3b8;margin:8px 0">📅 <span>${formattedDate}</span></p>
        <p style="color:#94a3b8;margin:8px 0">💺 Seats: ${seatList}</p>
        <p style="color:#94a3b8;margin:8px 0">🔖 Booking Ref: <strong style="color:#f8fafc;font-size:18px;letter-spacing:2px">${bookingRef}</strong></p>
      </div>
      <div style="text-align:center;margin:32px 0">
        <p style="color:#94a3b8;margin-bottom:16px;font-size:14px">Show this QR code at the venue:</p>
        <img src="${qrCodeDataUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:12px;background:#fff;padding:8px"/>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0">This is an automated message. Please do not reply.</p>
    </div>
  </div>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `Booking Confirmed: ${eventTitle}`,
    html
  });

  if (error) throw new Error(error.message);
}

/**
 * Send waitlist seat offer email with a time-limited claim link.
 */
async function sendWaitlistOffer({ to, customerName, eventTitle, category, offerLink, expiresAt }) {
  const formattedExpiry = new Date(expiresAt).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short'
  });

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
      </div>
      <div style="text-align:center;margin:32px 0">
        <a href="${offerLink}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700">
          Claim Your Seat Now
        </a>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0">If you don't claim before the deadline, the seat will be offered to the next person.</p>
    </div>
  </div>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `Seat Available for ${eventTitle} — Act Fast!`,
    html
  });

  if (error) throw new Error(error.message);
}

/**
 * Send a simple test email to verify Resend config is working.
 */
async function sendTestEmail(to) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: '✅ TicketSphere — Email Test',
    html: `<div style="font-family:Arial,sans-serif;padding:32px;max-width:500px">
      <h2>📧 Email is working!</h2>
      <p>Your TicketSphere email configuration is correctly set up via Resend.</p>
      <p>Booking confirmation emails with QR codes will be delivered to customers.</p>
    </div>`
  });

  if (error) throw new Error(error.message);
}

module.exports = { sendBookingConfirmation, sendWaitlistOffer, sendTestEmail };
