const crypto = require('crypto');
const Booking = require('../models/Booking');
const SeatInventory = require('../models/SeatInventory');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateQR } = require('../services/qrService');
const { sendBookingConfirmation } = require('../services/emailService');
const { processWaitlist } = require('../services/waitlistService');
const { emitSeatUpdate } = require('../socket');

const HOLD_TTL = () => parseInt(process.env.SEAT_HOLD_TTL_MINUTES || '10');

// ─── Hold Seats ───────────────────────────────────────────────────────────────
exports.holdSeats = async (req, res) => {
  const { eventId, seatIds } = req.body;
  if (!eventId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: 'eventId and seatIds[] are required' });
  }

  try {
    const inv = await SeatInventory.findOne({ event: eventId });
    if (!inv) return res.status(404).json({ message: 'Seat map not found' });

    const userId = req.user._id.toString();
    const holdExpiresAt = new Date(Date.now() + HOLD_TTL() * 60 * 1000);
    const seatSet = new Set(seatIds);

    // Release any stale holds by this user on this event first
    for (const seat of inv.seats) {
      if (seat.status === 'held' && seat.heldBy?.toString() === userId) {
        seat.status = 'available';
        seat.heldBy = null;
        seat.heldAt = null;
        seat.holdExpiresAt = null;
      }
    }

    // Validate all requested seats exist and are available
    const toHold = inv.seats.filter(s => seatSet.has(s.seatId));
    if (toHold.length !== seatIds.length) {
      return res.status(404).json({ message: 'One or more seat IDs not found' });
    }

    const taken = toHold.filter(s => s.status !== 'available');
    if (taken.length > 0) {
      return res.status(409).json({
        message: 'One or more seats are no longer available',
        seats: taken.map(s => s.seatNumber)
      });
    }

    // Atomically mark as held
    for (const seat of inv.seats) {
      if (seatSet.has(seat.seatId)) {
        seat.status = 'held';
        seat.heldBy = req.user._id;
        seat.heldAt = new Date();
        seat.holdExpiresAt = holdExpiresAt;
      }
    }
    await inv.save();

    emitSeatUpdate(eventId, seatIds.map(id => ({ seatId: id, status: 'held' })));

    res.json({ message: 'Seats held', holdExpiresAt, seatIds });
  } catch (err) {
    console.error('holdSeats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Confirm Booking ──────────────────────────────────────────────────────────
exports.confirmBooking = async (req, res) => {
  const { eventId, seatIds } = req.body;
  const userId = req.user._id.toString();

  try {
    const [event, inv, user] = await Promise.all([
      Event.findById(eventId),
      SeatInventory.findOne({ event: eventId }),
      User.findById(userId)
    ]);

    if (!event || !inv || !user) {
      return res.status(404).json({ message: 'Event, inventory or user not found' });
    }

    const seatSet = new Set(seatIds);
    const now = new Date();

    // Verify seats are held by this user and not expired
    const heldSeats = inv.seats.filter(s =>
      seatSet.has(s.seatId) &&
      s.status === 'held' &&
      s.heldBy?.toString() === userId &&
      s.holdExpiresAt > now
    );

    if (heldSeats.length !== seatIds.length) {
      return res.status(409).json({
        message: 'Seat hold expired or seats not held by you. Please re-select your seats.'
      });
    }

    const totalAmount = heldSeats.reduce((sum, s) => sum + (event.priceMap?.[s.category] || 0), 0);
    const bookingRef  = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    const qrCodeDataUrl = await generateQR(bookingRef);

    // Create booking record
    const booking = await Booking.create({
      event: eventId,
      customer: userId,
      seats: heldSeats.map(s => ({
        seatId: s.seatId,
        seatNumber: s.seatNumber,
        row: s.row,
        col: s.col,
        category: s.category,
        price: event.priceMap?.[s.category] || 0
      })),
      totalAmount,
      bookingRef,
      qrCodeDataUrl
    });

    // Mark seats as booked
    for (const seat of inv.seats) {
      if (seatSet.has(seat.seatId)) {
        seat.status = 'booked';
        seat.bookedBy = req.user._id;
        seat.heldBy = null;
        seat.heldAt = null;
        seat.holdExpiresAt = null;
      }
    }
    await inv.save();

    emitSeatUpdate(eventId, seatIds.map(id => ({ seatId: id, status: 'booked' })));

    // Send email async — don't block response
    sendBookingConfirmation({
      to: user.email,
      customerName: user.name,
      eventTitle: event.title,
      showDateTime: event.showDateTime,
      seats: heldSeats,
      bookingRef,
      qrCodeDataUrl
    }).catch(e => console.error('Email send error:', e.message));

    res.status(201).json({ booking, bookingRef, qrCodeDataUrl });
  } catch (err) {
    console.error('confirmBooking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get My Bookings ──────────────────────────────────────────────────────────
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('event', 'title type showDateTime bannerUrl status')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Cancel Booking ───────────────────────────────────────────────────────────
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: 'confirmed'
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found or already cancelled' });

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Release seats
    const inv = await SeatInventory.findOne({ event: booking.event });
    if (inv) {
      const seatIds = new Set(booking.seats.map(s => s.seatId));
      const categories = new Set();

      for (const seat of inv.seats) {
        if (seatIds.has(seat.seatId)) {
          categories.add(seat.category);
          seat.status = 'available';
          seat.bookedBy = null;
        }
      }
      await inv.save();

      emitSeatUpdate(booking.event.toString(),
        [...seatIds].map(id => ({ seatId: id, status: 'available' }))
      );

      // Trigger waitlist processing for each affected category
      for (const cat of categories) {
        processWaitlist(booking.event.toString(), cat).catch(console.error);
      }
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('cancelBooking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
