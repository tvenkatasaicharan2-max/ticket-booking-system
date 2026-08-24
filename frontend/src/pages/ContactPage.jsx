import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  {
    q: 'How long are seats held?',
    a: 'Seats are held for 10 minutes while you checkout. If you abandon the checkout, they are automatically released.'
  },
  {
    q: 'What happens when an event is sold out?',
    a: 'You can join the waitlist for your preferred seat category. When a cancellation happens, you will receive an email offer within seconds.'
  },
  {
    q: 'How do I use my QR code ticket?',
    a: 'Your QR code is emailed to you upon booking confirmation. Show it at the venue entrance for scanning. You can also view it under "My Tickets".'
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes. Go to My Tickets, find your booking, and click Cancel. The seat is immediately released (or offered to a waitlisted customer).'
  },
  {
    q: 'How do I become an organiser?',
    a: 'Select "Organiser" when registering your account. You will then have access to create and manage events and view booking summaries.'
  },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm]       = useState({ name: '', email: '', message: '' });
  const [sent, setSent]       = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app this would POST to a contact API
    setSent(true);
  };

  return (
    <div className="page-enter">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center' }} className="hero-bg">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 'var(--r-full)', marginBottom: 24,
            fontSize: 13, color: 'var(--green-light)', fontWeight: 600
          }}>💬 We're here to help</div>

          <h1 style={{ fontSize: 'clamp(36px,6vw,68px)', fontWeight: 800, marginBottom: 20 }}>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 500, margin: '0 auto' }}>
            Have a question or issue? Check the FAQs below or send us a message.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'start' }}>

            {/* ── Contact Form ──────────────────────── */}
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Send a Message</h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 28, fontSize: 14 }}>
                Fill out the form and we'll get back to you as soon as possible.
              </p>

              {sent ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text-2)' }}>Thanks for reaching out. We'll get back to you soon.</p>
                  <button onClick={() => setSent(false)} className="btn btn-outline" style={{ marginTop: 24 }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                        Full Name
                      </label>
                      <input
                        type="text" required placeholder="Your name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                        Email Address
                      </label>
                      <input
                        type="email" required placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                        Message
                      </label>
                      <textarea
                        required rows={5} placeholder="Describe your issue or question…"
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className="input"
                        style={{ resize: 'vertical', minHeight: 120 }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '14px' }}>
                      Send Message →
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Right side: Info + FAQs ───────────── */}
            <div>
              {/* Contact Info */}
              <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-2)', textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.08em' }}>
                  Contact Info
                </h3>
                {[
                  { icon: '📧', label: 'Email',   value: 'support@ticketsphere.app' },
                  { icon: '🌐', label: 'Website', value: 'ticketsphere.app'          },
                  { icon: '⏰', label: 'Hours',   value: 'Mon–Fri, 9am–6pm IST'      },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
                  Frequently Asked Questions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {FAQS.map((faq, i) => (
                    <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '16px 20px',
                          background: 'transparent', border: 'none',
                          cursor: 'pointer', color: 'var(--text-1)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          gap: 12, fontSize: 14, fontWeight: 600,
                        }}
                      >
                        {faq.q}
                        <span style={{
                          fontSize: 12, color: 'var(--purple-light)', flexShrink: 0,
                          transform: openFaq === i ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}>▼</span>
                      </button>
                      {openFaq === i && (
                        <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
