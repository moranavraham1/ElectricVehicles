const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  station: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },

  urgencyLevel: { 
    type: Number, 
    required: true,
    min: 1,
    max: 100 
  },
  estimatedChargeTime: { 
    type: Number, 
    required: true,
    default: 30 // in minutes
  },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed', 'paid'], 
    default: 'pending' 
  },
  rejectionCount: { type: Number, default: 0 },
  laxity: { type: Number, default: null },
  currentBattery: { 
    type: Number, 
    required: false,
    min: 0,
    max: 100
  },
  // Payment information
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentAmount: { type: Number },
  paymentDate: { type: Date },
  paymentMethod: { type: String },
  // Charging information
  initialBattery: { type: Number },
  finalBattery: { type: Number }
});

// Create a compound index for user, station, date and time for faster lookups
bookingSchema.index({ user: 1, station: 1, date: 1, time: 1 }, { unique: true });

// Create index for faster queue lookups
bookingSchema.index({ station: 1, date: 1, time: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);


module.exports = Booking;