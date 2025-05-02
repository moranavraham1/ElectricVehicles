const express = require('express');
const Station = require('../Station'); // Import the Station model
const authMiddleware = require('../authMiddleware'); // Middleware for authentication
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

router.post('/:id/like', authMiddleware, async (req, res) => {
    const stationId = req.params.id;
    const userEmail = req.user.email; // קבלת המייל של המשתמש המחובר
  
    try {
      const station = await Station.findById(stationId);
      if (!station) {
        return res.status(404).json({ error: 'Station not found' });
      }
  
      if (!station.likedBy.includes(userEmail)) {
        station.likedBy.push(userEmail); // הוספת המשתמש למועדפים
        await station.save();
      }
  
      res.status(200).json({ message: 'Station liked successfully', likedBy: station.likedBy });
    } catch (error) {
      console.error('Error liking station:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// DELETE /api/stations/:id/unlike - Remove user email from station likes
router.delete('/:id/unlike', authMiddleware, async (req, res) => {
  const stationId = req.params.id;
  const userEmail = req.user.email; // Get email from the authenticated user

  try {
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Check if the email exists in the likedBy array
    const alreadyLiked = station.likedBy.includes(userEmail);
    if (!alreadyLiked) {
      return res.status(400).json({ message: 'User has not liked this station yet' });
    }

    // Remove the email from the likedBy array
    station.likedBy = station.likedBy.filter((email) => email !== userEmail);
    await station.save();

    res.status(200).json({
      message: 'Station unliked successfully',
      likedBy: station.likedBy, // Return the updated likedBy array
    });
  } catch (error) {
    console.error('Error unliking station:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new endpoint to get station details by name
router.get('/details/:stationName', async (req, res) => {
  try {
    const { stationName } = req.params;
    const decodedStationName = decodeURIComponent(stationName);
    
    const station = await Station.findOne({ "Station Name": decodedStationName });
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    res.json(station);
  } catch (error) {
    console.error('Error fetching station details:', error);
    res.status(500).json({ message: 'Error fetching station details' });
  }
});

module.exports = router;
