import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function OrganiserDashboard() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('events');
  const [events,  setEvents]  = useState([]);
  const [venues,  setVenues]  = useState([]);
  const [eLoading, setELoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryEvent, setSummaryEvent] = useState(null);
  const [sLoading, setSLoading] = useState(false);

  const defaultForm = { title: '', type: 'movie', description: '', bannerUrl: '', venue: '', showDateTime: '', priceMap: { Premium: '', Standard: '' } };
  const [form, setForm]     = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [cMsg, setCMsg]     = useState('');

  const fetchEvents = () => {
    setELoading(true);
    api.get('/events/organiser/mine')
      .then(r => setEvents(r.data))
      .catch(console.error)
      .finally(() => setELoading(false));
  };

  useEffect(() => {
    fetchEvents();
    api.get('/admin/venues').then(r => setVenues(r.data)).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setCMsg('');
    try {
      await api.post('/events', {
        ...form,
        priceMap: { Premium: Number(form.priceMap.Premium), Standard: Number(form.priceMap.Standard) }
      });
      setCMsg('✓ Event created successfully!');
      setForm(defaultForm);
      fetchEvents();
    } catch (err) {
      setCMsg('✕ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setCreating(false);
    }
  };

  const viewSummary = async (ev) => {
    setSummaryEvent(ev);
    setSummary(null); setSLoading(true);
    try {
      const res = await api.get(`/events/${ev._id}/summary`);
      setSummary(res.data);
    } catch { setSummary(null); }
    finally { setSLoading(false); }
    setTab('summary');
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this event?')) return;
    try { await api.delete(`/events/${id}`); fetchEvents(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const TABS = [
    { id: 'events', label: '📅 My Events' },
    { id: 'create', label: '➕ Create Event' },
    { id: 'summary', label: '📊 Revenue', disabled: !summaryEvent }
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Organiser</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
        </div>
        {TABS.map(t => (
          <button key={t.id} className={`sidebar-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => !t.disabled && setTab(t.id)} disabled={t.disabled}
            style={{ opacity: t.disabled ? 0.4 : 1 }}>
            {t.label}
          </button>
        ))}
      </aside>

      <main style={{ padding: '32px 0', overflowY: 'auto' }}>
        {/* My Events */}
        {tab === 'events' && (
          <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>My Events</h1>
              <button onClick={() => setTab('create')} className="btn btn-primary btn-sm">+ Create Event</button>
            </div>
            {eLoading ? <div className="loading-center"><div className="spinner" /></div> :
              events.length === 0 ? (
                <div className="empty-state"><h3>No events yet</h3><p>Create your first event.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {events.map(ev => (
                    <div key={ev._id} className="card" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span className={`badge badge-${ev.type === 'movie' ? 'purple' : 'cyan'}`}>
                              {ev.type === 'movie' ? '🎬' : '🎸'} {ev.type}
                            </span>
                            <span className={`badge badge-${ev.status === 'active' ? 'green' : 'red'}`}>{ev.status}</span>
                          </div>
                          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{ev.title}</h3>
                          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>
                            📅 {new Date(ev.showDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>📍 {ev.venue?.name}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => viewSummary(ev)} className="btn btn-outline btn-sm">📊 Summary</button>
                          {ev.status === 'active' && (
                            <button onClick={() => handleCancel(ev._id)} className="btn btn-danger btn-sm">Cancel</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* Create Event */}
        {tab === 'create' && (
          <div className="page-enter" style={{ maxWidth: 640 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>Create New Event</h1>
            <div className="card" style={{ padding: 32 }}>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Event Title</label>
                    <input className="input" placeholder="e.g. Coldplay World Tour 2026" required
                      value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="label">Type</label>
                    <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="movie">🎬 Movie</option>
                      <option value="concert">🎸 Concert</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Venue Name</label>
                    <input className="input" placeholder="e.g. IMAX Theater" required
                      value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Date & Time</label>
                    <input type="datetime-local" className="input" required
                      value={form.showDateTime} onChange={e => setForm({ ...form, showDateTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="label">Premium Seat Price (₹)</label>
                    <input type="number" className="input" placeholder="500" min={0}
                      value={form.priceMap.Premium} onChange={e => setForm({ ...form, priceMap: { ...form.priceMap, Premium: e.target.value } })} />
                  </div>
                  <div className="form-group">
                    <label className="label">Standard Seat Price (₹)</label>
                    <input type="number" className="input" placeholder="200" min={0}
                      value={form.priceMap.Standard} onChange={e => setForm({ ...form, priceMap: { ...form.priceMap, Standard: e.target.value } })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Banner URL (optional)</label>
                    <input className="input" placeholder="https://example.com/image.jpg"
                      value={form.bannerUrl} onChange={e => setForm({ ...form, bannerUrl: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Description (optional)</label>
                    <textarea className="input" rows={3} placeholder="Event description…"
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      style={{ resize: 'vertical' }} />
                  </div>
                </div>

                {cMsg && (
                  <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--r-md)', fontSize: 14, background: cMsg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${cMsg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: cMsg.startsWith('✓') ? 'var(--green-light)' : 'var(--red-light)' }}>
                    {cMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Creating…' : '+ Create Event'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setTab('events')}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Revenue Summary */}
        {tab === 'summary' && (
          <div className="page-enter">
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{summaryEvent?.title}</h1>
            <p style={{ color: 'var(--text-2)', marginBottom: 28 }}>
              {summaryEvent && new Date(summaryEvent.showDateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
            {sLoading ? <div className="loading-center"><div className="spinner" /></div> :
              summary ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                      { value: `₹${summary.totalRevenue.toLocaleString()}`, label: 'Total Revenue', color: 'var(--green-light)' },
                      { value: summary.totalSeats,  label: 'Tickets Sold',  color: 'var(--purple-light)' },
                      { value: summary.bookings.length, label: 'Bookings',  color: 'var(--cyan-light)' }
                    ].map(({ value, label, color }) => (
                      <div key={label} className="card stat-card">
                        <div className="stat-value" style={{ color }}>{value}</div>
                        <div className="stat-label">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                      <h3 style={{ fontWeight: 700 }}>Booking Details</h3>
                    </div>
                    {summary.bookings.length === 0 ? (
                      <div className="empty-state"><p>No confirmed bookings yet.</p></div>
                    ) : (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Seats</th>
                            <th>Amount</th>
                            <th>Ref</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.bookings.map(b => (
                            <tr key={b._id}>
                              <td><div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{b.customer?.name}</div><div style={{ fontSize: 12 }}>{b.customer?.email}</div></td>
                              <td>{b.seats.map(s => s.seatNumber).join(', ')}</td>
                              <td style={{ fontWeight: 700, color: 'var(--green-light)' }}>₹{b.totalAmount}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{b.bookingRef}</td>
                              <td>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state"><p>Could not load summary.</p></div>
              )
            }
          </div>
        )}
      </main>
    </div>
  );
}
