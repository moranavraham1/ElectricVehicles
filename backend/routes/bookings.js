const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); 
const authMiddleware = require('../authMiddleware'); // אבטחת הנתיבים
const nodemailer = require('nodemailer');


// 📌 שליפת כל ההזמנות של המשתמש המחובר
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const bookings = await Booking.find({ user: userEmail });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 📌 בדיקת זמינות של תור
router.post('/check-availability', async (req, res) => {
  try {
    const { station, date } = req.body;
    
    // רשימת שעות זמינות לדוגמה
    const allTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00","00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00"];
    const bookedTimes = await Booking.find({ station, date }).distinct("time");

    const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));

    res.json({ availableTimes });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Error checking availability" });
  }
});
// פונקציה לשליחת מייל אישור הזמנה
const sendBookingConfirmationEmail = async (email, station, date, time) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Booking Confirmation',
      text: `Your appointment at ${station} is confirmed for ${date} at ${time}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('📩 Booking confirmation email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
  }
};

// 📌 יצירת הזמנה חדשה
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { station, date, time } = req.body;
    const userEmail = req.user.email;

    const existingBooking = await Booking.findOne({ station, date, time });
    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    const newBooking = new Booking({ user: userEmail, station, date, time });
    await newBooking.save();
    console.log("✅ Booking saved to database");
    await sendBookingConfirmationEmail(userEmail, station, date, time);
    res.status(201).json({ message: 'Booking successful!' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// 📌 מחיקת הזמנה
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user !== req.user.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { user, station, date, time } = booking;


    await booking.deleteOne();
    console.log(`🗑️ Booking deleted: ${station} on ${date} at ${time}`);
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user,
      subject: 'Appointment Cancelled',
      text: `Your appointment at ${station} on ${date} at ${time} has been cancelled.`,
    });

    console.log(`📩 Cancellation email sent to ${user}`);

    res.json({ message: 'Booking cancelled and email sent.' });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Error canceling booking' });
  }
});

module.exports = router;
