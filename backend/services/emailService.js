const Brevo = require('@getbrevo/brevo');

// ── Brevo client setup ─────────────────────────────────────────────────────────
// Brevo free tier: 300 emails/day, sends to ANY recipient email worldwide
// No domain verification needed — just verify the sender email (one click)
const apiInstance = new Brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const SENDER_NAME  = 'TicketSphere';
const SENDER_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'tvenkatasaicharan2006@gmail.com';

// Startup check
if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY is not set — emails will not be sent!');
} else {
  console.log('✅ Brevo email service ready — can send to any recipient worldwide.');
}

/**
 * Internal helper — sends via Brevo API.
 */
async function sendEmail({ to, subject, html }) {
  const email = new Brevo.SendSmtpEmail();
  email.sender      = { name: SENDER_NAME, email: SENDER_EMAIL };
  email.to          = [{ email: to }];
  email.subject     = subject;
  email.htmlContent = html;
  await apiInstance.sendTransacEmail(email);
}

// ── QR image URL helper ────────────────────────────────────────────────────────
// Gmail blocks base64 data: images — use a public QR API URL that Gmail loads fine
function qrUrl(bookingRef) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bookingRef)}&bgcolor=ffffff&color=000000&margin=10`;
}

// ─── Booking Confirmation ─────────────────────────────────────────────────────
/**
 * Send booking confirmation email with QR code to the customer.
 * @param {{ to, customerName, eventTitle, showDateTime, seats, bookingRef, qrCodeDataUrl }} opts
 */
async function sendBookingConfirmation({ to, customerName, eventTitle, showDateTime, seats, bookingRef }) {
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
      <p style="color:#94a3b8;margin:0 0 24px">
        Hi <strong style="color:#f8fafc">${customerName}</strong>, your booking is confirmed.
      </p>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px">
        <h2 style="color:#a78bfa;margin:0 0 16px;font-size:20px">${eventTitle}</h2>
        <p style="color:#94a3b8;margin:8px 0">📅 ${formattedDate}</p>
        <p style="color:#94a3b8;margin:8px 0">💺 Seats: ${seatList}</p>
        <p style="color:#94a3b8;margin:8px 0">
          🔖 Booking Ref:
          <strong style="color:#f8fafc;font-size:18px;letter-spacing:2px">${bookingRef}</strong>
        </p>
      </div>
      <div style="text-align:center;margin:32px 0">
        <p style="color:#94a3b8;margin-bottom:16px;font-size:14px">Show this QR code at the venue:</p>
        <img src="${qrUrl(bookingRef)}" alt="QR Code" width="220" height="220"
          style="border-radius:12px;background:#fff;padding:8px;display:block;margin:0 auto"/>
        <p style="color:#64748b;font-size:12px;margin-top:12px">Scan code encodes: ${bookingRef}</p>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0">
        This is an automated message from TicketSphere. Please do not reply.
      </p>
    </div>
  </div>`;

  await sendEmail({ to, subject: `🎫 Booking Confirmed: ${eventTitle}`, html });
}

// ─── Waitlist Offer ───────────────────────────────────────────────────────────
/**
 * Send waitlist seat offer email with a time-limited claim link.
 * @param {{ to, customerName, eventTitle, category, offerLink, expiresAt }} opts
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
      <p style="color:#94a3b8;margin:0 0 16px">
        Hi <strong style="color:#f8fafc">${customerName}</strong>,
      </p>
      <p style="color:#94a3b8">
        A <strong style="color:#f59e0b">${category}</strong> seat is now available for
        <strong style="color:#f8fafc">${eventTitle}</strong>.
      </p>
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:16px;margin:20px 0">
        <p style="color:#ef4444;margin:0;font-weight:600">⏰ Offer expires: ${formattedExpiry}</p>
        <p style="color:#94a3b8;font-size:13px;margin:6px 0 0">
          If you don't claim before the deadline, the seat will be offered to the next person.
        </p>
      </div>
      <div style="text-align:center;margin:32px 0">
        <a href="${offerLink}"
          style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;text-decoration:none;padding:18px 44px;border-radius:12px;font-size:16px;font-weight:700">
          Claim Your Seat Now →
        </a>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0">
        This is an automated message from TicketSphere. Please do not reply.
      </p>
    </div>
  </div>`;

  await sendEmail({ to, subject: `🎟️ Seat Available for ${eventTitle} — Act Fast!`, html });
}

// ─── Test Email ───────────────────────────────────────────────────────────────
/**
 * Send a test email to verify Brevo config — hit GET /api/health/email-test?to=any@email.com
 */
async function sendTestEmail(to) {
  await sendEmail({
    to,
    subject: '✅ TicketSphere — Email Delivery Test',
    html: `
    <div style="font-family:Arial,sans-serif;padding:40px;max-width:500px;background:#07070e;color:#f8fafc;border-radius:16px">
      <h2 style="color:#a78bfa">📧 Email is working!</h2>
      <p style="color:#94a3b8">Your TicketSphere email configuration via <strong style="color:#f8fafc">Brevo</strong> is correctly set up.</p>
      <p style="color:#94a3b8">Booking confirmations with QR codes and waitlist offer emails will be delivered to any customer worldwide.</p>
    </div>`
  });
}

module.exports = { sendBookingConfirmation, sendWaitlistOffer, sendTestEmail };
