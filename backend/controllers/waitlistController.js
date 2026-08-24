const crypto = require('crypto');
const Waitlist = require('../models/Waitlist');
const SeatInventory = require('../models/SeatInventory');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateQR } = require('../services/qrService');
const { sendBookingConfirmation } = require('../services/emailService');
const { emitSeatUpdate } = require('../socket');

// ─── Join Waitlist ────────────────────────────────────────────────────────────
exports.joinWaitlist = async (req, res) => {
  try {
    const { eventId, category } = req.body;
    if (!eventId || !category) {
      return res.status(400).json({ message: 'eventId and category are required' });
    }

    const userId = req.user._id.toString();

    let wl = await Waitlist.findOne({ event: eventId, category });
    if (wl) {
      const already = wl.entries.find(
        e => e.customer.toString() === userId && ['waiting', 'offered'].includes(e.status)
      );
      if (already) return res.status(409).json({ message: 'Already on the waitlist for this category' });
    } else {
      wl = new Waitlist({ event: eventId, category, entries: [] });
    }

    wl.entries.push({ customer: req.user._id });
    await wl.save();

    const position = wl.entries.filter(e => e.status === 'waiting').length;
    res.status(201).json({ message: 'Added to waitlist', position });
  } catch (err) {
    console.error('joinWaitlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Accept Offer (via token link) ───────────────────────────────────────────
exports.acceptOffer = async (req, res) => {
  try {
    const { token } = req.params;
    const now = new Date();

    const wl = await Waitlist.findOne({ 'entries.offerToken': token });
    if (!wl) return res.status(404).json({ message: 'Invalid or expired offer' });

    const entry = wl.entries.find(e => e.offerToken === token);
    if (!entry) return res.status(404).json({ message: 'Offer not found' });
    if (entry.status !== 'offered') return res.status(410).json({ message: 'Offer already used or expired' });
    if (entry.offerExpiresAt < now) return res.status(410).json({ message: 'Offer has expired' });

    // Find the seat held for this customer
    const inv = await SeatInventory.findOne({ event: wl.event });
    if (!inv) return res.status(404).json({ message: 'Inventory not found' });

    const heldSeat = inv.seats.find(
      s => s.seatId === entry.offeredSeatId &&
           s.status === 'held' &&
           s.heldBy?.toString() === entry.customer.toString()
    );
    if (!heldSeat) return res.status(410).json({ message: 'Seat hold has expired' });

    const [customer, event] = await Promise.all([
      User.findById(entry.customer),
      Event.findById(wl.event)
    ]);

    const price = event?.priceMap?.[wl.category] || 0;
    const bookingRef = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    const qrCodeDataUrl = await generateQR(bookingRef);

    // Create booking
    const booking = await Booking.create({
      event: wl.event,
      customer: entry.customer,
      seats: [{
        seatId: heldSeat.seatId,
        seatNumber: heldSeat.seatNumber,
        row: heldSeat.row,
        col: heldSeat.col,
        category: heldSeat.category,
        price
      }],
      totalAmount: price,
      bookingRef,
      qrCodeDataUrl
    });

    // Mark seat as booked
    heldSeat.status = 'booked';
    heldSeat.bookedBy = entry.customer;
    heldSeat.heldBy = null;
    heldSeat.holdExpiresAt = null;
    await inv.save();

    emitSeatUpdate(wl.event.toString(), [{ seatId: heldSeat.seatId, status: 'booked' }]);

    // Complete waitlist entry
    entry.status = 'completed';
    await wl.save();

    // Send confirmation email
    if (customer && event) {
      sendBookingConfirmation({
        to: customer.email,
        customerName: customer.name,
        eventTitle: event.title,
        showDateTime: event.showDateTime,
        seats: [heldSeat],
        bookingRef,
        qrCodeDataUrl
      }).catch(console.error);
    }

    res.json({ message: 'Booking confirmed via waitlist!', booking, bookingRef, qrCodeDataUrl });
  } catch (err) {
    console.error('acceptOffer:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get Waitlist Position ────────────────────────────────────────────────────
exports.getWaitlistPosition = async (req, res) => {
  try {
    const { eventId, category } = req.query;
    const wl = await Waitlist.findOne({ event: eventId, category });
    if (!wl) return res.json({ onWaitlist: false, position: null });

    const userId = req.user._id.toString();
    const entry = wl.entries.find(
      e => e.customer.toString() === userId && ['waiting', 'offered'].includes(e.status)
    );
    if (!entry) return res.json({ onWaitlist: false, position: null });

    const position = wl.entries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))
      .findIndex(e => e.customer.toString() === userId) + 1;

    res.json({ onWaitlist: true, position, status: entry.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
