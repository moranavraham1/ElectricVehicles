const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  station: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  urgencyLevel: { type: Number, required: true },
  estimatedChargeTime: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionCount: { type: Number, default: 0 },
  laxity: { type: Number, default: null },
  currentBattery: {type: Number,required: false,}
  
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;