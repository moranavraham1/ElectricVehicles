const express = require('express');
const Station = require('../Station'); // Import the Station model
const router = express.Router();

// GET /api/stations - Fetch all stations
router.get('/', async (req, res) => {
    try {
        const stations = await Station.find(); // Fetch all stations from MongoDB
        res.json(stations); // Send stations as JSON
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
