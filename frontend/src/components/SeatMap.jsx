import { useState, useEffect, useContext, useCallback } from 'react';
import { SocketContext } from '../context/SocketContext';
import api from '../api/axios';

export default function SeatMap({ eventId, onSeatsSelected, readOnly = false }) {
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useContext(SocketContext);

  // ── Fetch seat map ───────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get(`/events/${eventId}/seatmap`)
      .then(r => setSeats(r.data.seats || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  // ── Real-time seat updates via Socket.IO ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-event', eventId);

    const handler = (updatedSeats) => {
      setSeats(prev =>
        prev.map(seat => {
          const upd = updatedSeats.find(u => u.seatId === seat.seatId);
          return upd ? { ...seat, status: upd.status } : seat;
        })
      );
      // Deselect seats that are no longer available
      setSelected(prev =>
        prev.filter(sid => {
          const upd = updatedSeats.find(u => u.seatId === sid);
          return !upd || upd.status === 'available';
        })
      );
    };

    socket.on('seat-update', handler);
    return () => {
      socket.emit('leave-event', eventId);
      socket.off('seat-update', handler);
    };
  }, [socket, eventId]);

  // ── Propagate selection upward ───────────────────────────────────────────────
  useEffect(() => {
    const selectedSeats = seats.filter(s => selected.includes(s.seatId));
    onSeatsSelected?.(selected, selectedSeats);
  }, [selected, seats]);

  const toggleSeat = useCallback((seat) => {
    if (readOnly || seat.status !== 'available') return;
    setSelected(prev =>
      prev.includes(seat.seatId)
        ? prev.filter(id => id !== seat.seatId)
        : [...prev, seat.seatId]
    );
  }, [readOnly]);

  // ── Build row map ────────────────────────────────────────────────────────────
  const rowMap = {};
  for (const seat of seats) {
    if (!rowMap[seat.row]) rowMap[seat.row] = [];
    rowMap[seat.row].push(seat);
  }
  const sortedRows = Object.entries(rowMap).sort(([a], [b]) => a.localeCompare(b));
  const maxCol = seats.reduce((m, s) => Math.max(m, s.col), 0);

  // ── Availability stats ───────────────────────────────────────────────────────
  const availCount   = seats.filter(s => s.status === 'available').length;
  const heldCount    = seats.filter(s => s.status === 'held').length;
  const bookedCount  = seats.filter(s => s.status === 'booked').length;

  if (loading) return (
    <div className="loading-center"><div className="spinner" /></div>
  );

  if (seats.length === 0) return (
    <div className="empty-state"><h3>No seat map available</h3></div>
  );

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Available', count: availCount,  color: 'var(--green)' },
          { label: 'Held',      count: heldCount,   color: 'var(--amber)' },
          { label: 'Booked',    count: bookedCount,  color: 'var(--text-3)' }
        ].map(({ label, count, color }) => (
          <div key={label} style={{
            padding: '8px 18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-full)',
            fontSize: 13, color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ color, fontWeight: 700 }}>{count}</span> {label}
          </div>
        ))}
      </div>

      {/* Seat grid */}
      <div className="seat-map-container">
        <div className="screen-bar">S C R E E N</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sortedRows.map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="seat-row">
              <span className="seat-row-label">{rowLabel}</span>
              {Array.from({ length: maxCol }, (_, i) => i + 1).map(col => {
                const seat = rowSeats.find(s => s.col === col);
                if (!seat) return <div key={col} className="seat-gap" />;

                const isSelected = selected.includes(seat.seatId);
                const cls = [
                  'seat',
                  seat.category === 'Premium' ? 'premium' : '',
                  isSelected ? 'selected' : seat.status
                ].filter(Boolean).join(' ');

                return (
                  <button
                    key={seat.seatId}
                    className={cls}
                    onClick={() => toggleSeat(seat)}
                    title={`${seat.seatNumber} — ${seat.category} — ${isSelected ? 'Selected' : seat.status}`}
                    disabled={!isSelected && seat.status !== 'available'}
                  >
                    {seat.category === 'Premium' ? '★' : ''}
                  </button>
                );
              })}
              <span className="seat-row-label">{rowLabel}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="seat-legend">
          {[
            { label: 'Available', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)' },
            { label: 'Selected',  bg: 'rgba(139,92,246,0.4)',   border: '#8b5cf6' },
            { label: 'Held',      bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)' },
            { label: 'Booked',    bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.15)' }
          ].map(({ label, bg, border }) => (
            <div key={label} className="legend-item">
              <div className="legend-dot" style={{ background: bg, borderColor: border }} />
              <span>{label}</span>
            </div>
          ))}
          <div className="legend-item">
            <span style={{ color: 'var(--amber)', fontSize: 14 }}>★</span>
            <span>Premium</span>
          </div>
        </div>

        {/* Selected seats summary */}
        {selected.length > 0 && (
          <div style={{
            marginTop: 16, padding: '12px 24px',
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 'var(--r-md)',
            textAlign: 'center',
            fontSize: 14, color: 'var(--text-1)'
          }}>
            ✓ <strong>{selected.length}</strong> seat{selected.length > 1 ? 's' : ''} selected:{' '}
            {seats.filter(s => selected.includes(s.seatId)).map(s => s.seatNumber).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
