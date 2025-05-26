const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Booking = require('./models/Booking');
require('dotenv').config();

// Configure email transporter with better error handling
let transporter;
try {
  // Check if email credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS environment variables are missing! Email notifications will be logged to console only.');

    // Create a mock transporter that just logs to console
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('📧 [EMAIL NOT SENT - MISSING CREDENTIALS] Would send email:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          text: mailOptions.text.substring(0, 100) + '...'
        });
        return { response: 'Email logged to console (mock)' };
      }
    };
  } else {
    // Create real transporter
    transporter = nodemailer.createTransport({
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
  }
} catch (error) {
  console.error('❌ Failed to initialize email transporter:', error);

  // Fallback to console logging
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 [EMAIL NOT SENT - ERROR] Would send email:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text.substring(0, 100) + '...'
      });
      return { response: 'Email logged to console (fallback)' };
    }
  };
}

// Helper function to check if time is around the one-hour mark before appointment
const isWithinOneHour = (appointmentDateTime) => {
  const now = new Date();
  const oneHourBefore = new Date(appointmentDateTime);
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);

  // Debug log to track all times
  console.log(`Checking appointment time: ${appointmentDateTime.toISOString()}`);
  console.log(`Current time: ${now.toISOString()}, One hour before appointment: ${oneHourBefore.toISOString()}`);

  // Calculate minutes difference
  const diffMs = Math.abs(oneHourBefore - now);
  const diffMinutes = Math.floor(diffMs / 60000);

  // Process appointments within a 5-minute window around the one-hour mark
  // This ensures we don't miss processing due to scheduler timing
  const isAroundOneHourMark = diffMinutes <= 5;

  // For logging purposes
  const totalDiffMs = appointmentDateTime - now;
  const hoursUntilAppointment = Math.floor(totalDiffMs / (1000 * 60 * 60));
  const minutesUntilAppointment = Math.floor((totalDiffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (isAroundOneHourMark) {
    console.log(`🔔 PROCESSING: Appointment at ${appointmentDateTime.toISOString()} is within the one-hour window (${hoursUntilAppointment}h ${minutesUntilAppointment}m until appointment)`);
  }

  return isAroundOneHourMark;
};

// Helper function to find nearby alternative bookings
const findNearbyAlternatives = async (rejectedBooking) => {
  try {
    // Find bookings in same city that still have open slots
    const alternatives = await Booking.aggregate([
      {
        $match: {
          station: rejectedBooking.station,
          status: 'approved',
          $or: [
            // Different date
            { date: { $ne: rejectedBooking.date } },
            // Same date but different time
            {
              date: rejectedBooking.date,
              time: { $ne: rejectedBooking.time }
            }
          ]
        }
      },
      {
        $group: {
          _id: {
            station: "$station",
            date: "$date",
            time: "$time",
          },
          count: { $sum: 1 }
        }
      },
      {
        $limit: 3 // Limit to 3 alternatives
      }
    ]);

    return alternatives.map(alt => ({
      station: alt._id.station,
      date: alt._id.date,
      time: alt._id.time
    }));
  } catch (error) {
    console.error('Error finding alternatives:', error);
    return [];
  }
};

// Process bookings that are scheduled 1 hour from now
const processAppointments = async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    console.log(`🕒 Running processAppointments at ${now.toISOString()}`);

    // Find all pending bookings for today and future dates
    const pendingBookings = await Booking.find({
      status: 'pending',
      date: { $gte: todayStr }
    });

    console.log(`Found ${pendingBookings.length} pending bookings to check`);

    // Group bookings by station, date, and time
    const bookingGroups = {};
    let missedBookings = 0;

    for (const booking of pendingBookings) {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      const oneHourBefore = new Date(bookingDateTime);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);

      // Also check for bookings that have passed the 1-hour mark but haven't been processed
      const isPastOneHourMark = now > oneHourBefore && now < bookingDateTime;

      // Check if booking is exactly at the one-hour mark or has passed it
      if (isWithinOneHour(bookingDateTime) || isPastOneHourMark) {
        if (isPastOneHourMark && !isWithinOneHour(bookingDateTime)) {
          missedBookings++;
          console.log(`⚠️ Found missed booking for ${booking.user} at ${bookingDateTime.toISOString()}`);
        }

        const groupKey = `${booking.station}|${booking.date}|${booking.time}`;

        if (!bookingGroups[groupKey]) {
          bookingGroups[groupKey] = {
            station: booking.station,
            date: booking.date,
            time: booking.time,
            maxCapacity: 2, // Default, should be updated based on station details
            bookings: []
          };
        }

        bookingGroups[groupKey].bookings.push(booking);
      }
    }

    if (missedBookings > 0) {
      console.log(`⚠️ Found ${missedBookings} bookings that passed the 1-hour mark without processing`);
    }

    // Process each group of bookings
    for (const groupKey in bookingGroups) {
      const group = bookingGroups[groupKey];

      if (group.bookings.length === 0) continue;

      console.log(`⚡ Processing group: ${group.station} on ${group.date} at ${group.time}`);
      console.log(`📊 Station capacity: ${group.maxCapacity}, Total bookings: ${group.bookings.length}`);

      // Calculate LLEP and aging metrics for each booking
      const bookingsWithPriority = group.bookings.map(booking => {
        // Calculate waiting time (used for aging)
        const createdAt = new Date(booking.createdAt);
        const waitingHours = (now - createdAt) / (1000 * 60 * 60);

        // Calculate laxity (deadline - processing time)
        const processingTime = booking.estimatedChargeTime || 30; // In minutes
        const deadlineTime = 60; // Default deadline is 60 minutes
        const laxity = Math.max(1, deadlineTime - processingTime);

        // LLEP algorithm prioritizes tasks with lowest laxity
        // Aging increases priority based on waiting time
        // Battery level gives priority to lower battery vehicles

        // The lower this score, the higher the priority
        const priorityScore = (
          laxity - // Base priority is laxity (lower is higher priority)
          (waitingHours * 2) - // Aging factor (longer wait reduces score)
          ((100 - (booking.currentBattery || 50)) / 10) // Battery factor (lower battery reduces score)
        );

        return {
          ...booking.toObject(),
          laxity,
          waitingHours,
          priorityScore
        };
      });

      // Sort bookings by priority score (lower is better)
      bookingsWithPriority.sort((a, b) => a.priorityScore - b.priorityScore);

      // Log the sorted bookings
      console.log("📋 Prioritized bookings:");
      bookingsWithPriority.forEach((booking, idx) => {
        console.log(`${idx + 1}. User: ${booking.user}, Priority: ${booking.priorityScore.toFixed(2)}, Laxity: ${booking.laxity}, Battery: ${booking.currentBattery || 'N/A'}, Waiting: ${booking.waitingHours.toFixed(1)}h`);
      });

      // Use station capacity
      const stationCapacity = group.maxCapacity;

      // Take top N bookings based on capacity
      const approvedBookings = bookingsWithPriority.slice(0, stationCapacity);
      const rejectedBookings = bookingsWithPriority.slice(stationCapacity);

      // Process approved bookings
      for (const b of approvedBookings) {
        const booking = await Booking.findById(b._id);
        if (!booking) continue;

        booking.status = 'approved';
        booking.approvalDate = new Date();
        await booking.save();

        // Send approval email with HTML styling
        const approvalMailOptions = {
          from: process.env.EMAIL,
          to: booking.user,
          subject: 'Booking Approved',
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Approved</title>
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
              .status-approved {
                display: inline-block;
                background-color: #f6ffed;
                color: #52c41a;
                font-weight: 600;
                padding: 10px 25px;
                border-radius: 4px;
                border: 1px solid #b7eb8f;
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
              
              /* Mobile Responsive Styles */
              @media screen and (max-width: 480px) {
                .container {
                  margin: 10px;
                  width: auto;
                }
                .content {
                  padding: 20px 15px;
                }
                .header {
                  padding: 15px 10px;
                }
                .header h1 {
                  font-size: 20px;
                }
                .message {
                  padding: 15px;
                }
                .detail-row {
                  flex-direction: column;
                  align-items: flex-start;
                }
                .detail-label {
                  margin-bottom: 5px;
                }
                .detail-value {
                  width: 100%;
                }
                .booking-details, .instructions {
                  padding: 15px;
                }
                .status-approved, .status-rejected {
                  padding: 8px 15px;
                  font-size: 14px;
                }
                .button {
                  display: block;
                  width: 100%;
                  padding: 10px;
                  text-align: center;
                  box-sizing: border-box;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Approved</h1>
              </div>
              <div class="content">
                <div class="greeting">Welcome to EVISION</div>
                
                <div class="message">
                  <p>Great news! Your charging station booking has been approved.</p>
                  <p>You are now scheduled for charging according to the details below.</p>
                </div>
                
                <div class="status-box">
                  <span class="status-approved">Approved</span>
                </div>
                
                <div class="booking-details">
                  <div class="detail-row">
                    <span class="detail-label">Charging Station:</span>
                    <span class="detail-value">${booking.station}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${booking.date}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${booking.time}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Battery Level:</span>
                    <span class="detail-value">${booking.currentBattery || 'N/A'}%</span>
                  </div>
                </div>
                
                <div class="instructions">
                  <p><strong>Important Reminders:</strong></p>
                  <ul>
                    <li>Please arrive at the charging station on time</li>
                    <li>Make sure to bring the appropriate cable for your vehicle</li>
                    <li>Your booking ID is: ${booking._id}</li>
                  </ul>
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

        console.log(`✅ Approving booking for ${booking.user}`);
        try {
          await transporter.sendMail(approvalMailOptions);
          console.log(`📧 Approval email sent to ${booking.user}`);
        } catch (error) {
          console.error(`❌ Failed to send approval email to ${booking.user}:`, error);
        }
      }

      // Process rejected bookings
      for (const b of rejectedBookings) {
        const booking = await Booking.findById(b._id);
        if (!booking) continue;

        // Find alternative options
        const alternatives = await findNearbyAlternatives(booking);

        booking.status = 'rejected';
        booking.rejectionReason = 'Station at full capacity';
        await booking.save();

        // Prepare alternative HTML content
        let alternativesHTML = '';
        if (alternatives.length > 0) {
          alternativesHTML = `
          <div style="margin-top: 20px; background-color: #fff8e6; border-radius: 8px; padding: 15px; border-left: 4px solid #faad14;">
            <p><strong>Available Alternatives:</strong></p>
            <ul style="padding-left: 20px;">
          `;

          alternatives.forEach((alt, index) => {
            alternativesHTML += `
              <li style="margin-bottom: 10px;">
                <strong>Station:</strong> ${alt.station}<br>
                <strong>Date:</strong> ${alt.date}<br>
                <strong>Time:</strong> ${alt.time}
              </li>
            `;
          });

          alternativesHTML += `
            </ul>
          </div>
          `;
        } else {
          alternativesHTML = `
          <p style="margin-top: 15px; color: #888;">No alternative bookings found at this time.</p>
          `;
        }

        // Send rejection email with HTML styling
        const rejectionMailOptions = {
          from: process.env.EMAIL,
          to: booking.user,
          subject: 'Booking Rejected',
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Rejected</title>
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
              .status-rejected {
                display: inline-block;
                background-color: #fff1f0;
                color: #f5222d;
                font-weight: 600;
                padding: 10px 25px;
                border-radius: 4px;
                border: 1px solid #ffa39e;
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
              
              /* Mobile Responsive Styles */
              @media screen and (max-width: 480px) {
                .container {
                  margin: 10px;
                  width: auto;
                }
                .content {
                  padding: 20px 15px;
                }
                .header {
                  padding: 15px 10px;
                }
                .header h1 {
                  font-size: 20px;
                }
                .message {
                  padding: 15px;
                }
                .detail-row {
                  flex-direction: column;
                  align-items: flex-start;
                }
                .detail-label {
                  margin-bottom: 5px;
                }
                .detail-value {
                  width: 100%;
                }
                .booking-details, .instructions {
                  padding: 15px;
                }
                .status-rejected {
                  padding: 8px 15px;
                  font-size: 14px;
                }
                .button {
                  display: block;
                  width: 100%;
                  padding: 10px;
                  text-align: center;
                  box-sizing: border-box;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Rejected</h1>
              </div>
              <div class="content">
                <div class="greeting">Welcome to EVISION</div>
                
                <div class="message">
                  <p>We regret to inform you that your charging station booking could not be approved due to full capacity.</p>
                  <p>This may be due to high demand during the requested time or the LLEP scheduling algorithm prioritizing other vehicles.</p>
                </div>
                
                <div class="status-box">
                  <span class="status-rejected">Rejected</span>
                </div>
                
                <div class="booking-details">
                  <div class="detail-row">
                    <span class="detail-label">Charging Station:</span>
                    <span class="detail-value">${booking.station}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${booking.date}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${booking.time}</span>
                  </div>
                </div>
                
                <div class="instructions">
                  <p><strong>What's Next?</strong></p>
                  <p>We would be happy if you tried booking at a different time or station. Your priority will be automatically increased for your next booking attempt.</p>
                  ${alternativesHTML}
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

        console.log(`❌ Rejecting booking for ${booking.user}`);
        try {
          await transporter.sendMail(rejectionMailOptions);
          console.log(`📧 Rejection email sent to ${booking.user}`);
        } catch (error) {
          console.error(`❌ Failed to send rejection email to ${booking.user}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error processing bookings:', error);
  }
};

// Handle late registrations (after approval process has run)
const handleLateRegistration = async (booking) => {
  try {
    const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const now = new Date();
    const oneHourBefore = new Date(bookingDateTime);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    // Check if registration is after the 1-hour cutoff
    if (now > oneHourBefore) {
      // Get approved bookings count
      const approvedCount = await Booking.countDocuments({
        station: booking.station,
        date: booking.date,
        time: booking.time,
        status: 'approved'
      });

      // Check if there's still capacity available (assume max 2)
      if (approvedCount < 2) {
        // Automatically approve if there's still room
        booking.status = 'approved';
        booking.approvalDate = new Date();

        // Send approval email with HTML styling
        const approvalMailOptions = {
          from: process.env.EMAIL,
          to: booking.user,
          subject: 'Late Registration Approved',
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Late Registration Approved</title>
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
              .status-approved {
                display: inline-block;
                background-color: #f6ffed;
                color: #52c41a;
                font-weight: 600;
                padding: 10px 25px;
                border-radius: 4px;
                border: 1px solid #b7eb8f;
              }
              .footer {
                background-color: #141b2d;
                color: #aaa;
                text-align: center;
                padding: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Late Registration Approved</h1>
              </div>
              <div class="content">
                <div class="greeting">Welcome to EVISION</div>
                
                <div class="message">
                  <p>Good news! Even though your registration was made after the booking deadline, we were able to approve your booking as we still have capacity available.</p>
                </div>
                
                <div class="status-box">
                  <span class="status-approved">Approved</span>
                </div>
                
                <div class="booking-details">
                  <div class="detail-row">
                    <span class="detail-label">Charging Station:</span>
                    <span class="detail-value">${booking.station}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${booking.date}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${booking.time}</span>
                  </div>
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

        transporter.sendMail(approvalMailOptions);
      } else {
        // Mark as late registration
        booking.status = 'rejected';
        booking.rejectionReason = 'Late registration - station full';

        // Send late registration email with HTML styling
        const lateMailOptions = {
          from: process.env.EMAIL,
          to: booking.user,
          subject: 'Late Registration - Station Full',
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Late Registration - Station Full</title>
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
              .status-rejected {
                display: inline-block;
                background-color: #fff1f0;
                color: #f5222d;
                font-weight: 600;
                padding: 10px 25px;
                border-radius: 4px;
                border: 1px solid #ffa39e;
              }
              .footer {
                background-color: #141b2d;
                color: #aaa;
                text-align: center;
                padding: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Late Registration - Station Full</h1>
              </div>
              <div class="content">
                <div class="greeting">Welcome to EVISION</div>
                
                <div class="message">
                  <p>We regret to inform you that your booking could not be processed as it was made after the booking deadline and all stations are currently at full capacity.</p>
                </div>
                
                <div class="status-box">
                  <span class="status-rejected">Rejected</span>
                </div>
                
                <div class="booking-details">
                  <div class="detail-row">
                    <span class="detail-label">Charging Station:</span>
                    <span class="detail-value">${booking.station}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${booking.date}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${booking.time}</span>
                  </div>
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

        transporter.sendMail(lateMailOptions);
      }

      await booking.save();
    }
  } catch (error) {
    console.error('Error handling late registration:', error);
  }
};

// Manual function to check all pending bookings
const manualCheckAllPendingAppointments = async () => {
  console.log('🔍 Running manual check of all pending bookings');

  try {
    const now = new Date();
    const pendingBookings = await Booking.find({ status: 'pending' });

    console.log(`Found ${pendingBookings.length} total pending bookings`);

    const bookingsToProcess = pendingBookings.filter(booking => {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      const oneHourBefore = new Date(bookingDateTime);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);

      // Check if we're past the one-hour mark but before the actual booking
      return now >= oneHourBefore && now < bookingDateTime;
    });

    console.log(`Found ${bookingsToProcess.length} bookings that should be processed immediately`);

    if (bookingsToProcess.length > 0) {
      // Group by station, date, and time
      const groups = {};

      for (const booking of bookingsToProcess) {
        const key = `${booking.station}|${booking.date}|${booking.time}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(booking);
      }

      console.log(`Grouped into ${Object.keys(groups).length} unique time slots`);

      // Process each group
      for (const [key, bookings] of Object.entries(groups)) {
        console.log(`Processing group ${key} with ${bookings.length} bookings`);

        // Assume default max capacity of 2
        const capacity = 2;

        // Sort bookings by priority
        const sortedBookings = bookings.sort((a, b) => {
          // Simple priority: earlier registration time = higher priority
          return new Date(a.createdAt) - new Date(b.createdAt);
        });

        // Process according to capacity
        const approved = sortedBookings.slice(0, capacity);
        const rejected = sortedBookings.slice(capacity);

        // Update status and send emails
        for (const booking of approved) {
          booking.status = 'approved';
          booking.approvalDate = now;
          await booking.save();

          try {
            await transporter.sendMail({
              from: process.env.EMAIL,
              to: booking.user,
              subject: 'Booking Approved (Manual Check)',
              text: `Dear User,
              
Your booking has been approved through our manual check system.

Station: ${booking.station}
Date: ${booking.date}
Time: ${booking.time}

Please arrive on time for your appointment.

Best regards,
Your Service Team`
            });
            console.log(`📧 Approval email sent to ${booking.user} (manual check)`);
          } catch (error) {
            console.error(`Failed to send approval email to ${booking.user}:`, error);
          }
        }

        for (const booking of rejected) {
          booking.status = 'rejected';
          booking.rejectionReason = 'Station at full capacity (manual check)';
          await booking.save();

          try {
            await transporter.sendMail({
              from: process.env.EMAIL,
              to: booking.user,
              subject: 'Booking Rejected (Manual Check)',
              text: `Dear User,
              
We regret to inform you that your booking could not be approved due to full capacity.

Station: ${booking.station}
Date: ${booking.date}
Time: ${booking.time}

You can book a new appointment through our app.

Best regards,
Your Service Team`
            });
            console.log(`📧 Rejection email sent to ${booking.user} (manual check)`);
          } catch (error) {
            console.error(`Failed to send rejection email to ${booking.user}:`, error);
          }
        }
      }
    }

    return {
      checked: pendingBookings.length,
      processed: bookingsToProcess.length
    };
  } catch (error) {
    console.error('Error in manual check:', error);
    return {
      error: error.message,
      checked: 0,
      processed: 0
    };
  }
};

// Schedule the job to run every minute
const startScheduler = () => {
  // Run the cron job every 10 seconds for more precise timing
  cron.schedule('*/10 * * * * *', () => {
    const now = new Date();
    console.log(`Running booking approval process at ${now.toISOString()}`);
    processAppointments();
  });

  // Also run manual check at startup to catch any missed bookings
  manualCheckAllPendingAppointments();

  // Run manual check every hour as a backup
  cron.schedule('0 * * * *', () => {
    console.log('Running hourly manual check');
    manualCheckAllPendingAppointments();
  });

  console.log('Booking scheduler started - running every 10 seconds to ensure accurate scheduling!');
};

module.exports = {
  startScheduler,
  handleLateRegistration,
  manualCheckAllPendingAppointments // Export for API access
};