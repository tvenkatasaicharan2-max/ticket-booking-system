import { Link } from 'react-router-dom';

const EVENT_ICONS = { movie: '🎬', concert: '🎸' };

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function EventCard({ event }) {
  const icon = EVENT_ICONS[event.type] || '🎟️';
  const minPrice = Math.min(
    event.priceMap?.Premium  || Infinity,
    event.priceMap?.Standard || Infinity
  );

  return (
    <Link to={`/events/${event._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card card-glow" style={{ overflow: 'hidden', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {/* Banner / Placeholder */}
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="event-card-img"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="event-card-img-placeholder" style={{
          display: event.bannerUrl ? 'none' : 'flex',
          background: `linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))`,
          borderBottom: '1px solid var(--border)'
        }}>{icon}</div>

        {/* Content */}
        <div style={{ padding: '18px 20px' }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span className={`badge badge-${event.type === 'movie' ? 'purple' : 'cyan'}`}>
              {icon} {event.type}
            </span>
            {event.status === 'cancelled' && <span className="badge badge-red">Cancelled</span>}
          </div>

          {/* Title */}
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--text-1)', lineHeight: 1.3 }}>
            {event.title}
          </h3>

          {/* Venue */}
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {event.venue?.name}
          </p>

          {/* Date + Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>📅 {formatDate(event.showDateTime)}</span>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>•</span>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{formatTime(event.showDateTime)}</span>
          </div>

          {/* Price + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</div>
              <div style={{ fontSize: 22, fontWeight: 700, background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ₹{minPrice === Infinity ? '—' : minPrice}
              </div>
            </div>
            <div className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>
              Book Now →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
