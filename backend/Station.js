const mongoose = require('mongoose');

// יצירת סכימה לתחנה
const stationSchema = new mongoose.Schema({
  'Station Name': { type: String, required: true },
  'Address': { type: String, required: true },
  'City': { type: String, required: true },
  'Latitude': { type: Number, required: true },
  'Longitude': { type: Number, required: true },
  'Operator': { type: String, required: true },
  'Duplicate Count': {
    type: Number,
    required: true,
    default: 0,
    set: (value) => {
      // בדיקה והמרה למספר שלם
      if (isNaN(value) || value === null || value === undefined) {
        return 0; // ברירת מחדל במקרה של NaN
      }
      return Math.floor(value); // המרה למספר שלם
    },
    validate: {
      validator: (value) => Number.isInteger(value),
      message: 'Duplicate Count must be an integer'
    }
  }
});

module.exports = mongoose.model('Station', stationSchema);
