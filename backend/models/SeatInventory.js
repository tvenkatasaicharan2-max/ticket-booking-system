const mongoose = require('mongoose');

const inventorySeatSchema = new mongoose.Schema({
  seatId:       { type: String, required: true },  // unique key per event: "<eventId>-<seatNumber>"
  seatNumber:   { type: String, required: true },
  row:          { type: String, required: true },
  col:          { type: Number, required: true },
  category:     { type: String, enum: ['Premium', 'Standard'], required: true },
  status:       { type: String, enum: ['available', 'held', 'booked'], default: 'available' },
  heldBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  heldAt:       { type: Date, default: null },
  holdExpiresAt:{ type: Date, default: null },
  bookedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: false });

const seatInventorySchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', unique: true, required: true },
  seats: [inventorySeatSchema]
});

module.exports = mongoose.model('SeatInventory', seatInventorySchema);
