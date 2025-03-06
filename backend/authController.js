const User = require('./User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

    // Send verification code
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}`,
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

    // Send the new verification code via email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your New Verification Code',
      text: `Your new verification code is: ${newVerificationCode}`,
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
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
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
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Changed Successfully",
      text: "Your password has been successfully changed.",
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
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Error updating details' });
  }
};
