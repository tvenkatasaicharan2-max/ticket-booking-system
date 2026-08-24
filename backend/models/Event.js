const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  type:        { type: String, enum: ['movie', 'concert'], required: true },
  description: { type: String, default: '' },
  bannerUrl:   { type: String, default: '' },
  organiser:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue:       { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  showDateTime: { type: Date, required: true },
  priceMap: {
    Premium:  { type: Number, default: 0 },
    Standard: { type: Number, default: 0 }
  },
  status:    { type: String, enum: ['active', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
