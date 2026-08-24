import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '🎫', title: 'Real-Time Seat Maps',    desc: 'See live seat availability the moment another user picks or releases a seat — no refresh needed.' },
  { icon: '⏱️', title: '10-Minute Seat Hold',     desc: 'Your selected seats are reserved for 10 minutes while you checkout. Abandoned holds release automatically.' },
  { icon: '📋', title: 'Automatic Waitlists',     desc: 'When an event sells out, join the waitlist. The moment a cancellation happens you get a time-limited offer instantly.' },
  { icon: '📧', title: 'QR Code Tickets',         desc: 'Every confirmed booking delivers a branded email with a scannable QR code ticket straight to your inbox.' },
  { icon: '🔒', title: 'Concurrency-Safe',        desc: 'Our backend prevents two people from booking the same seat simultaneously using atomic database writes.' },
  { icon: '🎬', title: 'Movies & Concerts',       desc: 'Browse and filter events by type. Premium and Standard seating categories with flexible pricing.' },
];

const TEAM = [
  { name: 'TicketSphere Dev', role: 'Full-Stack Engineer', avatar: '👨‍💻' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="page-enter">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }} className="hero-bg">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px',
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 'var(--r-full)', marginBottom: 24,
            fontSize: 13, color: 'var(--cyan-light)', fontWeight: 600
          }}>🚀 Built for the modern fan</div>

          <h1 style={{ fontSize: 'clamp(36px,6vw,68px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.05 }}>
            About <span className="gradient-text">TicketSphere</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 40px' }}>
            TicketSphere is a full-stack ticket booking platform designed to make live event ticketing
            fair, fast, and frustration-free for everyone.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Browse Events
          </button>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>🎯</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Our Mission</h2>
            <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.8 }}>
              High-demand events sell out in seconds, leaving genuine fans with no recourse.
              Last-minute cancellations go to waste when there's no automated reallocation system.
              TicketSphere solves both problems — ensuring every available seat reaches a real customer
              through intelligent hold management and a fair, automatic waitlist system.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              Platform <span className="gradient-text">Features</span>
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 16 }}>
              Every feature is designed around real problems faced in ticket booking.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 24 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: '28px 28px' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text-1)' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
              Tech <span className="gradient-text">Stack</span>
            </h2>
          </div>
          <div className="card" style={{ padding: '36px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16 }}>
              {[
                ['⚛️', 'React 18 + Vite'],
                ['🟩', 'Node.js + Express'],
                ['🍃', 'MongoDB + Mongoose'],
                ['🔄', 'Socket.IO'],
                ['🔐', 'JWT + bcrypt'],
                ['⏰', 'node-cron'],
                ['📨', 'Brevo Email API'],
                ['📊', 'QRCode.js'],
              ].map(([icon, name]) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-1)'
                }}>
                  <span>{icon}</span>{name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 100px', textAlign: 'center' }}>
        <div className="container">
          <div style={{
            padding: '64px 40px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 'var(--r-xl)',
          }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
              Ready to book your next experience?
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: 16 }}>
              Thousands of seats waiting. Real-time availability. Instant QR tickets.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/')}         className="btn btn-primary">Browse Events</button>
              <button onClick={() => navigate('/register')} className="btn btn-outline">Create Account</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
