import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import api from '../api/axios';

const FILTERS = [
  { label: 'All',     value: '' },
  { label: '🎬 Movies',  value: 'movie' },
  { label: '🎸 Concerts', value: 'concert' }
];

export default function HomePage() {
  const [events, setEvents]   = useState([]);
  const [type,   setType]     = useState('');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (type)   params.type   = type;
    if (search) params.search = search;

    api.get('/events', { params })
      .then(r => setEvents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type, search]);

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="hero-bg" style={{ padding: '80px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 'var(--r-full)',
            marginBottom: 24,
            fontSize: 13, color: 'var(--purple-light)', fontWeight: 600
          }}>
            🎫 Real-time seat booking
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.05 }}>
            Your Next Experience<br />
            <span className="gradient-text">Starts Here</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 500, margin: '0 auto 40px' }}>
            Book seats for movies and concerts in real-time. Choose your perfect spot and get your QR ticket instantly.
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex', gap: 12, maxWidth: 560, margin: '0 auto',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--r-xl)',
            padding: '8px 8px 8px 20px',
            backdropFilter: 'blur(20px)'
          }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events, movies, concerts…"
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', color: 'var(--text-1)', fontSize: 15
              }}
            />
            <button className="btn btn-primary" style={{ borderRadius: 'var(--r-lg)' }}>
              🔍 Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setType(f.value)}
                className={type === f.value ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
              >
                {f.label}
              </button>
            ))}
            {(type || search) && (
              <button onClick={() => { setType(''); setSearch(''); }}
                className="btn btn-outline btn-sm" style={{ color: 'var(--red-light)', borderColor: 'rgba(239,68,68,0.3)' }}>
                ✕ Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎟️</div>
              <h3>No events found</h3>
              <p>Try a different search or check back later.</p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: 14 }}>
                Showing <strong style={{ color: 'var(--text-1)' }}>{events.length}</strong> event{events.length !== 1 ? 's' : ''}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 24
              }}>
                {events.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
