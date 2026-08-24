import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function useCountdown(expiresAt) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const calc = () => Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
    setSecs(calc());
    const id = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { display: `${m}:${s}`, secs, expired: secs === 0 };
}

export default function CheckoutPage() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedIds = [], selectedSeats = [], holdExpiresAt, event } = location.state || {};

  const { display, secs, expired } = useCountdown(holdExpiresAt);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!selectedIds.length) navigate(-1);
  }, []);

  const handleConfirm = async () => {
    setConfirming(true); setError('');
    try {
      const res = await api.post('/bookings/confirm', { eventId, seatIds: selectedIds });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const totalAmount = selectedSeats.reduce((s, seat) => s + (event?.priceMap?.[seat.category] || 0), 0);

  // ── Success view ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }} className="page-enter">
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Booking Confirmed!</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>Check your email for the QR code ticket.</p>

          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>BOOKING REFERENCE</div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 4 }} className="gradient-text">
                {success.bookingRef}
              </div>
            </div>
            {success.qrCodeDataUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <div className="qr-wrapper">
                  <img src={success.qrCodeDataUrl} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">
              View My Tickets
            </button>
            <button onClick={() => navigate('/')} className="btn btn-outline">
              Browse More Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-enter">
      <div className="container" style={{ maxWidth: 640 }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 32 }}>
          ← Back to Seat Map
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Confirm Booking</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>Review your order before confirming.</p>

        {/* Countdown Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '20px 24px',
          background: expired ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${expired ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`,
          borderRadius: 'var(--r-lg)',
          marginBottom: 28
        }}>
          <div style={{ fontSize: 32 }}>{expired ? '⚠️' : '⏳'}</div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {expired ? 'Hold Expired' : 'Seats held for'}
            </div>
            <div className={`countdown ${secs < 60 ? 'countdown-urgent' : 'countdown-normal'}`}>
              {expired ? '00:00' : display}
            </div>
          </div>
          {expired && (
            <p style={{ fontSize: 13, color: 'var(--red-light)', marginLeft: 8 }}>
              Your hold has expired. Please go back and re-select your seats.
            </p>
          )}
        </div>

        {/* Event info */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{event?.title}</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            {new Date(event?.showDateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>

        {/* Seats breakdown */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-2)' }}>ORDER SUMMARY</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Seat</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {selectedSeats.map(s => (
                <tr key={s.seatId}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{s.seatNumber}</td>
                  <td>
                    <span className={`badge badge-${s.category === 'Premium' ? 'amber' : 'purple'}`}>
                      {s.category === 'Premium' ? '★ ' : ''}{s.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-1)' }}>
                    ₹{event?.priceMap?.[s.category] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divider" style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 28, fontWeight: 800 }} className="gradient-text">₹{totalAmount}</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-md)', color: 'var(--red-light)', fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleConfirm}
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            disabled={confirming || expired}
          >
            {confirming ? <><span className="spinner spinner-sm" /> Confirming…</> : '✓ Confirm & Pay ₹' + totalAmount}
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-outline btn-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
