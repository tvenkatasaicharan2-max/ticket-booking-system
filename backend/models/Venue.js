const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },  // e.g. "A1", "B3"
  row:        { type: String, required: true },  // "A", "B", …
  col:        { type: Number, required: true },  // 1, 2, 3, …
  category:   { type: String, enum: ['Premium', 'Standard'], required: true }
}, { _id: false });

const venueSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  address:   { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seats:     [seatSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venue', venueSchema);
