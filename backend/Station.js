const mongoose = require('mongoose');

// יצירת סכימה לתחנה
const stationSchema = new mongoose.Schema({
  'Station Name': { type: String, required: true },
  'Address': { type: String, required: true },
  'City': { type: String, required: true },
  'Latitude': { type: Number, required: true },
  'Longitude': { type: Number, required: true },
  'Operator': { type: String, required: true },
 
});

module.exports = mongoose.model('Station', stationSchema);