import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => { logout(); navigate('/'); };
  const avatarLetter = user.name?.[0]?.toUpperCase() || '?';

  const roleBadgeColor = {
    admin:     { bg: 'rgba(239,68,68,0.15)',   text: '#f87171'  },
    organiser: { bg: 'rgba(245,158,11,0.15)',   text: '#fbbf24'  },
    customer:  { bg: 'rgba(139,92,246,0.15)',   text: '#a78bfa'  },
  }[user.role] || { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' };

  return (
    <div className="page page-enter">
      <div className="container" style={{ maxWidth: 640 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>My Profile</h1>
          <p style={{ color: 'var(--text-2)' }}>Your account details and information.</p>
        </div>

        {/* Avatar card */}
        <div className="card card-glow" style={{ padding: '40px 36px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{
            width: 90, height: 90,
            background: 'var(--grad-brand)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 900, color: '#fff',
            margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(139,92,246,0.4)',
          }}>{avatarLetter}</div>

          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{user.name}</h2>
          <span style={{
            display: 'inline-block',
            padding: '5px 16px',
            background: roleBadgeColor.bg, color: roleBadgeColor.text,
            borderRadius: 'var(--r-full)',
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'
          }}>{user.role}</span>
        </div>

        {/* Details card */}
        <div className="card" style={{ padding: '28px 32px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
            Account Details
          </h3>

          {[
            { label: 'Full Name',  value: user.name,  icon: '👤' },
            { label: 'Email Address', value: user.email, icon: '📧' },
            { label: 'Account Role',  value: user.role,  icon: '🔑' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', wordBreak: 'break-all' }}>
                  {value}
                </div>
              </div>
            </div>
          ))}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px 0',
          }}>
            <span style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }}>🕐</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                Session
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green-light)' }}>
                ● Active
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        {user.role === 'customer' && (
          <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Quick Links
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/my-bookings')} className="btn btn-outline" style={{ flex: 1, minWidth: 140 }}>
                🎫 My Tickets
              </button>
              <button onClick={() => navigate('/')} className="btn btn-outline" style={{ flex: 1, minWidth: 140 }}>
                🔍 Browse Events
              </button>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ width: '100%', color: 'var(--red-light)', borderColor: 'rgba(239,68,68,0.25)', padding: '14px' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
