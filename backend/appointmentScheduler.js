const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Booking = require('./models/Booking');
const Station = require('./Station');
const User = require('./User');
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
          text: mailOptions.text ? mailOptions.text.substring(0, 100) + '...' : 'No text content'
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
        text: mailOptions.text ? mailOptions.text.substring(0, 100) + '...' : 'No text content'
      });
      return { response: 'Email logged to console (fallback)' };
    }
  };
}

// Create a Map to store user rejection history
const userRejectionHistory = new Map();

// Create a Set to track bookings that are currently being processed
// This will prevent race conditions where the same booking is processed by multiple functions simultaneously
const processingBookings = new Set();

// Create a Set to track bookings that have already been processed (to prevent duplicate processing)
const processedBookings = new Set();

// Helper function to update user rejection history
const updateRejectionHistory = (userEmail, station, date, time) => {
  const key = userEmail;
  
  if (!userRejectionHistory.has(key)) {
    userRejectionHistory.set(key, {
      rejectionCount: 1,
      lastRejection: new Date(),
      stations: {
        [station]: {
          rejectionCount: 1,
          lastRejection: new Date(),
          agingBonus: 5, // Initial bonus of 5 points
          history: [{ date, time }]
        }
      }
    });
  } else {
    const history = userRejectionHistory.get(key);
    history.rejectionCount += 1;
    history.lastRejection = new Date();
    
    // Update or create station-specific history
    if (!history.stations[station]) {
      history.stations[station] = {
        rejectionCount: 1,
        lastRejection: new Date(),
        agingBonus: 5, // Initial bonus
        history: [{ date, time }]
      };
    } else {
      const stationHistory = history.stations[station];
      stationHistory.rejectionCount += 1;
      stationHistory.lastRejection = new Date();
      
      // Increase aging bonus with each rejection, capped at 20
      stationHistory.agingBonus = Math.min(20, stationHistory.agingBonus + 5);
      
      // Keep track of the last 3 rejected times for this station
      stationHistory.history.push({ date, time });
      if (stationHistory.history.length > 3) {
        stationHistory.history.shift(); // Remove oldest entry
      }
    }
    
    userRejectionHistory.set(key, history);
  }
  
  const stationBonus = userRejectionHistory.get(key).stations[station].agingBonus;
  console.log(`👴 Updated rejection history for ${userEmail} at station ${station}: ${userRejectionHistory.get(key).stations[station].rejectionCount} rejections, ${stationBonus} bonus points`);
};

