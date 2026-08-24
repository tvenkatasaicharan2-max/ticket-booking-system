import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',        label: 'Home'   },
  { to: '/events',  label: 'Events' },
  { to: '/about',   label: 'About'  },
  { to: '/contact', label: 'Contact'},
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const getRoleLink = () => {
    if (!user) return null;
    if (user.role === 'admin')     return { to: '/admin',     label: '⚙️ Admin Panel'   };
    if (user.role === 'organiser') return { to: '/organiser', label: '📊 Dashboard'     };
    return                                  { to: '/my-bookings', label: '🎫 My Tickets' };
  };
  const roleLink = getRoleLink();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarLetter = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 500,
        height: 68,
        background: 'rgba(5,5,13,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

          {/* ── Logo ──────────────────────────────── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0
            }}>🎫</div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Ticket<span className="gradient-text">Sphere</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                color: isActive(to) ? 'var(--purple-light)' : 'var(--text-2)',
                background: isActive(to) ? 'rgba(139,92,246,0.1)' : 'transparent',
                transition: 'var(--t)',
              }}>{label}</Link>
            ))}
            {roleLink && (
              <Link to={roleLink.to} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                color: isActive(roleLink.to) ? 'var(--purple-light)' : 'var(--text-2)',
                background: isActive(roleLink.to) ? 'rgba(139,92,246,0.1)' : 'transparent',
                transition: 'var(--t)',
              }}>{roleLink.label}</Link>
            )}
          </div>

          {/* ── Right Side ────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              /* ── Profile Dropdown ────────────────── */
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px',
                    background: profileOpen ? 'rgba(139,92,246,0.15)' : 'var(--bg-card)',
                    border: `1px solid ${profileOpen ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-full)',
                    cursor: 'pointer', transition: 'var(--t)',
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    background: 'var(--grad-brand)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0
                  }}>{avatarLetter}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }} className="nav-desktop">
                    {user.name?.split(' ')[0]}
                  </span>
                  <span style={{
                    padding: '2px 7px',
                    background: 'rgba(139,92,246,0.18)', borderRadius: 'var(--r-full)',
                    fontSize: 10, color: 'var(--purple-light)', fontWeight: 700, textTransform: 'uppercase'
                  }} className="nav-desktop">{user.role}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 2 }} className="nav-desktop">▼</span>
                </button>

                {/* Dropdown panel */}
                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    width: 260,
                    background: 'rgba(12,12,28,0.98)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 'var(--r-lg)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(24px)',
                    overflow: 'hidden', zIndex: 600,
                  }}>
                    {/* User info header */}
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 44, height: 44,
                          background: 'var(--grad-brand)', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0
                        }}>{avatarLetter}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--purple-light)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>
                            {user.role}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                        padding: '10px 12px',
                        fontSize: 13, color: 'var(--text-2)',
                        wordBreak: 'break-all'
                      }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 2 }}>EMAIL</span>
                        {user.email}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '8px' }}>
                      {roleLink && (
                        <Link
                          to={roleLink.to}
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 8,
                            fontSize: 14, fontWeight: 600, color: 'var(--text-1)',
                            transition: 'var(--t)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >{roleLink.label}</Link>
                      )}
                      {user.role === 'customer' && (
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 8,
                            fontSize: 14, fontWeight: 600, color: 'var(--text-1)',
                            transition: 'var(--t)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >👤 My Profile</Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 8,
                          fontSize: 14, fontWeight: 600, color: 'var(--red-light)',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          transition: 'var(--t)', textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >🚪 Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}

            {/* ── Hamburger (mobile) ───────────────── */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 10px',
                cursor: 'pointer', fontSize: 18, color: 'var(--text-1)',
              }}
            >{menuOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ─────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, bottom: 0,
          background: 'rgba(5,5,13,0.97)', zIndex: 499,
          padding: '24px 24px',
          display: 'flex', flexDirection: 'column', gap: 8,
          backdropFilter: 'blur(20px)',
        }}>
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px', marginBottom: 8,
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: 'var(--r-lg)',
            }}>
              <div style={{
                width: 44, height: 44,
                background: 'var(--grad-brand)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: '#fff',
              }}>{avatarLetter}</div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', wordBreak: 'break-all' }}>{user.email}</div>
              </div>
            </div>
          )}

          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              padding: '14px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600,
              color: isActive(to) ? 'var(--purple-light)' : 'var(--text-1)',
              background: isActive(to) ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive(to) ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}>{label}</Link>
          ))}

          {roleLink && (
            <Link to={roleLink.to} onClick={() => setMenuOpen(false)} style={{
              padding: '14px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600,
              color: isActive(roleLink.to) ? 'var(--purple-light)' : 'var(--text-1)',
              background: isActive(roleLink.to) ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive(roleLink.to) ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}>{roleLink.label}</Link>
          )}

          {user?.role === 'customer' && (
            <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
              padding: '14px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600,
              color: 'var(--text-1)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>👤 My Profile</Link>
          )}

          {user ? (
            <button onClick={handleLogout} style={{
              marginTop: 8, padding: '14px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600,
              color: 'var(--red-light)', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', textAlign: 'left',
            }}>🚪 Sign Out</button>
          ) : (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn btn-outline" style={{ textAlign: 'center', padding: '14px' }}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center', padding: '14px' }}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
