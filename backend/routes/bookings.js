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
router.get('/queue/:station/:date', authMiddleware, async (req, res) => {
  try {
    const { station, date } = req.params;
    const now = new Date();
    const normalizedStation = station.trim().toLowerCase();
    const queue = await Booking.find({
      station: { $regex: new RegExp(`^${normalizedStation}$`, 'i') },
      date
    });
    
    const bookingsWithLaxity = queue.map((b) => {
      const bookingTime = new Date(`${b.date}T${b.time}:00`);
      const estimatedChargeTime = b.estimatedChargeTime || 30;
      const laxity = (bookingTime - now) / (60 * 1000) - estimatedChargeTime;

      return {
        _id: b._id,
        station: b.station,
        date: b.date,
        time: b.time,
        user: b.user, // מייל
        urgencyLevel: b.urgencyLevel,
        estimatedChargeTime,
        laxity
      };
    });

    // מיון לפי LLLP: קודם כל לפי laxity עולה, ואז לפי estimatedChargeTime יורד
    bookingsWithLaxity.sort((a, b) => {
      if (a.laxity !== b.laxity) return a.laxity - b.laxity;
      return b.estimatedChargeTime - a.estimatedChargeTime;
    });

    res.json(bookingsWithLaxity);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ message: 'Error fetching queue' });
  }
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

    const bookings = await Booking.find({ station: trimmedStation, date });
    const activeCharging = await ActiveCharging.find({ station: trimmedStation, date });
    const bookingsPerTime = {};
    for (const b of bookings) {
      bookingsPerTime[b.time] = (bookingsPerTime[b.time] || 0) + 1;
    }
    for (const c of activeCharging) {
      bookingsPerTime[c.time] = (bookingsPerTime[c.time] || 0) + 1;
    }

    const availableTimes = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 20) {
        const hh = hour.toString().padStart(2, '0');
        const mm = minute.toString().padStart(2, '0');
        const timeSlot = `${hh}:${mm}`;

        const used = bookingsPerTime[timeSlot] || 0;
        if (used < maxSlots) {
          availableTimes.push(timeSlot);
        }
      }
    }

    res.json({ availableTimes, bookingsPerTime, maxCapacity: maxSlots });
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
const sendBookingCancellationEmail = async (email, station, date, time) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Charging Appointment Cancellation',
      text: `Your appointment at station ${station} on ${date} at ${time} has been successfully cancelled.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('📩 Cancellation email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
  }
};



router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { station, date, time, urgencyLevel, estimatedChargeTime } = req.body;
    const userEmail = req.user.email;
    const trimmedStation = station.trim();

    const existingBooking = await Booking.findOne({ user: userEmail, station: trimmedStation, date, time });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this time slot.' });
    }


    const newBooking = new Booking({
      user: userEmail,
      station: trimmedStation,
      date,
      time,
      urgencyLevel,
      estimatedChargeTime,
      createdAt: new Date(),
    });

    await newBooking.save();
    await sendBookingConfirmationEmail(userEmail, trimmedStation, date, time);
    res.status(201).json({ message: 'Booking received! Allocation will be done before the charging time.' });
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

    const now = new Date();
    const bookingTime = new Date(`${booking.date}T${booking.time}:00`);
    if (bookingTime < now) {
      await booking.deleteOne();
      console.log(`🗑️ Past booking deleted (no email): ${booking.station} on ${booking.date} at ${booking.time}`);
      return res.json({ message: 'Past booking deleted.' });
    }

    await booking.deleteOne();
    console.log(`🗑️ Booking deleted: ${booking.station} on ${booking.date} at ${booking.time}`);
    if (booking.user) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: booking.user,
        subject: 'Charging Appointment Approved',
        text: `❌ Your charging appointment at ${booking.station} on ${booking.date} at ${booking.time} has been canceled.`,
      });
    } else {
      console.log(`No email address found for booking at ${booking.station}`);
    }

    console.log(`📩 Cancellation email sent to ${booking.user}`);

    res.json({ message: 'Booking cancelled and email sent.' });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Error canceling booking' });
  }
});




router.post('/start-charging', authMiddleware, async (req, res) => {
  try {
    const { station, date, time } = req.body;
    const userEmail = req.user.email;
    const trimmedStation = station.trim();

    const now = new Date();
    const slotDateTime = new Date(`${date}T${time}:00`);
    const tenMinutes = 10 * 60 * 1000;

    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;
    const bookingCount = await Booking.countDocuments({ station: trimmedStation });
    
    

    const existingBooking = await Booking.findOne({ user: userEmail, station: trimmedStation, date, time, status: 'approved' });
    if (!existingBooking) {
      return res.status(404).json({ message: 'No confirmed order found at this time.' });
    }
    if (now < slotDateTime - tenMinutes || now > slotDateTime + tenMinutes) {
      return res.status(400).json({ message: 'You can only start charging 10 minutes before your scheduled reservation time. If the station is available' });
    }

    const activeChargingCount = await ActiveCharging.countDocuments({ station: trimmedStation, date, time });
    if (activeChargingCount >= maxSlots) {
      return res.status(400).json({ message: 'The position is occupied at this time.' });
    }
    const newCharge = new ActiveCharging({ user: userEmail, station: trimmedStation, date, time });
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

router.post('/assign/:station/:date/:time', authMiddleware, async (req, res) => {
  try {
    const { station, date, time } = req.params;
    const trimmedStation = station.trim();

    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;

    const candidates = await Booking.find({ station: trimmedStation, date, time });

    const sorted = candidates.sort((a, b) => {
      const scoreA = (a.urgencyLevel * 2) + (a.estimatedChargeTime / 10) + ((a.rejectionCount || 0) * 1.5);
      const scoreB = (b.urgencyLevel * 2) + (b.estimatedChargeTime / 10) + ((b.rejectionCount || 0) * 1.5);
      return scoreB - scoreA;
    });

    const approved = sorted.slice(0, maxSlots);
    const rejected = sorted.slice(maxSlots);

    for (const booking of approved) {
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: 'approved' } }
      );

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: booking.user,
        subject: 'Charging Appointment Approved',
        text: `✅ Your charging appointment at ${booking.station} on ${booking.date} at ${booking.time} has been approved.`,
      });
      
      
    }

    for (const booking of rejected) {
      const newRejectionCount = (booking.rejectionCount || 0) + 1;
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: 'rejected', rejectionCount: newRejectionCount } }
      );
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: booking.user,
        subject: 'Charging Appointment Canceled',
        text: `❌ Your charging appointment at ${booking.station} on ${booking.date} at ${booking.time} has been canceled.`,
      });
    }

    res.json({ approved, rejected });
  } catch (error) {
    console.error('Error assigning LLLP queue:', error);
    res.status(500).json({ message: 'Error in dynamic assignment' });
  }
});

module.exports = router;