// Helper function to get aging bonus for a user at a specific station
const getAgingBonus = (userEmail, station) => {
  if (!userRejectionHistory.has(userEmail)) {
    return 0;
  }
  
  const history = userRejectionHistory.get(userEmail);
  
  // If no history for this specific station, return 0
  if (!history.stations[station]) {
    return 0;
  }
  
  const stationHistory = history.stations[station];
  
  // Check if the rejection history is recent (within last 48 hours)
  const now = new Date();
  const hoursSinceLastRejection = (now - stationHistory.lastRejection) / (1000 * 60 * 60);
  
  if (hoursSinceLastRejection > 48) {
    // Reset aging bonus if it's been more than 48 hours
    stationHistory.agingBonus = Math.max(0, stationHistory.agingBonus - 5);
    userRejectionHistory.set(userEmail, history);
  }
  
  return stationHistory.agingBonus;
};

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

  // Process appointments within a 10-minute window around the one-hour mark
  // Increased from 5 minutes to 10 minutes to ensure we don't miss processing due to scheduler timing
  const isAroundOneHourMark = diffMinutes <= 10;

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
      const bookingId = booking._id.toString();
      
      // Skip if this booking has already been processed to prevent duplicate processing
      if (processedBookings.has(bookingId)) {
        console.log(`⚠️ Booking ${bookingId} has already been processed. Skipping.`);
        continue;
      }
      
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      const oneHourBefore = new Date(bookingDateTime);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);

      // Check if we're past the one-hour mark but before the actual booking
      const isPastOneHourMark = now > oneHourBefore && now < bookingDateTime;
      
      // Check if booking is near the one-hour mark or has already passed it
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
            maxCapacity: 0,
            bookings: [],
            existingApprovedCount: 0
          };
        }

        bookingGroups[groupKey].bookings.push(booking);
      }
    }

    // Count how many bookings we're processing
    let totalBookingsToProcess = 0;
    for (const groupKey in bookingGroups) {
      totalBookingsToProcess += bookingGroups[groupKey].bookings.length;
    }
    console.log(`🔍 Processing ${totalBookingsToProcess} bookings across ${Object.keys(bookingGroups).length} time slots`);

    // After grouping, get the actual station capacities and existing approved bookings
    for (const groupKey in bookingGroups) {
      const group = bookingGroups[groupKey];
      if (group.bookings.length === 0) continue;
      
      try {
        // Get station details to determine actual capacity
        const stationDetails = await Station.findOne({ 
          "Station Name": { $regex: new RegExp(`^${group.station.trim()}\\s*$`, 'i') }
        });
        
        console.log(`🔍 Looking for station: "${group.station}" -> Found: ${stationDetails ? `"${stationDetails['Station Name']}" with capacity ${stationDetails['Duplicate Count']}` : 'NOT FOUND'}`);
        
        // Ensure we have a valid capacity number
        if (stationDetails && stationDetails["Duplicate Count"]) {
          // Convert to integer and ensure it's at least 1
          group.maxCapacity = Math.max(1, parseInt(stationDetails["Duplicate Count"]) || 1);
        } else {
          group.maxCapacity = 1; // Changed default to 1 instead of 2
          console.warn(`⚠️ No capacity found for ${group.station}, using default: ${group.maxCapacity}`);
        }

        // IMPORTANT: Check for existing approved bookings for this time slot
        const existingApproved = await Booking.countDocuments({
          $or: [
            { station: group.station },
            { station: { $regex: new RegExp(`^${group.station.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
          ],
          date: group.date,
          time: group.time,
          status: 'approved'
        });
        
        group.existingApprovedCount = existingApproved;
        
        console.log(`📊 Station ${group.station} has capacity: ${group.maxCapacity}, with ${existingApproved} existing approved bookings`);
        
        // CRITICAL: If we already have approved bookings equal to or exceeding capacity, reject all pending
        if (existingApproved >= group.maxCapacity) {
          console.log(`🚫 Station ${group.station} is already at full capacity with ${existingApproved} approved bookings. Rejecting all ${group.bookings.length} pending bookings.`);
          
          // Reject all pending bookings for this slot
          for (const booking of group.bookings) {
            const bookingId = booking._id.toString();
            
            // Skip if already processed
            if (processedBookings.has(bookingId)) continue;
            
            // Mark as processed to prevent duplicates
            processedBookings.add(bookingId);
            
            // Delete the booking and send rejection email
            await sendRejectionEmail(booking.user, booking.station, booking.date, booking.time, 'Station already at full capacity');
            await Booking.findByIdAndDelete(booking._id);
            console.log(`🗑️ Deleted rejected booking ${booking._id} for user ${booking.user}`);
          }
          
          // Skip to next group
          continue;
        }
      } catch (error) {
        console.error(`Error getting capacity for station ${group.station}:`, error);
        group.maxCapacity = 1; // Fallback to default if error - changed to 1
        group.existingApprovedCount = 0;
      }
      
      // Important check: Make sure we reject bookings if there are more than capacity
      const totalPotentialBookings = group.bookings.length + group.existingApprovedCount;
      if (totalPotentialBookings > group.maxCapacity) {
        console.log(`⚠️ Found ${group.bookings.length} pending bookings plus ${group.existingApprovedCount} existing approved bookings for station with capacity ${group.maxCapacity} - some will be rejected`);
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
      console.log(`📊 Station capacity: ${group.maxCapacity}, Existing approved: ${group.existingApprovedCount}, Pending: ${group.bookings.length}`);
      
      // Calculate LLEP and aging metrics for each booking
      const bookingsWithPriority = await Promise.all(group.bookings.map(async booking => {
        // Calculate waiting time (used for aging)
        const createdAt = new Date(booking.createdAt);
        const waitingHours = (now - createdAt) / (1000 * 60 * 60);

        // Calculate laxity (deadline - processing time)
        const processingTime = booking.estimatedChargeTime || 30; // In minutes
        const deadlineTime = 60; // Default deadline is 60 minutes
        const laxity = Math.max(1, deadlineTime - processingTime);
        
        // Get user's laxity bonus from their profile
        let userLaxityBonus = 0;
        try {
          const user = await User.findOne({ email: booking.user });
          if (user) {
            userLaxityBonus = user.laxity || 0;
          }
        } catch (error) {
          console.error(`Error fetching user laxity for ${booking.user}:`, error);
        }

        // LLEP algorithm prioritizes tasks with lowest laxity
        // Aging increases priority based on waiting time
        // Battery level gives priority to lower battery vehicles
        // User laxity bonus gives priority to users who were previously rejected

        // The lower this score, the higher the priority
        const priorityScore = (
          laxity - // Base priority is laxity (lower is higher priority)
          (waitingHours * 2) - // Aging factor (longer wait reduces score)
          ((100 - (booking.currentBattery || 50)) / 10) - // Battery factor (lower battery reduces score)
          userLaxityBonus // User's accumulated laxity bonus (reduces score)
        );

        return {
          ...booking.toObject(),
          laxity,
          waitingHours,
          userLaxityBonus, // Add this to the object for logging
          priorityScore
        };
      }));

      // Sort bookings by priority score (lower is better)
      bookingsWithPriority.sort((a, b) => a.priorityScore - b.priorityScore);

      // Log the sorted bookings with user laxity bonus
      console.log("📋 Prioritized bookings:");
      bookingsWithPriority.forEach((booking, idx) => {
        console.log(`${idx + 1}. User: ${booking.user}, Priority: ${booking.priorityScore.toFixed(2)}, Laxity: ${booking.laxity}, Battery: ${booking.currentBattery || 'N/A'}, Waiting: ${booking.waitingHours.toFixed(1)}h, User Laxity Bonus: ${booking.userLaxityBonus}`);
      });

      // Use station capacity - ensure it's a valid number
      const stationCapacity = Math.max(1, parseInt(group.maxCapacity) || 1);
      
      // IMPORTANT: Calculate remaining slots after accounting for existing approved bookings
      const remainingSlots = Math.max(0, stationCapacity - group.existingApprovedCount);
      
      console.log(`🔢 Station has ${remainingSlots} remaining slots out of ${stationCapacity} total capacity`);

      // Take top N bookings based on remaining capacity
      const approvedBookings = bookingsWithPriority.slice(0, remainingSlots);
      const rejectedBookings = bookingsWithPriority.slice(remainingSlots);
      
      console.log(`✅ Approving ${approvedBookings.length} bookings, ❌ Rejecting ${rejectedBookings.length} bookings`);

      // Process approved bookings
      for (const b of approvedBookings) {
        const bookingId = b._id.toString();
        
        // Skip if this booking has already been processed
        if (processedBookings.has(bookingId)) {
          console.log(`⚠️ Booking ${bookingId} has already been processed. Skipping.`);
          continue;
        }
        
        const booking = await Booking.findById(b._id);
        if (!booking) {
          console.log(`⚠️ Booking ${b._id} not found, skipping`);
          continue;
        }
        
        // Skip bookings that are already processed
        if (booking.status !== 'pending') {
          console.log(`⚠️ Booking ${b._id} has status ${booking.status}, not 'pending'. Skipping.`);
          continue;
        }
        
        // Check if this booking is already being processed by another function
        if (processingBookings.has(bookingId)) {
          console.log(`🔒 Booking ${bookingId} is already being processed by another function. Skipping.`);
          continue;
        }
        
        // Add this booking to the processing and processed sets
        processingBookings.add(bookingId);
        processedBookings.add(bookingId);
        
        try {
          // FINAL SAFETY CHECK: Re-verify capacity before approving each booking
          const currentApprovedCount = await Booking.countDocuments({
            $or: [
              { station: booking.station },
              { station: { $regex: new RegExp(`^${booking.station.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
            ],
            date: booking.date,
            time: booking.time,
            status: 'approved'
          });
          
          if (currentApprovedCount >= stationCapacity) {
            console.log(`🚫 Station capacity exceeded during processing. Rejecting booking ${booking._id}`);
            
            // Reject this booking instead of approving
            await sendRejectionEmail(booking.user, booking.station, booking.date, booking.time, 'Station capacity exceeded during processing');
            await Booking.findByIdAndDelete(booking._id);
            continue;
          }

          booking.status = 'approved';
          booking.approvalDate = new Date();
          await booking.save();

          // Reset user's laxity bonus when booking is approved
          try {
            await User.findOneAndUpdate(
              { email: booking.user },
              { laxity: 0 },
              { new: true }
            );
            console.log(`🔄 Reset laxity bonus for user ${booking.user}`);
          } catch (error) {
            console.error(`❌ Failed to reset laxity for user ${booking.user}:`, error);
          }

          console.log(`✅ Approved booking for ${booking.user} at ${booking.station} on ${booking.date} at ${booking.time}`);

          // Send approval email
          try {
            await sendApprovalEmail(booking);
            console.log(`📧 Approval email sent to ${booking.user}`);
          } catch (error) {
            console.error(`❌ Failed to send approval email to ${booking.user}:`, error);
          }
        } finally {
          // Always remove the booking from the processing set when done
          processingBookings.delete(bookingId);
        }
      }
      
      // Process rejected bookings - make sure we reject all bookings that exceed capacity
      for (const b of rejectedBookings) {
        const bookingId = b._id.toString();
        
        // Skip if this booking has already been processed
        if (processedBookings.has(bookingId)) {
          console.log(`⚠️ Booking ${bookingId} has already been processed. Skipping.`);
          continue;
        }
        
        const booking = await Booking.findById(b._id);
        if (!booking) {
          console.log(`⚠️ Booking ${b._id} not found, skipping`);
          continue;
        }
        
        // Skip bookings that are already processed
        if (booking.status !== 'pending') {
          console.log(`⚠️ Booking ${b._id} has status ${booking.status}, not 'pending'. Skipping.`);
          continue;
        }
        
        // Check if this booking is already being processed by another function
        if (processingBookings.has(bookingId)) {
          console.log(`🔒 Booking ${bookingId} is already being processed by another function. Skipping.`);
          continue;
        }
        
        // Add this booking to the processing and processed sets
        processingBookings.add(bookingId);
        processedBookings.add(bookingId);
        
        try {
          console.log(`❌ Rejecting booking for ${booking.user} due to capacity limit exceeded`);
          
          // Send rejection email before deleting
          await sendRejectionEmail(booking.user, booking.station, booking.date, booking.time, 'Station capacity exceeded');
          
          // Delete the booking
          await Booking.findByIdAndDelete(booking._id);
          console.log(`🗑️ Deleted rejected booking ${booking._id} for user ${booking.user}`);
        } finally {
          // Always remove the booking from the processing set when done
          processingBookings.delete(bookingId);
        }
      }
    }
  } catch (error) {
    console.error('Error processing bookings:', error);
  }
};

// Helper function to send approval email
const sendApprovalEmail = async (booking) => {
  const approvalMailOptions = {
    from: process.env.EMAIL_USER,
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
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          background-color: #fff;
          padding: 30px 25px;
        }
        .booking-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
        }
        .detail-label {
          font-weight: 600;
          color: #5c6b77;
        }
        .detail-value {
          font-weight: 500;
          color: #141b2d;
        }
        .footer {
          background-color: #f8f9fa;
          color: #6c757d;
          text-align: center;
          padding: 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Approved</h1>
        </div>
        <div class="content">
          <p>Great news! Your charging station booking has been approved.</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">Station:</span>
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
          
          <p>Please arrive at the charging station on time.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EVISION - Electric Vehicle Charging Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  await transporter.sendMail(approvalMailOptions);
};

// Helper function to send rejection email
const sendRejectionEmail = async (userEmail, station, date, time, reason = 'Station capacity exceeded') => {
  try {
    // Add laxity bonus to user when their booking is rejected
    const laxityBonus = 5; // Bonus points for rejection
    try {
      const user = await User.findOneAndUpdate(
        { email: userEmail },
        { $inc: { laxity: laxityBonus } },
        { new: true, upsert: false }
      );
      
      if (user) {
        console.log(`📈 Added ${laxityBonus} laxity points to user ${userEmail}. Total laxity: ${user.laxity}`);
      } else {
        console.warn(`⚠️ User ${userEmail} not found when trying to update laxity`);
      }
    } catch (error) {
      console.error(`❌ Failed to update laxity for user ${userEmail}:`, error);
    }

    const rejectionMailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Booking Request Rejected',
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
            background-color: #dc3545;
            color: #fff;
            padding: 25px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            background-color: #fff;
            padding: 30px 25px;
          }
          .booking-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #dc3545;
          }
          .detail-row {
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: 600;
            color: #5c6b77;
          }
          .detail-value {
            font-weight: 500;
            color: #141b2d;
          }
          .reason-box {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
          }
          .priority-box {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
          }
          .footer {
            background-color: #f8f9fa;
            color: #6c757d;
            text-align: center;
            padding: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Request Rejected</h1>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>We regret to inform you that your booking request could not be approved.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Station:</span> <span class="detail-value">${station}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span> <span class="detail-value">${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span> <span class="detail-value">${time}</span>
              </div>
            </div>
            
            <div class="reason-box">
              <strong>Reason:</strong> ${reason}
            </div>
            
            <div class="priority-box">
              <strong>Good News:</strong> We've increased your priority for future bookings! You now have better chances of getting approved for your next booking request.
            </div>
            
            <p><strong>What's Next?</strong></p>
            <p>We encourage you to try booking at a different time or station. Your priority has been increased for future bookings.</p>
            
            <p>Thank you for choosing EVISION for your electric vehicle charging needs.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EVISION - Electric Vehicle Charging Solutions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `
    };

    await transporter.sendMail(rejectionMailOptions);
    console.log(`📧 Rejection email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send rejection email to ${userEmail}:`, error);
  }
};

// Handle late registrations (after approval process has run)
const handleLateRegistration = async (booking) => {
  try {
    // Check if this booking is already being processed by another function
    const bookingId = booking._id.toString();
    if (processingBookings.has(bookingId) || processedBookings.has(bookingId)) {
      console.log(`🔒 Booking ${bookingId} is already being processed or has been processed. Skipping.`);
      return booking;
    }
    
    // Add this booking to the processing set
    processingBookings.add(bookingId);
    processedBookings.add(bookingId);
    
    try {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      const now = new Date();
      const oneHourBefore = new Date(bookingDateTime);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);

      // First check if this booking has already been processed
      const existingBooking = await Booking.findById(booking._id);
      if (!existingBooking) {
        console.log(`⚠️ Booking ${booking._id} not found. Skipping.`);
        return booking;
      }
      
      // IMPORTANT: If the booking is already rejected or late_registration, don't change it
      if (existingBooking.status === 'rejected' || existingBooking.status === 'late_registration') {
        console.log(`⚠️ Booking ${booking._id} is already ${existingBooking.status}. Not changing status.`);
        return existingBooking;
      }
      
      // If booking is already approved, don't process it again
      if (existingBooking.status === 'approved') {
        console.log(`⚠️ Booking ${booking._id} is already approved. Not processing again.`);
        return existingBooking;
      }
      
      // Only process pending bookings
      if (existingBooking.status !== 'pending') {
        console.log(`⚠️ Booking ${booking._id} has status: ${existingBooking.status}. Only pending bookings should be processed.`);
        return existingBooking;
      }

      // Check if registration is after the 1-hour cutoff
      if (now > oneHourBefore && now < bookingDateTime) {
        // Get station details to determine actual capacity
        let stationCapacity = 1; // Default fallback changed to 1
        try {
          const stationDetails = await Station.findOne({ 
            "Station Name": { $regex: new RegExp(`^${existingBooking.station.trim()}\\s*$`, 'i') }
          });
          if (stationDetails && stationDetails["Duplicate Count"]) {
            stationCapacity = Math.max(1, parseInt(stationDetails["Duplicate Count"]) || 1);
          } else {
            console.warn(`⚠️ No capacity found for ${existingBooking.station}, using default: ${stationCapacity}`);
          }
        } catch (error) {
          console.error(`Error getting capacity for station ${existingBooking.station}:`, error);
        }

        // Get approved bookings count
        const approvedCount = await Booking.countDocuments({
          station: existingBooking.station,
          date: existingBooking.date,
          time: existingBooking.time,
          status: 'approved'
        });

        console.log(`📊 Station ${existingBooking.station} has ${approvedCount}/${stationCapacity} approved bookings`);

        // Check if there's still capacity available
        if (approvedCount < stationCapacity) {
          // Automatically approve if there's still room
          existingBooking.status = 'approved';
          existingBooking.approvalDate = new Date();

          // Save the booking with the new status
          await existingBooking.save();
          
          // Reset user's laxity bonus when booking is approved
          try {
            await User.findOneAndUpdate(
              { email: existingBooking.user },
              { laxity: 0 },
              { new: true }
            );
            console.log(`🔄 Reset laxity bonus for late approved user ${existingBooking.user}`);
          } catch (error) {
            console.error(`❌ Failed to reset laxity for user ${existingBooking.user}:`, error);
          }
          
          console.log(`✅ Late booking approved for ${existingBooking.user} at ${existingBooking.station} on ${existingBooking.date} at ${existingBooking.time}`);

          // Send approval email
          try {
            await sendApprovalEmail(existingBooking);
            console.log(`📧 Late approval email sent to ${existingBooking.user}`);
          } catch (error) {
            console.error(`❌ Failed to send late approval email to ${existingBooking.user}:`, error);
          }
        } else {
          // No capacity, reject
          console.log(`❌ Late booking rejected for ${existingBooking.user} - no capacity`);
          
          await sendRejectionEmail(existingBooking.user, existingBooking.station, existingBooking.date, existingBooking.time, 'No capacity available for late registration');
          await Booking.findByIdAndDelete(existingBooking._id);
        }
      } else {
        // Registration is NOT within the 1-hour window, keep it as pending
        console.log(`📅 Booking for ${existingBooking.station} on ${existingBooking.date} at ${existingBooking.time} kept as pending (not within 1-hour window)`);
      }

      return existingBooking;
    } finally {
      // Always remove the booking from the processing set when done
      processingBookings.delete(bookingId);
    }
  } catch (error) {
    console.error('Error handling late registration:', error);
    
    // Make sure to remove the booking from the processing set even if an error occurs
    if (booking && booking._id) {
      processingBookings.delete(booking._id.toString());
    }
    
    return booking;
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

        // Get the station name from the key
        const stationName = key.split('|')[0];
        const date = key.split('|')[1];
        const time = key.split('|')[2];
        
        // Get station details to determine actual capacity
        let capacity = 1; // Default fallback changed to 1
        try {
          const stationDetails = await Station.findOne({ 
            "Station Name": { $regex: new RegExp(`^${stationName.trim()}\\s*$`, 'i') }
          });
          if (stationDetails && stationDetails["Duplicate Count"]) {
            capacity = Math.max(1, parseInt(stationDetails["Duplicate Count"]) || 1);
          } else {
            console.warn(`⚠️ No capacity found for ${stationName}, using default: ${capacity}`);
          }
        } catch (error) {
          console.error(`Error getting capacity for station ${stationName}:`, error);
        }
        
        // IMPORTANT: Check for existing approved bookings
        const existingApproved = await Booking.countDocuments({
          station: stationName,
          date: date,
          time: time,
          status: 'approved'
        });
        
        console.log(`📊 Found ${existingApproved} existing approved bookings for this time slot`);
        
        // Calculate remaining slots
        const remainingSlots = Math.max(0, capacity - existingApproved);
        console.log(`🔢 Station has ${remainingSlots} remaining slots out of ${capacity} total capacity`);

        // Sort bookings by priority - using a more comprehensive priority calculation
        const bookingsWithPriority = await Promise.all(bookings.map(async booking => {
          const createdAt = new Date(booking.createdAt);
          const now = new Date();
          const waitingHours = (now - createdAt) / (1000 * 60 * 60);
          const processingTime = booking.estimatedChargeTime || 30;
          const deadlineTime = 60;
          const laxity = Math.max(1, deadlineTime - processingTime);
          
          // Get user's laxity bonus from their profile
          let userLaxityBonus = 0;
          try {
            const user = await User.findOne({ email: booking.user });
            if (user) {
              userLaxityBonus = user.laxity || 0;
            }
          } catch (error) {
            console.error(`Error fetching user laxity for ${booking.user}:`, error);
          }

          const priorityScore = (
            laxity -
            (waitingHours * 2) -
            ((100 - (booking.currentBattery || 50)) / 10) -
            userLaxityBonus
          );

          return {
            ...booking.toObject(),
            priorityScore,
            waitingHours,
            userLaxityBonus
          };
        }));
        
        // Sort by priority score (lower is better)
        bookingsWithPriority.sort((a, b) => a.priorityScore - b.priorityScore);
        
        // Log the sorted bookings
        console.log("📋 Prioritized bookings:");
        bookingsWithPriority.forEach((booking, idx) => {
          console.log(`${idx + 1}. User: ${booking.user}, Priority: ${booking.priorityScore.toFixed(2)}, Battery: ${booking.currentBattery || 'N/A'}, Waiting: ${booking.waitingHours.toFixed(1)}h, User Laxity Bonus: ${booking.userLaxityBonus}`);
        });

        // Take top N bookings based on remaining capacity
        const approved = bookingsWithPriority.slice(0, remainingSlots);
        const rejected = bookingsWithPriority.slice(remainingSlots);
        
        console.log(`✅ Approving ${approved.length} bookings, ❌ Rejecting ${rejected.length} bookings`);

        // Update status and send emails for approved bookings
        for (const booking of approved) {
          const bookingId = booking._id.toString();
          
          // Skip if already processed
          if (processedBookings.has(bookingId)) continue;
          processedBookings.add(bookingId);
          
          const dbBooking = await Booking.findById(booking._id);
          if (dbBooking && dbBooking.status === 'pending') {
            dbBooking.status = 'approved';
            dbBooking.approvalDate = new Date();
            await dbBooking.save();
            
            // Reset user's laxity bonus when booking is approved
            try {
              await User.findOneAndUpdate(
                { email: dbBooking.user },
                { laxity: 0 },
                { new: true }
              );
              console.log(`🔄 Reset laxity bonus for manually approved user ${dbBooking.user}`);
            } catch (error) {
              console.error(`❌ Failed to reset laxity for user ${dbBooking.user}:`, error);
            }
            
            try {
              await sendApprovalEmail(dbBooking);
              console.log(`📧 Manual approval email sent to ${dbBooking.user}`);
            } catch (error) {
              console.error(`❌ Failed to send manual approval email to ${dbBooking.user}:`, error);
            }
          }
        }

        // Update status and send emails for rejected bookings
        for (const booking of rejected) {
          const bookingId = booking._id.toString();
          
          // Skip if already processed
          if (processedBookings.has(bookingId)) continue;
          processedBookings.add(bookingId);
          
          const dbBooking = await Booking.findById(booking._id);
          if (dbBooking && dbBooking.status === 'pending') {
            try {
              await sendRejectionEmail(dbBooking.user, dbBooking.station, dbBooking.date, dbBooking.time, 'Station capacity exceeded - manual check');
              await Booking.findByIdAndDelete(dbBooking._id);
              console.log(`🗑️ Manual rejection: Deleted booking ${dbBooking._id} for user ${dbBooking.user}`);
            } catch (error) {
              console.error(`❌ Failed to process manual rejection for ${dbBooking.user}:`, error);
            }
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

// Add automatic overbooking check and fix function
const fixOverbookedSlots = async () => {
  console.log('🔎 Checking for overbooked time slots...');
  
  try {
    // Find all approved bookings and group them by station, date, and time
    const approvedBookings = await Booking.find({ status: 'approved' });
    
    // Group bookings by station, date, and time
    const bookingGroups = {};
    
    for (const booking of approvedBookings) {
      const groupKey = `${booking.station}|${booking.date}|${booking.time}`;
      
      if (!bookingGroups[groupKey]) {
        bookingGroups[groupKey] = [];
      }
      
      bookingGroups[groupKey].push(booking);
    }
    
    console.log(`Found ${Object.keys(bookingGroups).length} unique time slots with approved bookings`);
    
    // Process each group to check for overbookings
    let fixedCount = 0;
    
    for (const [key, bookings] of Object.entries(bookingGroups)) {
      // Get the station name from the key
      const [stationName, date, time] = key.split('|');
      
      // Get station capacity
      let capacity = 1; // Default fallback changed to 1
      try {
        const stationDetails = await Station.findOne({ 
          "Station Name": { $regex: new RegExp(`^${stationName.trim()}\\s*$`, 'i') }
        });
        if (stationDetails && stationDetails["Duplicate Count"]) {
          capacity = Math.max(1, parseInt(stationDetails["Duplicate Count"]) || 1);
        }
      } catch (error) {
        console.error(`Error getting capacity for station ${stationName}:`, error);
      }
      
      // Check if this time slot is overbooked
      if (bookings.length > capacity) {
        console.log(`⚠️ Found overbooked slot: ${key} with ${bookings.length} bookings for capacity ${capacity}`);
        fixedCount++;
        
        // Calculate a priority score for each booking
        const bookingsWithPriority = bookings.map(booking => {
          const createdAt = new Date(booking.createdAt);
          const now = new Date();
          const waitingHours = (now - createdAt) / (1000 * 60 * 60);
          const processingTime = booking.estimatedChargeTime || 30;
          const deadlineTime = 60;
          const laxity = Math.max(1, deadlineTime - processingTime);
          const rejectionAgingBonus = getAgingBonus(booking.user, booking.station);

          const priorityScore = (
            laxity -
            (waitingHours * 2) -
            ((100 - (booking.currentBattery || 50)) / 10) -
            rejectionAgingBonus
          );

          return {
            ...booking.toObject(),
            priorityScore
          };
        });
        
        // Sort by priority score (lower is better)
        bookingsWithPriority.sort((a, b) => a.priorityScore - b.priorityScore);
        
        // Keep only the first 'capacity' bookings as approved
        const keptBookings = bookingsWithPriority.slice(0, capacity);
        const rejectedBookings = bookingsWithPriority.slice(capacity);
        
        // Reject the extra bookings
        for (const b of rejectedBookings) {
          try {
            await sendRejectionEmail(b.user, b.station, b.date, b.time, 'Overbooking correction - station capacity exceeded');
            await Booking.findByIdAndDelete(b._id);
            console.log(`🗑️ Overbooking fix: Deleted booking ${b._id} for user ${b.user}`);
          } catch (error) {
            console.error(`❌ Failed to fix overbooking for booking ${b._id}:`, error);
          }
        }
      }
    }
    
    if (fixedCount > 0) {
      console.log(`✅ Fixed ${fixedCount} overbooked time slots`);
    } else {
      console.log(`✅ No overbooked time slots found`);
    }
    
    return fixedCount;
    
  } catch (error) {
    console.error('❌ Error fixing overbooked slots:', error);
    return 0;
  }
};

// New function to remove rejected bookings from the database
const cleanupRejectedBookings = async () => {
  try {
    // Find and count all rejected bookings
    const rejectedCount = await Booking.countDocuments({ status: 'rejected' });
    
    if (rejectedCount > 0) {
      console.log(`🧹 Found ${rejectedCount} rejected bookings to clean up`);
      
      // Delete all rejected bookings
      const result = await Booking.deleteMany({ status: 'rejected' });
      console.log(`🗑️ Removed ${result.deletedCount} rejected bookings from database`);
    } else {
      console.log('✅ No rejected bookings to clean up');
    }
  } catch (error) {
    console.error('❌ Error cleaning up rejected bookings:', error);
  }
};

// Add a function to clean up processed bookings to prevent memory leaks
const cleanupProcessedBookings = () => {
  // Clear all processed bookings periodically to prevent memory leaks
  // This is safe because once a booking is processed (approved/rejected), it won't be pending anymore
  const cleanedCount = processedBookings.size;
  processedBookings.clear();
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} processed booking IDs from memory`);
  }
};

