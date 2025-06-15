const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Station = require('../Station');
const authMiddleware = require('../authMiddleware');
const nodemailer = require('nodemailer');

const ActiveCharging = require('../models/ActiveCharging');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify the SMTP connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('- SMTP server connection successful');
  }
});

// הוספת משתנה ל-timeout ID כדי שנוכל לבטל אותו במידת הצורך
const allocationTimeouts = {};

// Import the appointment scheduler functions
const { manualCheckAllPendingAppointments } = require('../appointmentScheduler');

router.get('/queue/:station/:date', authMiddleware, async (req, res) => {
  try {
    const { station, date } = req.params;

    const normalize = (str) =>
      decodeURIComponent(str).trim().toLowerCase().replace(/\s+/g, ' ');

    const normalizedStation = normalize(station);

    // Log the request parameters for debugging
    console.log(`Queue request for station: "${station}" (normalized: "${normalizedStation}"), date: ${date}`);

    // כדי לוודא השוואת תאריכים נכונה, נשתמש בתאריך של היום בפורמט YYYY-MM-DD
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const agingFactor = 0.08;

    // בדיקה האם התאריך שנבחר הוא מהעבר
    const isDateBeforeToday = date < today;

    // אם התאריך שנבחר הוא מהעבר, לא להציג שום תורים
    if (isDateBeforeToday) {
      console.log(`Request for past date: ${date}, returning empty queue`);
      return res.json([]);
    }

    // מציאת רק תורים מאושרים לתחנה ותאריך
    // Use case-insensitive regex for more robust matching
    const queue = await Booking.find({
      station: { $regex: new RegExp(`^${normalizedStation}$`, 'i') },
      date,
      status: 'approved' // Only include approved bookings in the queue
    });

    // Log all found bookings for debugging
    console.log(`Found ${queue.length} approved bookings for station ${station} on ${date}:`);
    queue.forEach((booking, index) => {
      console.log(`${index + 1}. User: ${booking.user}, Time: ${booking.time}, Status: ${booking.status}`);
    });

    // סינון תורים שכבר עבר זמנם (רק אם התאריך הוא היום)
    const filteredQueue = queue.filter(booking => {
      // אם התאריך לא היום, הצג את כל התורים
      if (booking.date !== today) {
        return true;
      }

      // אם התאריך הוא היום, בדוק אם השעה עברה
      const [bookingHour, bookingMinute] = booking.time.split(':').map(Number);

      // אם השעה כבר עברה, לא להציג
      if (bookingHour < currentHour || (bookingHour === currentHour && bookingMinute < currentMinute)) {
        return false;
      }

      return true;
    });

    console.log(`Filtering queue for ${station} on ${date}. Total approved: ${queue.length}, After time filtering: ${filteredQueue.length}`);

    const bookingsWithPriority = filteredQueue.map((b) => {

      const bookingTime = new Date(`${b.date}T${b.time}:00`);
      const estimatedChargeTime = b.estimatedChargeTime || 30;
      const createdAt = new Date(b.createdAt);
      const waitingMinutes = (now - createdAt) / (60 * 1000);

      const maxWaitTime = 40;
      const maxBoost = 20;

      const waitFactor = Math.min(waitingMinutes / maxWaitTime, 1);
      const agingBoost = waitFactor * maxBoost;


      // For approved bookings, we use the same priority calculation but it's only for display

      const priorityScore =
        (b.urgencyLevel ?? 100) -
        (waitingMinutes * agingFactor) -
        ((b.currentBattery ?? 100) / 5) -
        agingBoost;


      return {
        _id: b._id,
        station: b.station,
        date: b.date,
        time: b.time,
        user: b.user,
        urgencyLevel: b.urgencyLevel,
        estimatedChargeTime,
        createdAt,
        currentBattery: b.currentBattery,

        status: b.status, // Include status to confirm these are approved

        priorityScore
      };
    });


    // Sort by time first, then by priority within each time slot
    bookingsWithPriority.sort((a, b) => {
      // First sort by time
      if (a.time !== b.time) {
        return a.time.localeCompare(b.time);
      }

      // For same time, sort by priority

      if (a.priorityScore !== b.priorityScore) {
        return a.priorityScore - b.priorityScore;
      }

      if (a.estimatedChargeTime !== b.estimatedChargeTime) {
        return a.estimatedChargeTime - b.estimatedChargeTime;
      }

      if (a.currentBattery !== b.currentBattery) {
        return a.currentBattery - b.currentBattery;
      }

      return new Date(a.createdAt) - new Date(b.createdAt);
    });


    res.json(bookingsWithPriority);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ message: 'Error fetching queue' });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;

    // במידה והמייל לא נמצא בטוקן, ננסה למצוא לפי המייל בתוך req.user.id
    const query = {
      $or: [
        { user: userEmail },
        { user: req.user.id }
      ]
    };

    const bookings = await Booking.find(query);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.post("/check-availability", async (req, res) => {
  try {
    const { station, date } = req.body;

    console.log("💡 check-availability called with:", { station, date });


    const trimmedStation =
      typeof station === 'string'
        ? station.trim()
        : station['Station Name']?.trim?.() || '';

    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;

    console.log("💡 Station details:", { stationName: trimmedStation, maxSlots });

    const bookings = await Booking.find({ station: trimmedStation, date });
    const activeCharging = await ActiveCharging.find({ station: trimmedStation, date });
    console.log("💡 Found bookings:", bookings.length, "Active charging:", activeCharging.length);


    const bookingsPerTime = {};
    for (const b of bookings) {
      bookingsPerTime[b.time] = (bookingsPerTime[b.time] || 0) + 1;
    }
    for (const c of activeCharging) {
      bookingsPerTime[c.time] = (bookingsPerTime[c.time] || 0) + 1;
    }

    console.log("💡 Bookings per time:", bookingsPerTime);


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


    console.log(`💡 Generated ${availableTimes.length} available time slots for date: ${date}`);


    res.json({ availableTimes, bookingsPerTime, maxCapacity: maxSlots });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


const sendBookingPendingEmail = async (email, station, date, time) => {
  try {
    console.log('Attempting to send pending email to:', email);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Booking Request Received - Waiting for Confirmation',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Request Received</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #141b2d;
            color: #fff;
            padding: 25px 20px;
            text-align: center;
            border-bottom: 4px solid #2d8cf0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            background-color: #f0f2f5;
            padding: 30px 25px;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .greeting {
            color: #141b2d;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 25px;
            text-align: center;
          }
          .message {
            background-color: #fff;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            text-align: center;
          }
          .booking-details {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-top: 25px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #5c6b77;
          }
          .detail-value {
            font-weight: 500;
            color: #141b2d;
          }
          .status-box {
            margin: 25px 0;
            text-align: center;
          }
          .status-pending {
            display: inline-block;
            background-color: #fff8e6;
            color: #d4b106;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #ffe58f;
          }
          .status-approved {
            display: inline-block;
            background-color: #f6ffed;
            color: #52c41a;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #b7eb8f;
          }
          .status-cancelled {
            display: inline-block;
            background-color: #fff1f0;
            color: #f5222d;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #ffa39e;
          }
          .code-box {
            background-color: #f9f9f9;
            border-radius: 4px;
            padding: 15px;
            text-align: center;
            font-family: monospace;
            font-size: 24px;
            letter-spacing: 8px;
            margin: 25px 0;
            border: 1px solid #eee;
          }
          .instructions {
            margin-top: 25px;
            padding: 20px;
            background-color: #e6f7ff;
            border-radius: 8px;
            border-left: 4px solid #1890ff;
          }
          .footer {
            background-color: #141b2d;
            color: #aaa;
            text-align: center;
            padding: 20px;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #2d8cf0;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: 600;
            margin-top: 20px;
            text-align: center;
          }
          .button:hover {
            background-color: #1890ff;
          }
          .expires {
            color: #888;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Request Received</h1>
          </div>
          <div class="content">
            <div class="greeting">Welcome to EVISION</div>
            
            <div class="message">
              <p>Thank you for using our service. Your charging station booking request has been received and is currently pending approval.</p>
              <p>Our system will prioritize all requests using our advanced queue algorithm.</p>
            </div>
            
            <div class="status-box">
              <span class="status-pending">Pending Confirmation</span>
            </div>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Charging Station:</span>
                <span class="detail-value">${station}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${time}</span>
              </div>
            </div>
            
            <div class="instructions">
              <p>You will receive another email when your request is approved or rejected according to our allocation system.</p>
              <p>If you have any questions, please use our system or reply to this email.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="#" class="button">View Your Booking</a>
            </div>
            
            <p class="expires">If you didn't request this booking, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EVISION - Electric Vehicle Charging Solutions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📩 Booking pending email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending pending email:', error);
  }
};

// Function to send a booking confirmation email with site-matching design
const sendBookingConfirmationEmail = async (email, station, date, time) => {
  try {
    console.log('Attempting to send confirmation email to:', email);
    console.log('Booking details - Station:', station, 'Date:', date, 'Time:', time);

    // בדיקה שכל הפרמטרים הנדרשים קיימים
    if (!station || !date || !time) {
      console.error('❌ Missing required parameters for confirmation email:', { station, date, time });
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Booking Confirmation - Your Charging Appointment is Approved',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #141b2d;
            color: #fff;
            padding: 25px 20px;
            text-align: center;
            border-bottom: 4px solid #2d8cf0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            background-color: #f0f2f5;
            padding: 30px 25px;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .greeting {
            color: #141b2d;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 25px;
            text-align: center;
          }
          .message {
            background-color: #fff;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            text-align: center;
          }
          .booking-details {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-top: 25px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #5c6b77;
          }
          .detail-value {
            font-weight: 500;
            color: #141b2d;
          }
          .status-box {
            margin: 25px 0;
            text-align: center;
          }
          .status-pending {
            display: inline-block;
            background-color: #fff8e6;
            color: #d4b106;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #ffe58f;
          }
          .status-approved {
            display: inline-block;
            background-color: #f6ffed;
            color: #52c41a;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #b7eb8f;
          }
          .status-cancelled {
            display: inline-block;
            background-color: #fff1f0;
            color: #f5222d;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #ffa39e;
          }
          .code-box {
            background-color: #f9f9f9;
            border-radius: 4px;
            padding: 15px;
            text-align: center;
            font-family: monospace;
            font-size: 24px;
            letter-spacing: 8px;
            margin: 25px 0;
            border: 1px solid #eee;
          }
          .instructions {
            margin-top: 25px;
            padding: 20px;
            background-color: #e6f7ff;
            border-radius: 8px;
            border-left: 4px solid #1890ff;
          }
          .footer {
            background-color: #141b2d;
            color: #aaa;
            text-align: center;
            padding: 20px;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #2d8cf0;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: 600;
            margin-top: 20px;
            text-align: center;
          }
          .button:hover {
            background-color: #1890ff;
          }
          .expires {
            color: #888;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed</h1>
          </div>
          <div class="content">
            <div class="greeting">Welcome to EVISION</div>
            
            <div class="message">
              <p>Great news! Your charging station booking has been approved and confirmed.</p>
              <p>You are now scheduled for charging according to the details below.</p>
            </div>
            
            <div class="status-box">
              <span class="status-approved">Approved</span>
            </div>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Charging Station:</span>
                <span class="detail-value">${station || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${date || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${time || 'N/A'}</span>
              </div>
            </div>
            
            <div class="instructions">
              <p><strong>Important Reminders:</strong></p>
              <ul>
                <li>Please arrive at the charging station on time. You can start charging up to 10 minutes before or after your scheduled time.</li>
                <li>Make sure to bring the appropriate cable for your vehicle if the station doesn't provide one.</li>
                <li>Payment will be processed at the end of charging via the application.</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="#" class="button">View Your Booking</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EVISION - Electric Vehicle Charging Solutions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📩 Booking confirmation email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error, 'for booking:', { station, date, time });
  }
};

const sendBookingCancellationEmail = async (email, station, date, time, alternativeStations = [], wasPreviouslyApproved = false) => {
  try {
    console.log('Attempting to send cancellation email to:', email);

    // הכנת חלק המלצות לתחנות חלופיות
    let alternativesHTML = '';
    if (alternativeStations && alternativeStations.length > 0) {
      alternativesHTML = `
      <p>Consider booking at one of these nearby stations:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        ${alternativeStations.map(station => `<li>• ${station}</li>`).join('')}
      </ul>
      `;
    }

    // הכנת הודעה ספציפית למקרה של ביטול הזמנה שכבר אושרה
    const cancellationMessage = wasPreviouslyApproved ?
      `<p>We regret to inform you that your previously approved charging appointment has been <strong>cancelled</strong> due to emergency requests with higher priority.</p>
       <p>We understand this may be inconvenient, and as compensation, your priority will be automatically increased for future bookings.</p>` :
      `<p>We regret to inform you that your electric vehicle charging appointment has been cancelled.</p>
       <p>This may be due to high demand during the requested time or changes in station availability.</p>`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: wasPreviouslyApproved ? 'IMPORTANT: Your Approved Booking Has Been Cancelled' : 'Charging Appointment Cancellation',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancellation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #141b2d;
            color: #fff;
            padding: 25px 20px;
            text-align: center;
            border-bottom: 4px solid #2d8cf0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            background-color: #f0f2f5;
            padding: 30px 25px;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .greeting {
            color: #141b2d;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 25px;
            text-align: center;
          }
          .message {
            background-color: #fff;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            text-align: center;
          }
          .booking-details {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-top: 25px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #5c6b77;
          }
          .detail-value {
            font-weight: 500;
            color: #141b2d;
          }
          .status-box {
            margin: 25px 0;
            text-align: center;
          }
          .status-pending {
            display: inline-block;
            background-color: #fff8e6;
            color: #d4b106;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #ffe58f;
          }
          .status-approved {
            display: inline-block;
            background-color: #f6ffed;
            color: #52c41a;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #b7eb8f;
          }
          .status-cancelled {
            display: inline-block;
            background-color: #fff1f0;
            color: #f5222d;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            border: 1px solid #ffa39e;
          }
          .code-box {
            background-color: #f9f9f9;
            border-radius: 4px;
            padding: 15px;
            text-align: center;
            font-family: monospace;
            font-size: 24px;
            letter-spacing: 8px;
            margin: 25px 0;
            border: 1px solid #eee;
          }
          .instructions {
            margin-top: 25px;
            padding: 20px;
            background-color: #e6f7ff;
            border-radius: 8px;
            border-left: 4px solid #1890ff;
          }
          .footer {
            background-color: #141b2d;
            color: #aaa;
            text-align: center;
            padding: 20px;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #2d8cf0;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: 600;
            margin-top: 20px;
            text-align: center;
          }
          .button:hover {
            background-color: #1890ff;
          }
          .expires {
            color: #888;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
          }
          .alternatives {
            background-color: #f6ffed;
            border-radius: 8px;
            padding: 20px;
            margin-top: 25px;
            border-left: 4px solid #52c41a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <div class="greeting">Welcome to EVISION</div>
            
            <div class="message">
              ${cancellationMessage}
            </div>
            
            <div class="status-box">
              <span class="status-cancelled">Cancelled</span>
            </div>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Charging Station:</span>
                <span class="detail-value">${station}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${time}</span>
              </div>
            </div>
            
            <div class="instructions">
              <p><strong>Alternative Options:</strong></p>
              <p>We would be happy if you tried booking at a different time or station.</p>
              <p>Please note that your priority has been automatically increased in our system for future bookings.</p>
              ${alternativesHTML}
            </div>
            
            <div style="text-align: center;">
              <a href="#" class="button">Book New Appointment</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EVISION - Electric Vehicle Charging Solutions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📩 Cancellation email sent successfully to:', email);

  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
  }
};


router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { station, date, time, urgencyLevel, estimatedChargeTime, currentBattery } = req.body;
    // נשתמש במייל מהטוקן תמיד אם הוא קיים
    const userEmail = req.user.email || req.user.id;
    const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ');
    const trimmedStation = normalize(station);


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
      currentBattery,
      createdAt: new Date(),

      status: 'pending'
    });

    await newBooking.save();
    await sendBookingPendingEmail(userEmail, trimmedStation, date, time);

    // No longer triggering immediate allocation - will be handled by the scheduler one hour before appointment

    res.status(201).json({
      message: 'Booking request received! Your request will be processed 1 hour before the appointment time and you will receive a confirmation email.',
      booking: newBooking
    });

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

      await sendBookingCancellationEmail(booking.user, booking.station, booking.date, booking.time);

    } else {
      console.log(`No email address found for booking at ${booking.station}`);
    }



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
    if (!station) {
      return res.status(400).json({ message: 'Station is required.' });
    }
    let trimmedStation = '';

    if (typeof station === 'string') {
      trimmedStation = station.trim();
    } else if (typeof station === 'object' && station['Station Name']) {
      trimmedStation = station['Station Name'].trim();
    } else {
      return res.status(400).json({ message: 'Invalid station format.' });
    }

    const now = new Date();
    const slotDateTime = new Date(`${date}T${time}:00`);
    const tenMinutes = 10 * 60 * 1000;

    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;

    // בודק אם יש כבר טעינה פעילה באותו זמן ותחנה
    const activeChargingCount = await ActiveCharging.countDocuments({ station: trimmedStation, date, time });
    if (activeChargingCount >= maxSlots) {
      return res.status(400).json({ message: 'The position is occupied at this time.' });
    }

    // בודק אם קיים תור, גם אם לא מאושר
    const existingBooking = await Booking.findOne({ user: userEmail, station: trimmedStation, date, time });
    if (existingBooking) {
      if (existingBooking.status !== 'approved') {
        console.log('⚠️ Booking exists but not approved. Allowing charging anyway.');
      }
    } else {
      console.log('⚠️ No booking found. Allowing charging without booking.');
    }

    // בדיקה של חלון זמן של 10 דקות לפני / אחרי
    if (now < slotDateTime - tenMinutes || now > slotDateTime + tenMinutes) {
      return res.status(400).json({ message: 'You can only start charging 10 minutes before or after your scheduled time.' });
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

    if (!station) {
      return res.status(400).json({ message: 'Station is required to stop charging.' });
    }

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


      console.log('Sending confirmation email with details:', {
        user: booking.user,
        station: booking.station,
        date: booking.date,
        time: booking.time
      });

      await sendBookingConfirmationEmail(booking.user, booking.station, booking.date, booking.time);

    }

    for (const booking of rejected) {
      const newRejectionCount = (booking.rejectionCount || 0) + 1;
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: 'rejected', rejectionCount: newRejectionCount } }
      );


      // מציאת תחנות קרובות כהמלצה
      const alternativeStations = await findNearbyStations(trimmedStation);

      await sendBookingCancellationEmail(booking.user, trimmedStation, date, time, alternativeStations);

    }

    res.json({ approved, rejected });
  } catch (error) {
    console.error('Error assigning LLLP queue:', error);
    res.status(500).json({ message: 'Error in dynamic assignment' });
  }
});


