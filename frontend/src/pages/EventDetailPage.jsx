import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import api from '../api/axios';

function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { dateStyle: 'full' }); }
function fmtTime(d) { return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holding, setHolding]     = useState(false);
  const [error, setError]         = useState('');

  // Waitlist state
  const [joiningWL, setJoiningWL] = useState(false);
  const [wlCategory, setWlCategory] = useState('Standard');
  const [wlSuccess, setWlSuccess] = useState('');

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => setEvent(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSeatsSelected = (ids, seats) => {
    setSelectedIds(ids);
    setSelectedSeats(seats);
    setError('');
  };

  const handleHold = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'customer') { setError('Only customers can book seats.'); return; }
    if (selectedIds.length === 0) { setError('Please select at least one seat.'); return; }

    setHolding(true); setError('');
    try {
      const res = await api.post('/bookings/hold', { eventId: id, seatIds: selectedIds });
      navigate(`/checkout/${id}`, {
        state: {
          selectedIds,
          selectedSeats,
          holdExpiresAt: res.data.holdExpiresAt,
          event
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not hold seats. Try again.');
    } finally {
      setHolding(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) { navigate('/login'); return; }
    setJoiningWL(true); setError('');
    try {
      const res = await api.post('/waitlist/join', { eventId: id, category: wlCategory });
      setWlSuccess(`You're on the waitlist (position #${res.data.position}). We'll email you when a seat opens.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join waitlist.');
    } finally {
      setJoiningWL(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!event)  return null;

  const totalPrice = selectedSeats.reduce((s, seat) => s + (event.priceMap?.[seat.category] || 0), 0);

  return (
    <div className="page page-enter">
      <div className="container">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 32 }}>
          ← Back
        </button>

        {/* Event Header */}
        <div className="card" style={{ marginBottom: 40, overflow: 'hidden' }}>
          {event.bannerUrl && (
            <div style={{ position: 'relative' }}>
              <img src={event.bannerUrl} alt={event.title} style={{
                width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block'
              }} onError={e => e.target.style.display='none'} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(5,5,13,0.95) 0%, transparent 60%)'
              }} />
            </div>
          )}
          <div style={{ padding: '32px 36px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className={`badge badge-${event.type === 'movie' ? 'purple' : 'cyan'}`}>
                {event.type === 'movie' ? '🎬' : '🎸'} {event.type}
              </span>
              {event.status === 'cancelled' && <span className="badge badge-red">Cancelled</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, marginBottom: 20 }}>{event.title}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 24 }}>
              {[
                { icon: '📅', label: 'Date',    value: fmt(event.showDateTime) },
                { icon: '🕐', label: 'Time',    value: fmtTime(event.showDateTime) },
                { icon: '📍', label: 'Venue',   value: event.venue?.name },
                { icon: '📌', label: 'Address', value: event.venue?.address },
              ].map(({ icon, label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{icon} {label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{value}</div>
                </div>
              ))}
            </div>

            {event.description && (
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>{event.description}</p>
            )}

            {/* Pricing */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(event.priceMap || {}).map(([cat, price]) => (
                <div key={cat} style={{
                  padding: '12px 20px',
                  background: cat === 'Premium' ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)',
                  border: `1px solid ${cat === 'Premium' ? 'rgba(245,158,11,0.25)' : 'rgba(139,92,246,0.2)'}`,
                  borderRadius: 'var(--r-md)'
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {cat === 'Premium' ? '★ ' : ''}{cat}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: cat === 'Premium' ? 'var(--amber-light)' : 'var(--purple-light)' }}>
                    ₹{price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seat Map */}
        {event.status === 'active' && (
          <div className="card" style={{ padding: '32px 24px', marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Select Your Seats</h2>
            <p style={{ color: 'var(--text-2)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
              Click available seats to select them. Seats held by others are shown in amber.
            </p>

            <SeatMap eventId={id} onSeatsSelected={handleSeatsSelected} />

            {/* Booking Panel */}
            {selectedIds.length > 0 && (
              <div style={{
                marginTop: 32, padding: '24px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border-purple)',
                borderRadius: 'var(--r-lg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
                      {selectedIds.length} seat{selectedIds.length > 1 ? 's' : ''} selected
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700 }} className="gradient-text">₹{totalPrice}</div>
                  </div>
                  <button onClick={handleHold} className="btn btn-primary btn-lg" disabled={holding}>
                    {holding ? <><span className="spinner spinner-sm" /> Processing…</> : '🎫 Hold Seats & Checkout'}
                  </button>
                </div>
                {error && <p style={{ color: 'var(--red-light)', marginTop: 12, fontSize: 14 }}>{error}</p>}
              </div>
            )}

            {error && selectedIds.length === 0 && (
              <p style={{ color: 'var(--red-light)', textAlign: 'center', marginTop: 16, fontSize: 14 }}>{error}</p>
            )}
          </div>
        )}

        {/* Waitlist */}
        {event.status === 'active' && user?.role === 'customer' && (
          <div className="card" style={{ padding: '28px 32px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🕐 Join the Waitlist</h3>
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>
              If all seats of a category are sold out, join the waitlist. You'll get a time-limited offer by email when a seat becomes available.
            </p>
            {wlSuccess ? (
              <div style={{ padding: '14px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-md)', color: 'var(--green-light)', fontSize: 14 }}>
                ✓ {wlSuccess}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="input" style={{ width: 'auto', minWidth: 160 }} value={wlCategory} onChange={e => setWlCategory(e.target.value)}>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
                <button onClick={handleJoinWaitlist} className="btn btn-amber" disabled={joiningWL}>
                  {joiningWL ? 'Joining…' : 'Join Waitlist'}
                </button>
                {error && <span style={{ color: 'var(--red-light)', fontSize: 13 }}>{error}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