// Add a function to get user laxity for API access
const getUserLaxity = async (userEmail) => {
  try {
    const user = await User.findOne({ email: userEmail });
    return user ? user.laxity || 0 : 0;
  } catch (error) {
    console.error(`Error fetching user laxity for ${userEmail}:`, error);
    return 0;
  }
};

// Add a function to clean up old rejection history entries
const cleanupOldRejectionHistory = () => {
  const now = new Date();
  let cleanedCount = 0;
  let stationEntriesRemoved = 0;
  
  userRejectionHistory.forEach((history, userEmail) => {
    let shouldRemoveUser = true;
    let stationsToRemove = [];
    
    // Check each station entry
    Object.keys(history.stations).forEach(station => {
      const stationHistory = history.stations[station];
      const daysSinceLastRejection = (now - stationHistory.lastRejection) / (1000 * 60 * 60 * 24);
      
      // Remove station entries older than 7 days
      if (daysSinceLastRejection > 7) {
        stationsToRemove.push(station);
        stationEntriesRemoved++;
      } else {
        shouldRemoveUser = false;
      }
    });
    
    // Remove old station entries
    stationsToRemove.forEach(station => {
      delete history.stations[station];
    });
    
    // If all station entries were removed, remove the user entry
    if (shouldRemoveUser && Object.keys(history.stations).length === 0) {
      userRejectionHistory.delete(userEmail);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0 || stationEntriesRemoved > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} users and ${stationEntriesRemoved} station entries from rejection history`);
  }
};

// Schedule the job to run every minute
const startScheduler = () => {
  // Run the cron job every 30 seconds for better timing precision
  cron.schedule('*/30 * * * * *', () => {
    const now = new Date();
    console.log(`Running booking approval process at ${now.toISOString()}`);
    
    // First check and fix any overbooking issues
    fixOverbookedSlots().then(() => {
      // Then process pending appointments
      processAppointments().then(() => {
        // Clean up rejected bookings
        cleanupRejectedBookings();
      });
    });
  });

  // Also run manual check at startup to catch any missed bookings
  fixOverbookedSlots().then(() => {
    manualCheckAllPendingAppointments().then(() => {
      cleanupRejectedBookings();
    });
  });

  // Run manual check every hour as a backup
  cron.schedule('0 * * * *', () => {
    console.log('Running hourly manual check');
    
    // First check and fix any overbooking issues
    fixOverbookedSlots().then(() => {
      manualCheckAllPendingAppointments().then(() => {
        cleanupRejectedBookings();
      });
    });
  });

  // Clean up processed bookings every hour
  cron.schedule('0 * * * *', cleanupProcessedBookings);
  
  // Run rejection history cleanup daily
  cron.schedule('0 0 * * *', cleanupOldRejectionHistory);

  console.log('Booking scheduler started - running every 30 seconds to ensure accurate scheduling!');
};

module.exports = {
  startScheduler,
  handleLateRegistration,
  manualCheckAllPendingAppointments,
  fixOverbookedSlots,
  cleanupRejectedBookings,
  processAppointments,
  getUserLaxity
};