// עדכון פונקציית תזמון ההקצאה עם טיפול במקרים של אי-משלוח מיילים
const scheduleAllocationProcess = (station, date, time) => {
  console.log(`⏱️ Running immediate allocation process for station ${station} on ${date} at ${time}`);

  // מזהה ייחודי לזיהוי ה-timeout
  const timeoutKey = `${station}-${date}-${time}`;

  // Execute allocation immediately
  allocateBookings(station, date, time);

  // בדיקה אם יש הזמנות שנשארו תקועות במצב "pending"
  setTimeout(async () => {
    await checkPendingBookings(station, date, time);
  }, 30 * 1000); // בדיקה 30 שניות אחרי הקצאה
};

// בדיקת הזמנות שנשארו תקועות במצב "pending"
const checkPendingBookings = async (station, date, time) => {
  try {
    console.log(`🔍 Checking for pending bookings that might be stuck: ${station} on ${date} at ${time}`);

    const pendingBookings = await Booking.find({
      station,
      date,
      time,
      status: 'pending'
    });

    if (pendingBookings.length > 0) {
      console.log(`⚠️ Found ${pendingBookings.length} pending bookings that might be stuck`);

      // ניסיון שני להקצות את ההזמנות
      await allocateBookings(station, date, time, true);
    }
  } catch (error) {
    console.error('Error checking pending bookings:', error);
  }
};

