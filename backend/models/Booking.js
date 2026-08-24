const mongoose = require('mongoose');

const bookedSeatSchema = new mongoose.Schema({
  seatId:     String,
  seatNumber: String,
  row:        String,
  col:        Number,
  category:   String,
  price:      Number
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  event:       { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seats:       [bookedSeatSchema],
  totalAmount: { type: Number, required: true },
  status:      { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  bookingRef:  { type: String, required: true, unique: true },
  qrCodeDataUrl: { type: String },
  createdAt:   { type: Date, default: Date.now },
  cancelledAt: { type: Date }
});

module.exports = mongoose.model('Booking', bookingSchema);
