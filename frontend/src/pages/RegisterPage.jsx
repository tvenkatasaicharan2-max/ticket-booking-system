import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const ROLES = [
  { value: 'customer',  label: '🎟️ Customer',  desc: 'Browse and book event tickets' },
  { value: 'organiser', label: '🎭 Organiser', desc: 'Create and manage events' }
];

export default function RegisterPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate(form.role === 'organiser' ? '/organiser' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 480 }} className="page-enter">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--grad-brand)', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 16px', boxShadow: 'var(--shadow-purple)'
          }}>🎫</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Join TicketSphere today</p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            {/* Role picker */}
            <div className="form-group">
              <label className="label">I am a</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 'var(--r-md)',
                      border: `2px solid ${form.role === r.value ? 'var(--purple)' : 'var(--border)'}`,
                      background: form.role === r.value ? 'rgba(139,92,246,0.12)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--t)'
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: form.role === r.value ? 'var(--purple-light)' : 'var(--text-1)', marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-md)', color: 'var(--red-light)', fontSize: 14, marginBottom: 20 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create Account →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />
          <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
