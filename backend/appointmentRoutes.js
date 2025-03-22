const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const Appointment = require('./Appointment');
const nodemailer = require('nodemailer');

// הגדרת transporter לשליחת מיילים
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,         // כתובת המייל שממנה נשלח המייל
    pass: process.env.EMAIL_PASSWORD,  // סיסמת המייל
  },
});

// יצירת תור חדש
router.post('/', authMiddleware, async (req, res) => {
  try {
    // ניתן להוסיף שדות נוספים לפי הצורך (כמו address, city, chargingStations, distance)
    const { email, stationName, appointmentDate, appointmentTime, address, city, chargingStations, distance } = req.body;
    const newAppointment = new Appointment({
      email,
      stationName,
      appointmentDate,
      appointmentTime,
      address,
      city,
      chargingStations,
      distance
    });
    await newAppointment.save();

    // שליחת מייל עם פרטי התור
    const mailOptions = {
      from: process.env.EMAIL,
      to: email, // כתובת המייל של המשתמש
      subject: 'Appointment Confirmation',
      text: `Dear User,
      
Your appointment has been booked successfully.

Station: ${stationName}
Address: ${address}, ${city}
Date: ${appointmentDate}
Time: ${appointmentTime}
Charging Stations: ${chargingStations}
Distance: ${distance} km

Thank you for booking with us!

Best regards,
Your Service Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending confirmation email:', error);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Error booking appointment' });
  }
});

// שליפת תורים לפי אימייל
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { email } = req.query;
    const appointments = await Appointment.find({ email });
    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// ביטול תור (מחיקה) + שליחת מייל אישור לביטול
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // שליחת מייל לאישור ביטול התור
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.email,
      subject: 'Appointment Cancellation Confirmation',
      text: `Dear User,
      
Your appointment has been cancelled successfully.

Cancelled Appointment Details:
Station: ${appointment.stationName}
Address: ${appointment.address}, ${appointment.city}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}

We hope to serve you again in the future.

Best regards,
Your Service Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending cancellation email:', error);
      } else {
        console.log('Cancellation confirmation email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

// עדכון תור (עריכה) כולל שליחת מייל לעדכון
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // שליחת מייל עם פרטי העדכון
    const mailOptions = {
      from: process.env.EMAIL,
      to: updatedAppointment.email,
      subject: 'Appointment Update Confirmation',
      text: `Dear User,
      
Your appointment has been updated successfully.

Updated details:
Station: ${updatedAppointment.stationName}
Address: ${updatedAppointment.address}, ${updatedAppointment.city}
Date: ${updatedAppointment.appointmentDate}
Time: ${updatedAppointment.appointmentTime}
Charging Stations: ${updatedAppointment.chargingStations}
Distance: ${updatedAppointment.distance} km

Thank you for using our service!

Best regards,
Your Service Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending update email:', error);
      } else {
        console.log('Update confirmation email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

module.exports = router;
