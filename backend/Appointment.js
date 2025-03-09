const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  stationName: { type: String, required: true },
  appointmentDate: { type: String, required: true }, // פורמט YYYY-MM-DD
  appointmentTime: { type: String, required: true }, // פורמט HH:MM
  // שדות נוספים במידת הצורך
});

module.exports = mongoose.model('Appointment', appointmentSchema);
