const Waitlist = require('../models/Waitlist');
const SeatInventory = require('../models/SeatInventory');
const User = require('../models/User');
const Event = require('../models/Event');
const { sendWaitlistOffer } = require('./emailService');
const { emitSeatUpdate } = require('../socket');

/**
 * Process the waitlist queue for a given event + category.
 * Finds the next 'waiting' entry, holds a seat for them, and sends an offer email.
 *
 * @param {string} eventId
 * @param {string} category - 'Premium' | 'Standard'
 */
async function processWaitlist(eventId, category) {
  try {
    const wl = await Waitlist.findOne({ event: eventId, category });
    if (!wl) return;

    // Find the next waiting entry (FIFO)
    const nextEntry = wl.entries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))[0];

    if (!nextEntry) return;

    // Find available seat in inventory
    const inv = await SeatInventory.findOne({ event: eventId });
    if (!inv) return;

    const availableSeat = inv.seats.find(s => s.category === category && s.status === 'available');
    if (!availableSeat) return;  // No available seats yet

    const offerTTL = parseInt(process.env.WAITLIST_OFFER_TTL_MINUTES || '15');
    const offerExpiresAt = new Date(Date.now() + offerTTL * 60 * 1000);
    const offerToken = require('crypto').randomUUID();

    // Hold the seat for this customer
    availableSeat.status = 'held';
    availableSeat.heldBy = nextEntry.customer;
    availableSeat.heldAt = new Date();
    availableSeat.holdExpiresAt = offerExpiresAt;
    await inv.save();

    emitSeatUpdate(eventId, [{ seatId: availableSeat.seatId, status: 'held' }]);

    // Update waitlist entry
    nextEntry.status = 'offered';
    nextEntry.offerSentAt = new Date();
    nextEntry.offerExpiresAt = offerExpiresAt;
    nextEntry.offerToken = offerToken;
    nextEntry.offeredSeatId = availableSeat.seatId;
    await wl.save();

    // Send email
    const [customer, event] = await Promise.all([
      User.findById(nextEntry.customer),
      Event.findById(eventId)
    ]);

    if (customer && event) {
      const offerLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/waitlist/accept?token=${offerToken}`;
      await sendWaitlistOffer({
        to: customer.email,
        customerName: customer.name,
        eventTitle: event.title,
        category,
        offerLink,
        expiresAt: offerExpiresAt
      });
    }
  } catch (err) {
    console.error('processWaitlist error:', err.message);
  }
}

module.exports = { processWaitlist };
