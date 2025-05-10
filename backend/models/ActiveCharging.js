const mongoose = require('mongoose');

const activeChargingSchema = new mongoose.Schema({
    user: { type: String, required: true },
    station: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date }
});

module.exports = mongoose.model('ActiveCharging', activeChargingSchema);
