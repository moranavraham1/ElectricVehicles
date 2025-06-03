const User = require('./User');
const jwt = require('jsonwebtoken');
const Booking = require('./models/Booking');
const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');

// Configure nodemailer
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

// עדכון הגדרות השליחה להוספת שם החברה
const mailOptions = {
  from: '"EVISION" <' + process.env.EMAIL + '>',
  priority: 'high'        // סימון עדיפות גבוהה למייל
};

// פונקציה אסינכרונית לשליחת מייל ללא המתנה לתשובה
const sendEmailAsync = async (options) => {
  try {
    // שליחת המייל בלי להמתין לתוצאה (נשלח ברקע)
    transporter.sendMail({
      ...mailOptions,
      ...options
    }).catch(err => console.error('Error sending email:', err));

    return true;
  } catch (error) {
    console.error('Error preparing email:', error);
    return false;
  }
};

// Registration Endpoint
exports.register = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters, include one uppercase letter, and one number.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      verificationCode,
      verified: false, // Ensure verified defaults to false
    });

    await user.save();

    // שלח את המייל ברקע ללא המתנה
    sendEmailAsync({
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0c0e21, #1c294a); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 10px;">Welcome to EVISION</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3B82F6, #0EA5E9); margin: 0 auto;"></div>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; color: #1E293B;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">Thank you for registering. Please use the verification code below to complete your registration:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #1E293B;">${verificationCode}</div>
            </div>
            <p style="margin-bottom: 20px; color: #475569; font-size: 14px;">This code will expire in 1 hour. If you didn't request this verification, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
            <p>© ${new Date().getFullYear()} EVISION. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    // Ensure proper success response
    res.status(201).json({ message: 'User registered successfully. Please verify your email.', email });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Error registering user. Please try again later.' });
  }
};


// Verify Code Endpoint
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.verified = true;
    user.verificationCode = null; // Clear the code
    await user.save();

    res.status(200).json({ message: 'Verification successful. You can now log in.' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Error verifying code. Please try again later.' });
  }
};

// Check Registration Status
exports.registerStatus = (req, res) => {
  res.status(200).json({
    message: 'Register route is up and running',
    status: 'active',
  });
};

// Login Endpoint
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if the user's email is verified
    if (!user.verified) {
      return res.status(403).json({ message: 'Your email is not verified. Please verify your email to log in.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email }, // הוספת המייל
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );


    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error logging in. Please try again later.' });
  }
};

// Logout Endpoint
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// Resend Verification Code Endpoint
exports.resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'This email is already verified.' });
    }

    // Generate a new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newVerificationCode;
    await user.save();

    // שלח את המייל ברקע ללא המתנה
    sendEmailAsync({
      to: email,
      subject: 'Your New Verification Code',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0c0e21, #1c294a); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 10px;">EVISION</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3B82F6, #0EA5E9); margin: 0 auto;"></div>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; color: #1E293B;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 20px;">New Verification Code</h2>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">You requested a new verification code. Please use the code below to verify your email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #1E293B;">${newVerificationCode}</div>
            </div>
            <p style="margin-bottom: 20px; color: #475569; font-size: 14px;">This code will expire in 1 hour. If you didn't request this verification, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
            <p>© ${new Date().getFullYear()} EVISION. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: 'Verification code resent successfully.' });
  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ message: 'Error resending verification code.' });
  }
};
// Forgot Password Endpoint
const crypto = require('crypto'); // נשתמש ליצירת טוקן ייחודי

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // יצירת טוקן לאיפוס סיסמה
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // שעה תוקף

    await user.save();

    // שליחת המייל עם הקישור
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0c0e21, #1c294a); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 10px;">EVISION</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3B82F6, #0EA5E9); margin: 0 auto;"></div>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; color: #1E293B;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">You requested to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #1E293B, #334155); color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
            </div>
            <p style="margin-bottom: 10px; color: #475569; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="margin-bottom: 20px; color: #3B82F6; font-size: 14px; word-break: break-all;">${resetUrl}</p>
            <p style="margin-bottom: 0; color: #475569; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
            <p>© ${new Date().getFullYear()} EVISION. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Error sending password reset email.' });
  }
};
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ בדיקה אם הסיסמה הנוכחית נכונה
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // ✅ בדיקת חוזק הסיסמה החדשה
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, include one uppercase letter, and one number.",
      });
    }

    // ✅ הצפנת הסיסמה החדשה ושמירתה במסד הנתונים
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // ✅ שליחת מייל למשתמש על שינוי סיסמה
    await transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: "Password Changed Successfully",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0c0e21, #1c294a); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 10px;">EVISION</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3B82F6, #0EA5E9); margin: 0 auto;"></div>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; color: #1E293B;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 20px;">Password Changed Successfully</h2>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">Your password has been successfully changed.</p>
            <p style="margin-bottom: 20px; color: #475569; font-size: 14px;">If you did not make this change, please contact our support team immediately.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
            <p>© ${new Date().getFullYear()} EVISION. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "Password has been successfully changed." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password." });
  }
};





exports.fetchDetails = async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  try {
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // חיפוש המשתמש לפי ה-ID מתוך הטוקן
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      verified: user.verified,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details.' });
  }
};

