const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');

const Appointment = require('./models/Appointment');
const nodemailer = require('nodemailer');
const { handleLateRegistration, manualCheckAllPendingAppointments } = require('./appointmentScheduler');


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

    const { email, stationName, appointmentDate, appointmentTime, address, city, chargingStations, distance } = req.body;
    
    // Create new appointment

    const newAppointment = new Appointment({
      email,
      stationName,
      appointmentDate,
      appointmentTime,
      address,
      city,
      chargingStations,

      distance,
      registrationTime: new Date(),
      status: 'pending'
    });
    
    // Check if this is a late registration (less than 1 hour before appointment)
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    const oneHourBefore = new Date(appointmentDateTime);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    
    // Save the appointment first to get an ID
    await newAppointment.save();
    
    // Handle late registration if needed
    if (now >= oneHourBefore && now < appointmentDateTime) {
      console.log(`🕒 Late registration detected for ${email} at ${stationName} on ${appointmentDate} at ${appointmentTime}`);
      
      // Process through late registration handler
      const processedAppointment = await handleLateRegistration(newAppointment);
      
      // Return appropriate response based on status after processing
      if (processedAppointment.status === 'late_registration') {
        return res.status(201).json({ 
          message: 'Your appointment was registered after the booking deadline. The station is currently full. Please check your email for alternative options.',
          appointment: processedAppointment 
        });
      }
      
      if (processedAppointment.status === 'approved') {
        return res.status(201).json({ 
          message: 'Your late registration was automatically approved as we still have capacity available.',
          appointment: processedAppointment 
        });
      }
      
      // If still pending, continue with normal flow
    } else {
      // Regular booking confirmation email for non-late registrations
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Appointment Confirmation',
        text: `Dear User,
        
Your appointment has been booked successfully and is pending approval.


Station: ${stationName}
Address: ${address}, ${city}
Date: ${appointmentDate}
Time: ${appointmentTime}
Charging Stations: ${chargingStations}
Distance: ${distance} km


You will receive an approval email one hour before the appointment time.
If the station reaches capacity, you will be notified with alternative options.

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
    }

    res.status(201).json({ 
      message: 'Appointment booked successfully and is pending approval',
      appointment: newAppointment
    });

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


    // Check if this update creates a late registration scenario
    const appointmentDateTime = new Date(`${updatedAppointment.appointmentDate}T${updatedAppointment.appointmentTime}`);
    const now = new Date();
    const oneHourBefore = new Date(appointmentDateTime);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    
    // If it's a late registration, handle accordingly
    if (now >= oneHourBefore && now < appointmentDateTime) {
      console.log(`🕒 Late update detected for ${updatedAppointment.email} at ${updatedAppointment.stationName} on ${updatedAppointment.appointmentDate} at ${updatedAppointment.appointmentTime}`);
      
      // Process through late registration handler
      const processedAppointment = await handleLateRegistration(updatedAppointment);
      
      // Return appropriate response based on status after processing
      if (processedAppointment.status === 'late_registration') {
        return res.status(200).json({ 
          message: 'Your appointment was updated after the booking deadline. The station is currently full. Please check your email for alternative options.',
          appointment: processedAppointment
        });
      }
      
      if (processedAppointment.status === 'approved') {
        return res.status(200).json({ 
          message: 'Your late registration update was automatically approved as we still have capacity available.',
          appointment: processedAppointment
        });
      }
      
      // If still pending, continue with normal flow
    } else {
      // Reset status to pending if time was changed to a non-late slot
      updatedAppointment.status = 'pending';
      await updatedAppointment.save();
      
      // Send update email
      const mailOptions = {
        from: process.env.EMAIL,
        to: updatedAppointment.email,
        subject: 'Appointment Update Confirmation',
        text: `Dear User,
        
Your appointment has been updated successfully and is pending approval.


Updated details:
Station: ${updatedAppointment.stationName}
Address: ${updatedAppointment.address}, ${updatedAppointment.city}
Date: ${updatedAppointment.appointmentDate}
Time: ${updatedAppointment.appointmentTime}
Charging Stations: ${updatedAppointment.chargingStations}
Distance: ${updatedAppointment.distance} km

You will receive an approval email one hour before the appointment time.
If the station reaches capacity, you will be notified with alternative options.

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
    }

    res.status(200).json({ 
      message: 'Appointment updated successfully', 
      appointment: updatedAppointment 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

// Get alternative appointments when registration is late
router.get('/alternatives/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.nearbyAlternatives && appointment.nearbyAlternatives.length > 0) {
      return res.status(200).json({ alternatives: appointment.nearbyAlternatives });
    } else {
      return res.status(200).json({ alternatives: [] });
    }
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({ message: 'Error fetching alternative appointments' });
  }
});

// Admin endpoint to manually approve appointments
router.post('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update status to approved
    appointment.status = 'approved';
    appointment.approvalDate = new Date();
    await appointment.save();
    
    // Send approval email
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.email,
      subject: 'Appointment Manually Approved',
      text: `Dear User,
      
Your appointment has been manually approved by an administrator.

Station: ${appointment.stationName}
Address: ${appointment.address}, ${appointment.city}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}

Please arrive on time for your appointment.

Best regards,
Your Service Team`
    };
    
    transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Appointment approved successfully', appointment });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'Error approving appointment' });
  }
});

// Admin endpoint to reject appointments
router.post('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update status to rejected
    appointment.status = 'rejected';
    appointment.rejectionReason = reason || 'Rejected by administrator';
    await appointment.save();
    
    // Get alternatives
    const alternatives = appointment.nearbyAlternatives || [];
    
    // Prepare alternative text
    let alternativesText = '';
    if (alternatives.length > 0) {
      alternativesText = '\nAvailable alternatives:\n';
      alternatives.forEach((alt, index) => {
        alternativesText += `
${index + 1}. Station: ${alt.stationName}
   Address: ${alt.address}, ${alt.city}
   Date: ${alt.appointmentDate}
   Time: ${alt.appointmentTime}
`;
      });
    } else {
      alternativesText = '\nNo alternative appointments found at this time.';
    }
    
    // Send rejection email
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.email,
      subject: 'Appointment Rejected',
      text: `Dear User,
      
We regret to inform you that your appointment has been rejected.

Rejected Appointment Details:
Station: ${appointment.stationName}
Address: ${appointment.address}, ${appointment.city}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}
Reason: ${appointment.rejectionReason}
${alternativesText}

You can book a new appointment through our app.

Best regards,
Your Service Team`
    };
    
    transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Appointment rejected successfully', appointment });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ message: 'Error rejecting appointment' });
  }
});

// Admin endpoint to get all appointments
router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const userEmail = req.user.email;
    // Implement your admin check logic here - this is a simple example
    const isAdmin = userEmail.endsWith('@admin.com') || req.user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    // Get all appointments, sorted by date and time
    const appointments = await Appointment.find().sort({ 
      appointmentDate: 1, 
      appointmentTime: 1, 
      registrationTime: 1 
    });
    
    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Admin endpoint to manually process all pending appointments
router.post('/process-pending', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const userEmail = req.user.email;
    // Implement your admin check logic here - this is a simple example
    const isAdmin = userEmail.endsWith('@admin.com') || req.user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    console.log(`Manual processing triggered by admin: ${userEmail}`);
    
    // Run the manual processing
    const result = await manualCheckAllPendingAppointments();
    
    res.status(200).json({ 
      message: 'Manual processing completed',
      result
    });
  } catch (error) {
    console.error('Error in manual processing:', error);
    res.status(500).json({ message: 'Error processing appointments', error: error.message });

  }
});

module.exports = router;
