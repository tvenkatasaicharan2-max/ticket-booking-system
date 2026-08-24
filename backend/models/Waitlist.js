const mongoose = require('mongoose');

const waitlistEntrySchema = new mongoose.Schema({
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt:      { type: Date, default: Date.now },
  offerSentAt:   { type: Date },
  offerExpiresAt:{ type: Date },
  offerToken:    { type: String },
  // held seatId associated with this offer (so scheduler can release if expired)
  offeredSeatId: { type: String },
  status: {
    type: String,
    enum: ['waiting', 'offered', 'completed', 'expired'],
    default: 'waiting'
  }
});

const waitlistSchema = new mongoose.Schema({
  event:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  category: { type: String, enum: ['Premium', 'Standard'], required: true },
  entries:  [waitlistEntrySchema]
});

waitlistSchema.index({ event: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
