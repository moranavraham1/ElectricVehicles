const express = require('express');
const axios = require('axios');
const router = express.Router();

// Generic OSM data fetcher
router.get('/nearby', async (req, res) => {
  const { lat, lon, radius = 1000, amenity } = req.query;

  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"=${amenity}](around:${radius},${lat},${lon});
        way["amenity"=${amenity}](around:${radius},${lat},${lon});
      );
      out body;
      >; 
      out skel qt;
    `;

    const response = await axios.post('https://overpass-api.de/api/interpreter', 
      `data=${encodeURIComponent(overpassQuery)}`, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json(response.data.elements);
  } catch (error) {
    console.error('OSM Fetch Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch OpenStreetMap data', 
      details: error.message 
    });
  }
});

// Reverse geocoding route
router.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon,
        zoom: 18,
        addressdetails: 1
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform reverse geocoding', 
      details: error.message 
    });
  }
});

module.exports = router;