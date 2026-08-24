import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getRoleLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return { to: '/admin', label: 'Admin' };
    if (user.role === 'organiser') return { to: '/organiser', label: 'Dashboard' };
    return { to: '/my-bookings', label: 'My Tickets' };
  };

  const roleLink = getRoleLink();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 500,
      height: 72,
      background: 'rgba(5,5,13,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>🎫</div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Ticket<span className="gradient-text">Sphere</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: location.pathname === '/' ? 'var(--purple-light)' : 'var(--text-2)',
            background: location.pathname === '/' ? 'rgba(139,92,246,0.1)' : 'transparent',
            transition: 'var(--t)'
          }}>Browse</Link>

          {roleLink && (
            <Link to={roleLink.to} style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: location.pathname.startsWith(roleLink.to) ? 'var(--purple-light)' : 'var(--text-2)',
              background: location.pathname.startsWith(roleLink.to) ? 'rgba(139,92,246,0.1)' : 'transparent',
              transition: 'var(--t)'
            }}>{roleLink.label}</Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)',
                fontSize: 13, color: 'var(--text-2)'
              }}>
                <div style={{
                  width: 26, height: 26,
                  background: 'var(--grad-brand)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff'
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>
                <span style={{
                  padding: '2px 7px',
                  background: 'rgba(139,92,246,0.15)',
                  borderRadius: 'var(--r-full)',
                  fontSize: 11,
                  color: 'var(--purple-light)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
