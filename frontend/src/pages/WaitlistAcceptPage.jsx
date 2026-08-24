import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function WaitlistAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [data,   setData]   = useState(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setErrMsg('No offer token found in URL.'); return; }
    api.get(`/waitlist/accept/${token}`)
      .then(r => { setData(r.data); setStatus('success'); })
      .catch(err => { setErrMsg(err.response?.data?.message || 'Invalid or expired offer.'); setStatus('error'); });
  }, [token]);

  if (status === 'loading') return (
    <div className="loading-center">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }} />
        <p style={{ color: 'var(--text-2)' }}>Claiming your seat…</p>
      </div>
    </div>
  );

  if (status === 'error') return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }} className="page-enter">
        <div style={{ fontSize: 64, marginBottom: 20 }}>😔</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Offer Expired</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>{errMsg}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">Browse Events</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }} className="page-enter">
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>Your waitlist seat has been booked. Check your email for details.</p>
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>BOOKING REFERENCE</div>
            <div className="gradient-text" style={{ fontSize: 32, fontWeight: 800, letterSpacing: 4 }}>
              {data?.bookingRef}
            </div>
          </div>
          {data?.qrCodeDataUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <div className="qr-wrapper">
                <img src={data.qrCodeDataUrl} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">View My Tickets</button>
          <button onClick={() => navigate('/')} className="btn btn-outline">Browse More</button>
        </div>
      </div>
    </div>
  );
}
