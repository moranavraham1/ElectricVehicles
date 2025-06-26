const express = require('express');
const router = express.Router();
const ActiveCharging = require('../models/ActiveCharging');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const Station = require('../Station');

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
        const userEmail = req.user.email || req.user.username || userId;

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

        // Get all active charging sessions for this station to check for availability
        const activeChargingSessions = await ActiveCharging.find({ 
            station: { $regex: new RegExp(`^${station.trim()}$`, 'i') }
        });
        
        // Get station details to determine how many charging points it has
        const stationDetails = await Station.findOne({ 
            "Station Name": { $regex: new RegExp(`^${station.trim()}$`, 'i') } 
        });
        
        const numChargingPoints = stationDetails?.duplicateCount || stationDetails?.["Duplicate Count"] || 1;
        
        console.log(`Station has ${numChargingPoints} charging points and ${activeChargingSessions.length} active sessions`);
        console.log('Found station details:', stationDetails);
        
        // If all charging points are already in use, prevent starting a new session
        if (activeChargingSessions.length >= numChargingPoints) {
            console.log('All charging points are currently in use:', activeChargingSessions);
            return res.status(400).json({
                message: 'All charging points at this station are currently in use. Please wait until a spot becomes available.'
            });
        }

        // Find user's booking for this station, date and time
        const userBooking = await Booking.findOne({
            user: userEmail,
            station: { $regex: new RegExp(`^${station.trim()}$`, 'i') },
            date: date,
            time: time,
            status: 'approved'
        });
        
        if (!userBooking) {
            console.log('No booking found for this user at this station/time');
            console.log('Search criteria:', {
                user: userEmail,
                station: station.trim(),
                date: date,
                time: time
            });
            return res.status(400).json({
                message: 'No booking found for this station at this time.'
            });
        }
        
        // Get all approved bookings for this station and date to check for overlaps
        const allBookings = await Booking.find({
            station: { $regex: new RegExp(`^${station.trim()}$`, 'i') },
            date: date,
            status: 'approved'
        });
        
        // Calculate booking time in minutes since midnight
        const [hours, minutes] = time.split(':').map(Number);
        const bookingTimeInMinutes = hours * 60 + minutes;
        const estimatedChargeTime = userBooking.estimatedChargeTime || 30;
        const bookingEndTime = bookingTimeInMinutes + estimatedChargeTime;
        
        // Check for overlapping bookings that have priority over this one
        const now = new Date();
        const currentHourInMinutes = now.getHours() * 60 + now.getMinutes();
        const currentDateStr = now.toISOString().split('T')[0];
        
        // Only check for overlaps if it's today's booking
        if (date === currentDateStr) {
            // Filter out bookings that would overlap with this session
            const overlappingBookings = allBookings.filter(booking => {
                // Skip if it's the user's own booking
                if (booking.user === userEmail) return false;
                
                const [bHours, bMinutes] = booking.time.split(':').map(Number);
                const otherBookingTimeInMinutes = bHours * 60 + bMinutes;
                const otherEstimatedChargeTime = booking.estimatedChargeTime || 30;
                const otherBookingEndTime = otherBookingTimeInMinutes + otherEstimatedChargeTime;
                
                // Check if bookings overlap
                const bookingsOverlap = (
                    (bookingTimeInMinutes <= otherBookingTimeInMinutes && bookingEndTime > otherBookingTimeInMinutes) || 
                    (otherBookingTimeInMinutes <= bookingTimeInMinutes && otherBookingEndTime > bookingTimeInMinutes)
                );
                
                // Only consider overlapping bookings that are already charging or about to charge (within 10 min window)
                const isRelevantTime = (
                    // Other booking is currently within its window (10 min before to 10 min after)
                    (Math.abs(currentHourInMinutes - otherBookingTimeInMinutes) <= 10) || 
                    // Other booking is actively charging (started and not yet finished)
                    (currentHourInMinutes >= otherBookingTimeInMinutes && 
                     currentHourInMinutes < otherBookingEndTime)
                );
                
                return bookingsOverlap && isRelevantTime;
            });
            
            console.log('Overlapping bookings:', overlappingBookings);
            
            // If there are overlapping bookings and all charging points would be occupied, prevent charging
            const totalActiveChargingSessions = activeChargingSessions.length + overlappingBookings.length;
            if (totalActiveChargingSessions >= numChargingPoints) {
                console.log('Cannot start charging due to overlapping bookings');
                return res.status(400).json({
                    message: 'Cannot start charging now. Another user has a booking that overlaps with your time slot.'
                });
            }
        }
        
        // Create new active charging record
        const activeCharging = new ActiveCharging({
            user: userId,
            station: station.trim(),
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
        const userEmail = req.user.email || req.user.username || userId;

        // Find and delete the active charging session
        const result = await ActiveCharging.findOneAndDelete({
            user: userId,
            station: { $regex: new RegExp(`^${station.trim()}$`, 'i') },
            date: date,
            time: time
        });

        if (!result) {
            return res.status(404).json({ 
                message: 'Active charging session not found' 
            });
        }

        // Instead of deleting the booking, mark it as completed
        // This keeps the booking in the system for 10 minutes after scheduled time
        try {
            const booking = await Booking.findOne({
                user: userEmail,
                station: { $regex: new RegExp(`^${station.trim()}$`, 'i') },
                date: date,
                time: time,
                status: 'approved'
            });
            
            if (booking) {
                booking.status = 'completed';
                booking.endTime = new Date(); // Record when charging ended
                await booking.save();
                console.log('Booking marked as completed instead of being deleted');
                
                // Schedule deletion of the booking after 10 minutes
                setTimeout(async () => {
                    try {
                        await Booking.findByIdAndDelete(booking._id);
                        console.log(`Booking ${booking._id} deleted after 10-minute retention period`);
                    } catch (error) {
                        console.error('Error deleting booking after timeout:', error);
                    }
                }, 10 * 60 * 1000); // 10 minutes in milliseconds
            } else {
                console.log('No matching booking found to mark as completed');
            }
        } catch (bookingError) {
            console.error('Error updating booking status:', bookingError);
            // Continue even if booking update fails
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
