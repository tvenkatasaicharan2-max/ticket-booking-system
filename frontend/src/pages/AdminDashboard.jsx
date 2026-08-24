import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('venues');

  // Venue state
  const [venues, setVenues]   = useState([]);
  const [vLoading, setVLoading] = useState(true);
  const [vForm, setVForm]     = useState({ name: '', address: '', rows: 8, cols: 10, premiumRows: ['A', 'B'] });
  const [creating, setCreating] = useState(false);
  const [vMsg, setVMsg]       = useState('');

  const fetchVenues = () => {
    setVLoading(true);
    api.get('/admin/venues')
      .then(r => setVenues(Array.isArray(r.data) ? r.data : []))
      .catch(err => { console.error(err); setVenues([]); })
      .finally(() => setVLoading(false));
  };

  useEffect(fetchVenues, []);

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setCreating(true); setVMsg('');
    try {
      await api.post('/admin/venues', {
        name: vForm.name,
        address: vForm.address,
        rows: parseInt(vForm.rows),
        cols: parseInt(vForm.cols),
        premiumRows: vForm.premiumRows
      });
      setVMsg('✓ Venue created successfully!');
      setVForm({ name: '', address: '', rows: 8, cols: 10, premiumRows: ['A', 'B'] });
      fetchVenues();
    } catch (err) {
      setVMsg('✕ ' + (err.response?.data?.message || 'Failed to create venue'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!confirm('Delete this venue?')) return;
    try { await api.delete(`/admin/venues/${id}`); fetchVenues(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const togglePremiumRow = (rowLabel) => {
    setVForm(f => ({
      ...f,
      premiumRows: f.premiumRows.includes(rowLabel)
        ? f.premiumRows.filter(r => r !== rowLabel)
        : [...f.premiumRows, rowLabel]
    }));
  };

  const previewRows = Array.from({ length: Math.min(vForm.rows, 26) }, (_, i) => ROW_LABELS[i]);

  const TABS = [
    { id: 'venues', label: '🏛️ Venues' },
    { id: 'create', label: '➕ Create Venue' }
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Admin Panel</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
        </div>
        {TABS.map(t => (
          <button key={t.id} className={`sidebar-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main style={{ padding: '32px 0', overflowY: 'auto' }}>
        {/* Venues list */}
        {tab === 'venues' && (
          <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>Venues</h1>
              <button onClick={() => setTab('create')} className="btn btn-primary btn-sm">+ New Venue</button>
            </div>
            {vLoading ? <div className="loading-center"><div className="spinner" /></div> :
              venues.length === 0 ? (
                <div className="empty-state"><h3>No venues yet</h3><p>Create your first venue.</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {venues?.map(v => (
                    <div key={v._id} className="card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{v.name}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>📍 {v.address}</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span className="badge badge-purple">{v.seats.length} total seats</span>
                          <span className="badge badge-amber">{v.seats.filter(s => s.category === 'Premium').length} Premium</span>
                          <span className="badge badge-cyan">{v.seats.filter(s => s.category === 'Standard').length} Standard</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteVenue(v._id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* Create venue */}
        {tab === 'create' && (
          <div className="page-enter" style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>Create New Venue</h1>
            <div className="card" style={{ padding: 32 }}>
              <form onSubmit={handleCreateVenue}>
                <div className="form-group">
                  <label className="label">Venue Name</label>
                  <input className="input" placeholder="e.g. PVR Cinemas IMAX" required
                    value={vForm.name} onChange={e => setVForm({ ...vForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Address</label>
                  <input className="input" placeholder="Full address"
                    value={vForm.address} onChange={e => setVForm({ ...vForm, address: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="label">Rows (A–Z)</label>
                    <input type="number" className="input" min={1} max={26}
                      value={vForm.rows} onChange={e => setVForm({ ...vForm, rows: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="label">Seats per Row</label>
                    <input type="number" className="input" min={1} max={50}
                      value={vForm.cols} onChange={e => setVForm({ ...vForm, cols: e.target.value })} />
                  </div>
                </div>

                {/* Premium row selector */}
                <div className="form-group">
                  <label className="label">Premium Rows (click to toggle)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {previewRows.map(row => (
                      <button
                        key={row} type="button"
                        onClick={() => togglePremiumRow(row)}
                        style={{
                          width: 40, height: 40, borderRadius: 8,
                          border: `2px solid ${vForm.premiumRows.includes(row) ? 'var(--amber)' : 'var(--border)'}`,
                          background: vForm.premiumRows.includes(row) ? 'rgba(245,158,11,0.15)' : 'var(--bg-card)',
                          color: vForm.premiumRows.includes(row) ? 'var(--amber-light)' : 'var(--text-2)',
                          fontWeight: 700, cursor: 'pointer', transition: 'var(--t)'
                        }}
                      >{row}</button>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                    {vForm.premiumRows.length > 0 ? `★ Premium: ${vForm.premiumRows.join(', ')}` : 'No premium rows selected — all seats will be Standard.'}
                  </p>
                </div>

                <div style={{ padding: '12px 16px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 20, fontSize: 13, color: 'var(--text-2)' }}>
                  Total seats: <strong>{Math.min(vForm.rows, 26) * vForm.cols}</strong>
                  {' '}({vForm.premiumRows.length * vForm.cols} Premium,{' '}
                  {(Math.min(vForm.rows, 26) - vForm.premiumRows.length) * vForm.cols} Standard)
                </div>

                {vMsg && (
                  <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--r-md)', fontSize: 14, background: vMsg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${vMsg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: vMsg.startsWith('✓') ? 'var(--green-light)' : 'var(--red-light)' }}>
                    {vMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Creating…' : '+ Create Venue'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setTab('venues')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
