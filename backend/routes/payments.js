const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const authMiddleware = require('../authMiddleware');
const mongoose = require('mongoose');

// Process a payment for a charging session
router.post('/process', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email || req.user.id;
    
    const {
      bookingId,
      station,
      date,
      time,
      amount,
      paymentMethod,
      chargingTime,
      initialBattery,
      finalBattery
    } = req.body;
    
    // Generate a mock transaction ID
    const transactionId = 'TRANS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Create a new payment record
    const payment = new Payment({
      bookingId: bookingId ? mongoose.Types.ObjectId(bookingId) : null,
      user: userEmail,
      amount,
      paymentMethod,
      status: 'completed',
      transactionId,
      chargingTime,
      initialBattery,
      finalBattery,
      station,
      bookingDate: date,
      bookingTime: time
    });
    
    await payment.save();
    
    // If booking ID exists, update the booking record
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      
      if (booking) {
        booking.status = 'paid';
        booking.paymentStatus = 'paid';
        booking.paymentId = payment._id;
        booking.paymentAmount = amount;
        booking.paymentDate = new Date();
        booking.actualChargingTime = chargingTime;
        booking.finalBattery = finalBattery;
        
        await booking.save();
      }
    } else {
      // If no booking ID, try to find a matching booking by station, date, time, and user
      const booking = await Booking.findOne({
        station: station,
        date: date,
        time: time,
        user: userEmail
      });
      
      if (booking) {
        booking.status = 'paid';
        booking.paymentStatus = 'paid';
        booking.paymentId = payment._id;
        booking.paymentAmount = amount;
        booking.paymentDate = new Date();
        booking.actualChargingTime = chargingTime;
        booking.finalBattery = finalBattery;
        
        await booking.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      paymentId: payment._id,
      transactionId
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// Get payment history for the authenticated user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email || req.user.id;
    
    const payments = await Payment.find({ user: userEmail })
      .sort({ date: -1 });
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// Get a specific payment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if the payment belongs to the authenticated user
    if (payment.user !== req.user.email && payment.user !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to payment information'
      });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment information',
      error: error.message
    });
  }
});

module.exports = router; 