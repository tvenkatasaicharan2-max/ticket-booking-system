import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [qrModal, setQrModal]   = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings/my')
      .then(r => setBookings(Array.isArray(r.data) ? r.data : []))
      .catch(err => { console.error(err); setBookings([]); })
      .finally(() => setLoading(false));
  };
  useEffect(fetchBookings, []);

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page page-enter">
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>My Tickets</h1>
          <p style={{ color: 'var(--text-2)' }}>Your booking history and QR code tickets.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎟️</div>
            <h3>No bookings yet</h3>
            <p>Browse events and book your first ticket!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {bookings?.map(b => (
              <div key={b._id} className="card card-glow" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge badge-${b.status === 'confirmed' ? 'green' : 'red'}`}>
                        {b.status === 'confirmed' ? '✓ Confirmed' : '✕ Cancelled'}
                      </span>
                      <span className={`badge badge-${b.event?.type === 'movie' ? 'purple' : 'cyan'}`}>
                        {b.event?.type === 'movie' ? '🎬' : '🎸'} {b.event?.type}
                      </span>
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{b.event?.title}</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 12 }}>
                      📅 {new Date(b.event?.showDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      {b.seats.map(s => (
                        <span key={s.seatId} className={`badge badge-${s.category === 'Premium' ? 'amber' : 'purple'}`}>
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Paid</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }} className="gradient-text">₹{b.totalAmount}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Booking Ref</div>
                        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: 'var(--text-1)' }}>{b.bookingRef}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR + Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
                    {b.qrCodeDataUrl && b.status === 'confirmed' && (
                      <button onClick={() => setQrModal(b)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <div className="qr-wrapper" style={{ width: 90, height: 90 }}>
                          <img src={b.qrCodeDataUrl} alt="QR" style={{ width: 66, height: 66 }} />
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--purple-light)', marginTop: 4, textAlign: 'center' }}>View QR</p>
                      </button>
                    )}

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        className="btn btn-danger btn-sm"
                        disabled={cancellingId === b._id}
                      >
                        {cancellingId === b._id ? 'Cancelling…' : 'Cancel Booking'}
                      </button>
                    )}
                    {b.status === 'cancelled' && (
                      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                        Cancelled {b.cancelledAt ? new Date(b.cancelledAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: 6 }}>{qrModal.event?.title}</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>
                {new Date(qrModal.event?.showDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <div className="qr-wrapper" style={{ display: 'inline-block', marginBottom: 16 }}>
                <img src={qrModal.qrCodeDataUrl} alt="QR Code" style={{ width: 220, height: 220, display: 'block' }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>Booking Reference</p>
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4 }} className="gradient-text">{qrModal.bookingRef}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                {qrModal.seats.map(s => (
                  <span key={s.seatId} className="badge badge-purple">{s.seatNumber} — {s.category}</span>
                ))}
              </div>
              <button onClick={() => setQrModal(null)} className="btn btn-outline" style={{ marginTop: 24 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
