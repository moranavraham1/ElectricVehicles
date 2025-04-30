const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  stationName: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  chargingStations: { type: Number },
  distance: { type: Number },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'late_registration'], 
    default: 'pending'
  },
  approvalDate: { type: Date },
  rejectionReason: { type: String },
  registrationTime: { type: Date, default: Date.now },
  nearbyAlternatives: [{ 
    stationName: String, 
    address: String,
    city: String,
    appointmentTime: String,
    appointmentDate: String
  }],
});

module.exports = mongoose.model('Appointment', appointmentSchema);
