const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String },
  chargingTime: { type: Number }, // in minutes
  initialBattery: { type: Number },
  finalBattery: { type: Number },
  station: { type: String, required: true },
  bookingDate: { type: String, required: true },
  bookingTime: { type: String, required: true }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment; 