const express = require('express');
const router = express.Router();
const ActiveCharging = require('../models/ActiveCharging');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Create new active charging session
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log('Active charging request body:', req.body);
        console.log('User from token:', req.user);
        
        const { station, date, time } = req.body;
        const userId = req.user.userId || req.user.id;

        // Validate required fields
        if (!station || !date || !time) {
            console.log('Missing required fields:', { station, date, time });
            return res.status(400).json({
                message: 'Missing required fields: station, date, time'
            });
        }

        // Check if user already has an active charging session
        const existingCharging = await ActiveCharging.findOne({ user: userId });
        if (existingCharging) {
            console.log('User already has active charging session:', existingCharging);
            return res.status(400).json({ 
                message: 'You already have an active charging session' 
            });
        }

        // Create new active charging record
        const activeCharging = new ActiveCharging({
            user: userId,
            station: station,
            date: date,
            time: time,
            startTime: new Date()
        });

        console.log('Creating active charging record:', activeCharging);
        await activeCharging.save();

        res.status(201).json({
            message: 'Active charging session created successfully',
            activeCharging: activeCharging
        });

    } catch (error) {
        console.error('Error creating active charging session:', error);
        res.status(500).json({ 
            message: 'Error creating active charging session',
            error: error.message 
        });
    }
});

// Delete active charging session
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const { station, date, time } = req.body;
        const userId = req.user.userId || req.user.id;

        // Find and delete the active charging session
        const result = await ActiveCharging.findOneAndDelete({
            user: userId,
            station: station,
            date: date,
            time: time
        });

        if (!result) {
            return res.status(404).json({ 
                message: 'Active charging session not found' 
            });
        }

        res.status(200).json({
            message: 'Active charging session ended successfully',
            session: result
        });

    } catch (error) {
        console.error('Error ending active charging session:', error);
        res.status(500).json({ 
            message: 'Error ending active charging session',
            error: error.message 
        });
    }
});

// Get user's active charging session
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const activeCharging = await ActiveCharging.findOne({ user: userId });

        if (!activeCharging) {
            return res.status(200).json({ 
                activeCharging: null,
                message: 'No active charging session found' 
            });
        }

        res.status(200).json({
            activeCharging: activeCharging
        });

    } catch (error) {
        console.error('Error fetching active charging session:', error);
        res.status(500).json({ 
            message: 'Error fetching active charging session',
            error: error.message 
        });
    }
});

// Get all active charging sessions (admin only)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        // Add admin check here if needed
        const activeChargingSessions = await ActiveCharging.find({});

        res.status(200).json({
            sessions: activeChargingSessions,
            count: activeChargingSessions.length
        });

    } catch (error) {
        console.error('Error fetching all active charging sessions:', error);
        res.status(500).json({ 
            message: 'Error fetching active charging sessions',
            error: error.message 
        });
    }
});

module.exports = router;
