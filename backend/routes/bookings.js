const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Station = require('../Station');
const authMiddleware = require('../authMiddleware');
const nodemailer = require('nodemailer');
const ActiveCharging = require('../models/ActiveCharging');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

router.post("/check-availability", async (req, res) => {
  try {
    const { station, date } = req.body;
    const trimmedStation = station.trim();

    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;

    let availableTimes = [];

    for (let hour = 8; hour <= 22; hour++) {
      const timeSlot = `${hour}:00`;
      const bookingCount = await Booking.countDocuments({ station: trimmedStation, date, time: timeSlot });

      if (bookingCount < maxSlots) {
        availableTimes.push(timeSlot);
      }
    }

    res.json({ availableTimes, maxCapacity: maxSlots });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

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

router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { station, date, time } = req.body;
    const userEmail = req.user.email;
    const trimmedStation = station.trim();

    const existingBooking = await Booking.findOne({ user: userEmail, station: trimmedStation, date, time });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this time slot.' });
    }

    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;

    const bookingCount = await Booking.countDocuments({ station: trimmedStation, date, time });

    if (bookingCount >= maxSlots) {
      return res.status(400).json({ message: 'No available slots for this time.' });
    }

    const newBooking = new Booking({ user: userEmail, station: trimmedStation, date, time });
    await newBooking.save();

    await sendBookingConfirmationEmail(userEmail, trimmedStation, date, time);
    res.status(201).json({ message: 'Booking successful!' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user !== req.user.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await booking.deleteOne();
    console.log(`🗑️ Booking deleted: ${booking.station} on ${booking.date} at ${booking.time}`);

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: booking.user,
      subject: 'Appointment Cancelled',
      text: `Your appointment at ${booking.station} on ${booking.date} at ${booking.time} has been cancelled.`,
    });

    console.log(`📩 Cancellation email sent to ${booking.user}`);

    res.json({ message: 'Booking cancelled and email sent.' });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Error canceling booking' });
  }
});


router.post("/check-availability", async (req, res) => {
  try {
    const { station, date } = req.body;
    const trimmedStation = station.trim();

    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;

    let availableTimes = [];

    for (let hour = 8; hour <= 22; hour++) {
      const timeSlot = `${hour}:00`;
      const bookingCount = await Booking.countDocuments({ station: trimmedStation, date, time: timeSlot });
      const activeChargingCount = await ActiveCharging.countDocuments({ station: trimmedStation });
      const totalUsed = bookingCount + activeChargingCount;
      if (totalUsed < maxSlots) {
        availableTimes.push(timeSlot);
      }
    }

    res.json({ availableTimes, maxCapacity: maxSlots });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
router.post('/start-charging', authMiddleware, async (req, res) => {
  try {
    const { station } = req.body;
    const userEmail = req.user.email;
    const trimmedStation = station.trim();
    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;
    const bookingCount = await Booking.countDocuments({ station: trimmedStation });
    const activeChargingCount = await ActiveCharging.countDocuments({ station: trimmedStation });
    if (bookingCount + activeChargingCount >= maxSlots) {
      return res.status(400).json({ message: 'No available slots for this station.' });
    }

    const newCharge = new ActiveCharging({ user: userEmail, station: trimmedStation });
    await newCharge.save();
    res.status(201).json({ message: 'Charging started!' });
  } catch (error) {
    console.error('Error starting charging:', error);
    res.status(500).json({ message: 'Error starting charging' });
  }
});
router.post('/stop-charging', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { station } = req.body;
    const trimmedStation = station.trim();
    await ActiveCharging.deleteOne({ user: userEmail, station: trimmedStation });

    res.json({ message: 'Charging stopped!' });
  } catch (error) {
    console.error('Error stopping charging:', error);
    res.status(500).json({ message: 'Error stopping charging' });
  }
});


module.exports = router;
