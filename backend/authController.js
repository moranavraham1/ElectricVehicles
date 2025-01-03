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

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
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
// Display Reset Password Page
exports.resetPasswordPage = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // בודק שהתוקף לא פג
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    res.status(200).json({ message: 'Token is valid. Please set your new password.' });
  } catch (error) {
    console.error('Error in resetPasswordPage:', error);
    res.status(500).json({ message: 'Error validating password reset token.' });
  }
};




// Reset Password Endpoint
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Validate that password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Validate password strength
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters, include one uppercase letter, and one number.',
      });
    }

    // Ensure the new password is not the same as the old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Send success email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset Successful',
      text: 'Your password has been successfully reset. You can now log in with your new password.',
    });

    res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};
