const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Station = require('../models/Station');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/favorites - Get all favorites for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email.toLowerCase();

        // Find stations that have the user's email in the likedBy array
        const stations = await Station.find({ likedBy: userEmail });

        // Transform the data to match the frontend expectations
        const favorites = stations.map(station => ({
            stationId: station._id,
            stationName: station['Station Name'] || station.name,
            address: station.Address || station.address,
            city: station.City || station.city,
            chargingPower: station['Charging Power (kW)'] || station.chargingPower,
            availability: station.availability || 'Unknown',
            rating: station.rating || 0,
        }));

        res.status(200).json({
            success: true,
            favorites
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching favorites'
        });
    }
});

// POST /api/favorites/:stationId - Add a station to favorites
router.post('/:stationId', authMiddleware, async (req, res) => {
    try {
        const { stationId } = req.params;
        const userEmail = req.user.email.toLowerCase();

        // Find the station by ID
        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        // Check if the station is already in favorites
        if (station.likedBy.includes(userEmail)) {
            return res.status(200).json({
                success: true,
                message: 'Station is already in favorites'
            });
        }

        // Add the user's email to the likedBy array
        station.likedBy.push(userEmail);
        await station.save();

        res.status(200).json({
            success: true,
            message: 'Station added to favorites'
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding favorite'
        });
    }
});

// DELETE /api/favorites/:stationId - Remove a station from favorites
router.delete('/:stationId', authMiddleware, async (req, res) => {
    try {
        const { stationId } = req.params;
        const userEmail = req.user.email.toLowerCase();

        // Find the station by ID
        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        // Check if the station is in favorites
        if (!station.likedBy.includes(userEmail)) {
            return res.status(200).json({
                success: true,
                message: 'Station is not in favorites'
            });
        }

        // Remove the user's email from the likedBy array
        station.likedBy = station.likedBy.filter(email => email !== userEmail);
        await station.save();

        res.status(200).json({
            success: true,
            message: 'Station removed from favorites'
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing favorite'
        });
    }
});

module.exports = router; 