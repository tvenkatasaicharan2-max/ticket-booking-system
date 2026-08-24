import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'organiser') navigate('/organiser');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="page-enter">
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--grad-brand)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 16px',
            boxShadow: 'var(--shadow-purple)'
          }}>🎫</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Sign in to TicketSphere</p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--r-md)',
                color: 'var(--red-light)',
                fontSize: 14, marginBottom: 20
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />

          <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>
              Create one →
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: '14px 20px',
          background: 'rgba(139,92,246,0.07)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 'var(--r-md)',
          fontSize: 13, color: 'var(--text-3)', textAlign: 'center'
        }}>
          💡 Admin accounts must be seeded via database. See README for instructions.
        </div>
      </div>
    </div>
  );
}
