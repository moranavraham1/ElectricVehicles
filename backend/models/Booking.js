const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  station: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
