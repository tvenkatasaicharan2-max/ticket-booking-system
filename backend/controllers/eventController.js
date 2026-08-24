const Event = require('../models/Event');
const Venue = require('../models/Venue');
const SeatInventory = require('../models/SeatInventory');
const Booking = require('../models/Booking');

// ─── Public ───────────────────────────────────────────────────────────────────

exports.listEvents = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = { status: 'active' };
    if (type && ['movie', 'concert'].includes(type)) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const events = await Event.find(filter)
      .populate('venue', 'name address')
      .populate('organiser', 'name')
      .sort({ showDateTime: 1 });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('venue', 'name address seats')
      .populate('organiser', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSeatMap = async (req, res) => {
  try {
    const inventory = await SeatInventory.findOne({ event: req.params.id });
    if (!inventory) return res.status(404).json({ message: 'Seat map not found' });
    res.json({ seats: inventory.seats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Organiser / Admin ────────────────────────────────────────────────────────

exports.createEvent = async (req, res) => {
  try {
    const { title, type, description, bannerUrl, venue: venueInput, showDateTime, priceMap } = req.body;

    let venue;
    const mongoose = require('mongoose');

    if (mongoose.Types.ObjectId.isValid(venueInput)) {
      venue = await Venue.findById(venueInput);
    }

    if (!venue) {
      // Find venue by name
      venue = await Venue.findOne({ name: venueInput });
    }

    if (!venue) {
      // Auto-create a default venue layout (8 rows, 10 columns, A & B premium)
      const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const seats = [];
      const rows = 8;
      const cols = 10;
      const premiumRows = ['A', 'B'];

      for (let r = 0; r < rows && r < ROW_LABELS.length; r++) {
        const rowLabel = ROW_LABELS[r];
        for (let c = 1; c <= cols; c++) {
          seats.push({
            seatNumber: `${rowLabel}${c}`,
            row: rowLabel,
            col: c,
            category: premiumRows.includes(rowLabel) ? 'Premium' : 'Standard'
          });
        }
      }

      venue = new Venue({
        name: venueInput,
        address: `${venueInput} Address`,
        seats,
        createdBy: req.user._id
      });
      await venue.save();
    }

    const event = new Event({
      title, type, description, bannerUrl,
      organiser: req.user._id,
      venue: venue._id,
      showDateTime,
      priceMap: priceMap || { Premium: 0, Standard: 0 }
    });
    await event.save();

    // Mirror venue seats into SeatInventory with all statuses = available
    const inventorySeats = venue.seats.map(s => ({
      seatId: `${event._id}-${s.seatNumber}`,
      seatNumber: s.seatNumber,
      row: s.row,
      col: s.col,
      category: s.category,
      status: 'available'
    }));

    await SeatInventory.create({ event: event._id, seats: inventorySeats });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrganiserEvents = async (req, res) => {
  try {
    const events = await Event.find({ organiser: req.user._id })
      .populate('venue', 'name address')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventSummary = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organiser: req.user.role === 'admin' ? { $exists: true } : req.user._id
    }).populate('venue', 'name');

    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

    const bookings = await Booking.find({ event: req.params.id, status: 'confirmed' })
      .populate('customer', 'name email');

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalSeats   = bookings.reduce((sum, b) => sum + b.seats.length, 0);

    res.json({ event, bookings, totalRevenue, totalSeats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organiser: req.user._id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organiser: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
