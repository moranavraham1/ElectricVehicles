const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  stationName: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
