const Venue = require('../models/Venue');
const User  = require('../models/User');

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

exports.createVenue = async (req, res) => {
  try {
    const { name, address, rows, cols, premiumRows } = req.body;

    if (!name || !address || !rows || !cols) {
      return res.status(400).json({ message: 'name, address, rows and cols are required' });
    }

    const seats = [];
    for (let r = 0; r < rows && r < ROW_LABELS.length; r++) {
      const rowLabel = ROW_LABELS[r];
      for (let c = 1; c <= cols; c++) {
        seats.push({
          seatNumber: `${rowLabel}${c}`,
          row: rowLabel,
          col: c,
          category: (premiumRows || []).includes(rowLabel) ? 'Premium' : 'Standard'
        });
      }
    }

    const venue = new Venue({ name, address, seats, createdBy: req.user._id });
    await venue.save();
    res.status(201).json(venue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listVenues = async (_req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json({ message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