// עדכון פונקציית ההקצאה כך שתטפל גם בביטול הזמנות קיימות וגם בהמלצות
const allocateBookings = async (station, date, time, isRetry = false) => {
  try {
    console.log(`🔄 Running allocation for ${station} on ${date} at ${time}${isRetry ? ' (retry)' : ''}`);

    const trimmedStation = station.trim();
    const stationDetails = await Station.findOne({ "Station Name": trimmedStation });
    const maxSlots = stationDetails ? parseInt(stationDetails["Duplicate Count"]) || 2 : 2;

    // מציאת כל ההזמנות הממתינות לזמן והתחנה הספציפיים
    const pendingBookings = await Booking.find({
      station: trimmedStation,
      date,
      time,
      status: 'pending'
    });

    // מציאת כל ההזמנות המאושרות לזמן והתחנה הספציפיים
    const approvedBookings = await Booking.find({
      station: trimmedStation,
      date,
      time,
      status: 'approved'
    });

    if (pendingBookings.length === 0 && !isRetry) {
      console.log(`No pending bookings for ${station} on ${date} at ${time}`);
      return;
    }

    const now = new Date();
    const agingFactor = 0.08;
    const maxWaitTime = 40;
    const maxBoost = 20;

    // חישוב ציוני עדיפות לכל ההזמנות הממתינות
    const pendingWithPriority = pendingBookings.map(booking => {
      const createdAt = new Date(booking.createdAt);
      const waitingMinutes = (now - createdAt) / (60 * 1000);
      const processingTime = booking.estimatedChargeTime || 30;
      const deadlineMinutes = 60; // Default deadline is 60 minutes
      const laxity = Math.max(0, deadlineMinutes - processingTime);
      const waitFactor = Math.min(waitingMinutes / maxWaitTime, 1);
      const agingBoost = waitFactor * maxBoost;
      const priorityScore =
        laxity * 2 -
        agingBoost -
        (100 - (booking.currentBattery ?? 50)) / 5;
      return {
        _id: booking._id,
        user: booking.user,
        urgencyLevel: booking.urgencyLevel,
        estimatedChargeTime: booking.estimatedChargeTime,
        currentBattery: booking.currentBattery,
        laxity,
        createdAt,
        status: 'pending',
        priorityScore
      };
    });

    // חישוב ציוני עדיפות להזמנות שכבר אושרו
    const approvedWithPriority = approvedBookings.map(booking => {
      const processingTime = booking.estimatedChargeTime || 30;
      const deadlineMinutes = 60;
      const laxity = Math.max(0, deadlineMinutes - processingTime);
      const priorityScore =
        laxity * 2 + 15 -
        (100 - (booking.currentBattery ?? 50)) / 10;
      return {
        _id: booking._id,
        user: booking.user,
        urgencyLevel: booking.urgencyLevel,
        estimatedChargeTime: booking.estimatedChargeTime,
        currentBattery: booking.currentBattery,
        laxity,
        createdAt: new Date(booking.createdAt),
        status: 'approved',
        priorityScore
      };
    });

    // איחוד כל ההזמנות לרשימה אחת לצורך בחינת עדיפות
    const allBookingsWithPriority = [...pendingWithPriority, ...approvedWithPriority];

    // מיון כל ההזמנות לפי העדיפות (lower score = higher priority)
    allBookingsWithPriority.sort((a, b) => {
      if (a.priorityScore !== b.priorityScore) {
        return a.priorityScore - b.priorityScore;
      }
      if (a.laxity !== b.laxity) {
        return a.laxity - b.laxity;
      }
      if (a.currentBattery !== b.currentBattery) {
        return a.currentBattery - b.currentBattery;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // בחירת ההזמנות בעלות העדיפות הגבוהה ביותר
    const selectedBookings = allBookingsWithPriority.slice(0, maxSlots);

    // מציאת הזמנות ממתינות שנבחרו לאישור
    const pendingToApprove = selectedBookings.filter(b => b.status === 'pending');

    // מציאת הזמנות ממתינות שנדחות (מעבר למספר העמדות)
    const pendingToReject = pendingWithPriority.filter(b =>
      !selectedBookings.some(approved => approved._id.toString() === b._id.toString())
    );

    // טיפול בהזמנות ממתינות שמאושרות
    for (const booking of pendingToApprove) {
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: 'approved' } }
      );
      const fullBookingData = await Booking.findById(booking._id);
      if (fullBookingData) {
        await sendBookingConfirmationEmail(
          fullBookingData.user,
          fullBookingData.station,
          fullBookingData.date,
          fullBookingData.time
        );
        console.log(`✅ Booking approved for user ${fullBookingData.user}`, {
          station: fullBookingData.station,
          date: fullBookingData.date,
          time: fullBookingData.time
        });
      } else {
        console.error(`❌ Could not find full booking data for ID: ${booking._id}`);
      }
    }

    // טיפול בהזמנות ממתינות שנדחות (מעבר למספר העמדות)
    for (const booking of pendingToReject) {
      const newRejectionCount = (booking.rejectionCount || 0) + 1;
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: 'rejected', rejectionCount: newRejectionCount } }
      );
      // מציאת תחנות קרובות כהמלצה
      const alternativeStations = await findNearbyStations(trimmedStation);
      await sendBookingCancellationEmail(booking.user, trimmedStation, date, time, alternativeStations);
      console.log(`❌ Booking rejected for user ${booking.user} (no available slot)`);
    }

    // טיפול בהזמנות מאושרות שנדרשות לביטול
    const approvedToCancel = approvedWithPriority.filter(b =>
      !selectedBookings.some(keep => keep._id.toString() === b._id.toString())
    );

    for (const booking of approvedToCancel) {
      const newRejectionCount = (booking.rejectionCount || 0) + 1;
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: 'cancelled', rejectionCount: newRejectionCount } }
      );
      // מציאת תחנות קרובות כהמלצה
      const alternativeStations = await findNearbyStations(trimmedStation);
      await sendBookingCancellationEmail(booking.user, trimmedStation, date, time, alternativeStations, true);
      console.log(`⚠️ Previously approved booking cancelled for user ${booking.user} due to higher priority bookings`);
    }

    console.log(`✅ Allocation completed for ${station} on ${date} at ${time}.`);
    console.log(`Approved: ${pendingToApprove.length}, Rejected: ${pendingToReject.length}`);
  } catch (error) {
    console.error('Error in allocation process:', error);
  }
};

// פונקציה למציאת תחנות טעינה קרובות
const findNearbyStations = async (stationName) => {
  try {
    // בשלב זה נחזיר רשימה קבועה של 2 תחנות אקראיות חלופיות
   
    const allStations = await Station.find({ "Station Name": { $ne: stationName } }).limit(10);

    if (allStations.length <= 2) {
      return allStations.map(station => station["Station Name"]);
    }

    // בחירת 2 תחנות אקראיות
    const shuffled = allStations.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2).map(station => station["Station Name"]);
  } catch (error) {
    console.error('Error finding nearby stations:', error);
    return [];
  }
};

// Add a new endpoint to manually trigger appointment processing
router.post('/process-pending', authMiddleware, async (req, res) => {
  try {
    console.log('Manual processing of pending bookings triggered by user');
    
    // Run the manual check function
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
