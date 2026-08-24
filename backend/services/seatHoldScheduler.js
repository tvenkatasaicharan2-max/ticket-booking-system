const cron = require('node-cron');
const SeatInventory = require('../models/SeatInventory');
const Waitlist = require('../models/Waitlist');
const { emitSeatUpdate } = require('../socket');
const { processWaitlist } = require('./waitlistService');

/**
 * Background scheduler (runs every 60 seconds):
 *  1. Release expired seat holds → emits seat-update via Socket.IO
 *  2. Expire waitlist offers past their deadline → cascades to next in queue
 */
module.exports = function startScheduler() {
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    // ─── 1. Release expired seat holds ───────────────────────────────────────
    try {
      const inventories = await SeatInventory.find({
        seats: { $elemMatch: { status: 'held', holdExpiresAt: { $lt: now } } }
      });

      for (const inv of inventories) {
        const released = [];
        for (const seat of inv.seats) {
          if (seat.status === 'held' && seat.holdExpiresAt < now) {
            seat.status = 'available';
            seat.heldBy = null;
            seat.heldAt = null;
            seat.holdExpiresAt = null;
            released.push({ seatId: seat.seatId, status: 'available' });
          }
        }
        if (released.length > 0) {
          await inv.save();
          emitSeatUpdate(inv.event.toString(), released);
        }
      }
    } catch (err) {
      console.error('Scheduler [TTL] error:', err.message);
    }

    // ─── 2. Expire stale waitlist offers ─────────────────────────────────────
    try {
      const staleWaitlists = await Waitlist.find({
        entries: { $elemMatch: { status: 'offered', offerExpiresAt: { $lt: now } } }
      });

      for (const wl of staleWaitlists) {
        let changed = false;
        const seatIdsToRelease = [];

        for (const entry of wl.entries) {
          if (entry.status === 'offered' && entry.offerExpiresAt < now) {
            entry.status = 'expired';
            changed = true;
            if (entry.offeredSeatId) seatIdsToRelease.push(entry.offeredSeatId);
          }
        }

        if (changed) {
          await wl.save();

          // ── Release the held seat back to 'available' before offering to next person ──
          if (seatIdsToRelease.length > 0) {
            const inv = await SeatInventory.findOne({ event: wl.event });
            if (inv) {
              const releasedSeats = [];
              for (const seat of inv.seats) {
                if (seatIdsToRelease.includes(seat.seatId) && seat.status === 'held') {
                  seat.status = 'available';
                  seat.heldBy = null;
                  seat.heldAt = null;
                  seat.holdExpiresAt = null;
                  releasedSeats.push({ seatId: seat.seatId, status: 'available' });
                }
              }
              if (releasedSeats.length > 0) {
                await inv.save();
                emitSeatUpdate(wl.event.toString(), releasedSeats);
              }
            }
          }

          // Cascade to next person in queue
          await processWaitlist(wl.event.toString(), wl.category);
        }
      }
    } catch (err) {
      console.error('Scheduler [Waitlist] error:', err.message);
    }
  });

  console.log('\u2705 Background scheduler started (seat TTL + waitlist offers)');
};
