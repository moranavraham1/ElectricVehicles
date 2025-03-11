const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// סכמת התורים
const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true }, // אימייל המשתמש
  station: { type: String, required: true }, // שם התחנה
  date: { type: String, required: true }, // תאריך
  time: { type: String, required: true } // שעה
});

// יצירת המודל
const Booking = mongoose.model('Booking', bookingSchema);

// הגדרת nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// פונקציה לשליחת מייל אישור הזמנה
const sendBookingConfirmationEmail = async (email, station, date, time) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email, // שולח למייל של המשתמש שנרשם
      subject: '🔋 Booking Confirmation - EV Charging',
      text: `Hello,\n\nYour charging appointment has been successfully booked!\n\n📅 Date: ${date}\n⏰ Time: ${time}\n📍 Station: ${station}\n\nThank you for booking with us! If you need to make any changes, please visit your personal area on our website.\n\n🚗⚡ Safe travels!`,
    };

    await transporter.sendMail(mailOptions);
    console.log('📩 Booking confirmation email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
  }
};

// פונקציה להזמנת תור
exports.bookAppointment = async (req, res) => {
  const { email, station, date, time } = req.body;
  console.log("📥 Received booking request:", { email, station, date, time });

  try {
    // בדיקה אם התור כבר קיים לאותו תאריך ושעה
    const existingBooking = await Booking.findOne({ station, date, time });
    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    // שמירת התור בבסיס הנתונים
    const newBooking = new Booking({ user: email, station, date, time });
    await newBooking.save();

    // שליחת מייל אישור למשתמש
    await sendBookingConfirmationEmail(email, station, date, time);
    console.log("✅ Email function called successfully!");

    res.status(200).json({ message: 'Booking successful!' });
  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    res.status(500).json({ message: 'Failed to book appointment.' });
  }
};

// פונקציה למחיקת תור
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.email; // מזהה המשתמש
    
    // חיפוש התור בבסיס הנתונים
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.user !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Booking.deleteOne({ _id: id });

    // שליחת מייל למשתמש
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: booking.user,
      subject: "Appointment Cancelled",
      text: `Hello,\n\nYour appointment for ${booking.station} on ${booking.date} at ${booking.time} has been cancelled.\n\nIf this was a mistake, you can rebook at:\n${process.env.FRONTEND_URL}/bookings`,
    });

    console.log("✅ Cancellation email sent to:", booking.user);
    res.json({ message: "Booking cancelled successfully." });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res.status(500).json({ message: "Error cancelling booking." });
  }
};
const sendUpcomingBookingReminder = async () => {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0); // Reset minutes and seconds

    const oneHourLater = new Date(now);
    oneHourLater.setHours(oneHourLater.getHours() + 1); // Reminder one hour before

    const formattedDate = oneHourLater.toISOString().split("T")[0];
    const formattedTime = oneHourLater.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log(`🔍 Checking for upcoming bookings at: ${formattedDate} ${formattedTime}`);

    const upcomingBookings = await Booking.find({
      date: formattedDate,
      time: formattedTime,
    });

    if (upcomingBookings.length === 0) {
      console.log("✅ No bookings to send reminders for.");
      return;
    }

    console.log(`📩 Sending reminders to ${upcomingBookings.length} users.`);

    for (const booking of upcomingBookings) {
      const confirmUrl = `http://localhost:3001/api/bookings/confirm/${booking._id}`;
      const cancelUrl = `http://localhost:3001/api/bookings/cancel/${booking._id}`;

      const emailContent = `
        <p>Hello,</p>
        <p>This is a reminder that your appointment at <b>${booking.station}</b> is in one hour.</p>
        <p>📅 <b>Date:</b> ${booking.date}</p>
        <p>⏰ <b>Time:</b> ${booking.time}</p>
        <p>👉 Please confirm if you're arriving or cancel your appointment:</p>
        <p>
          <a href="${confirmUrl}" style="padding: 10px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">✅ Confirm</a>
          &nbsp;
          <a href="${cancelUrl}" style="padding: 10px; background-color: red; color: white; text-decoration: none; border-radius: 5px;">❌ Cancel</a>
        </p>
        <p>Thank you!</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: booking.user,
        subject: "⏳ Reminder: Your Upcoming Charging Appointment!",
        html: emailContent,
      });

      console.log(`📨 Reminder email with buttons sent to: ${booking.user}`);
    }
  } catch (error) {
    console.error("❌ Error sending reminder email:", error);
  }
};



// הפעלת משימה מתוזמנת לבדיקה כל 30 דקות
setInterval(sendUpcomingBookingReminder, 30 * 60 * 1000);


module.exports = Booking;