exports.updateDetails = async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const token = req.header('Authorization')?.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    await user.save();
    await transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: "Profile Updated",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0c0e21, #1c294a); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 10px;">EVISION</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3B82F6, #0EA5E9); margin: 0 auto;"></div>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; color: #1E293B;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 20px;">Profile Updated Successfully</h2>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">Hello ${user.firstName},</p>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">Your profile has been updated successfully.</p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1E293B; font-size: 18px; margin-bottom: 15px;">Updated Details:</h3>
              <p style="margin-bottom: 10px; color: #475569;"><strong>First Name:</strong> ${user.firstName}</p>
              <p style="margin-bottom: 10px; color: #475569;"><strong>Last Name:</strong> ${user.lastName}</p>
              <p style="margin-bottom: 0; color: #475569;"><strong>Phone:</strong> ${user.phone}</p>
            </div>
            <p style="margin-bottom: 0; color: #475569; font-size: 14px;">If you didn't make this change, please contact our support team immediately.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
            <p>© ${new Date().getFullYear()} EVISION. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Error updating details' });
  }

};
exports.createBooking = async (req, res) => {
  try {
    const { station, date, time } = req.body;
    const userId = req.user.id;


    const existingBooking = await Booking.findOne({ station, date, time });
    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }


    const newBooking = new Booking({
      user: userId,
      station,
      date,
      time,
    });

    await newBooking.save();


    const user = await User.findById(userId);


    await transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: 'Appointment Confirmation',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0c0e21, #1c294a); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 10px;">EVISION</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3B82F6, #0EA5E9); margin: 0 auto;"></div>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; color: #1E293B;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 20px;">Appointment Confirmed</h2>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">Hello ${user.firstName},</p>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">Your charging appointment has been confirmed.</p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1E293B; font-size: 18px; margin-bottom: 15px;">Appointment Details:</h3>
              <p style="margin-bottom: 10px; color: #475569;"><strong>Station:</strong> ${station}</p>
              <p style="margin-bottom: 10px; color: #475569;"><strong>Date:</strong> ${date}</p>
              <p style="margin-bottom: 0; color: #475569;"><strong>Time:</strong> ${time}</p>
            </div>
            <p style="margin-bottom: 0; color: #475569; font-size: 14px;">Thank you for choosing EVISION for your charging needs.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
            <p>© ${new Date().getFullYear()} EVISION. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.status(201).json({ message: 'Booking confirmed and email sent.', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking.' });
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    await Booking.deleteOne({ _id: bookingId });

    const user = await User.findById(userId);


    await transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: 'Appointment Cancelled',
      text: `Hello ${user.firstName},\n\nYour appointment for ${booking.station} on ${booking.date} at ${booking.time} has been cancelled.\n\nIf this was a mistake, please rebook your appointment.`,
    });

    res.status(200).json({ message: 'Booking cancelled and email sent.' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking.' });
  }
};
const sendUpcomingBookingReminder = async () => {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const oneHourLater = new Date(now);
    oneHourLater.setHours(oneHourLater.getHours() + 1);


    const upcomingBookings = await Booking.find({
      date: now.toISOString().split('T')[0],
      time: oneHourLater.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }).populate('user');


    for (const booking of upcomingBookings) {
      await transporter.sendMail({
        ...mailOptions,
        to: booking.user.email,
        subject: 'Reminder: Your Appointment is in One Hour',
        text: `Hello ${booking.user.firstName},\n\nThis is a reminder that your appointment at ${booking.station} is in one hour.\n\nDate: ${booking.date}\nTime: ${booking.time}\n\nPlease be on time.`,
      });
    }

    console.log(`✅ Sent ${upcomingBookings.length} reminders`);
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
};
// Add to likedBy
exports.likeStation = async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    const station = await Station.findById(id);
    if (!station) return res.status(404).json({ message: "Station not found" });

    if (!station.likedBy.includes(user)) {
      station.likedBy.push(user);
      await station.save();
    }

    res.status(200).json({ message: "Station liked" });
  } catch (error) {
    console.error("Error liking station:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove from likedBy
exports.unlikeStation = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const station = await Station.findById(id);
    if (!station) return res.status(404).json({ message: "Station not found" });

    station.likedBy = station.likedBy.filter((u) => u !== email);
    await station.save();

    res.status(200).json({ message: "Station unliked" });
  } catch (error) {
    console.error("Error unliking station:", error);
    res.status(500).json({ message: "Server error" });
  }
};


setInterval(sendUpcomingBookingReminder, 30 * 60 * 1000);

// פונקציה לבדיקת תקפות של טוקן לאיפוס סיסמה
exports.verifyResetToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required.' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    res.status(200).json({ message: 'Token is valid.' });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ message: 'Error verifying reset token.' });
  }
};

// פונקציה לאיפוס סיסמה באמצעות טוקן
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  // בדיקת תקינות הסיסמה
  if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters, include one uppercase letter, and one number.'
    });
  }

  try {
    // מציאת המשתמש עם הטוקן התקף
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // הצפנת הסיסמה החדשה
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // עדכון הסיסמה וניקוי שדות טוקן האיפוס
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // שליחת מייל עדכון למשתמש
    sendEmailAsync({
      to: user.email,
      subject: 'Your Password Has Been Reset',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0c0e21, #1c294a); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 10px;">EVISION</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3B82F6, #0EA5E9); margin: 0 auto;"></div>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; color: #1E293B;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 20px;">Password Reset Successful</h2>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">Your password has been successfully reset. You can now log in with your new password.</p>
            <p style="margin-bottom: 20px; color: #475569; font-size: 16px;">If you did not request this change, please contact our support team immediately.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px;">
            <p>© ${new Date().getFullYear()} EVISION. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};

// Check Email Existence
exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking email existence:', error);
    res.status(500).json({ message: 'Error checking email existence' });
  }
};


