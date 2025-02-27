const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authMiddleware = require('./authMiddleware'); // Import the middleware

// נתיב מוגן - אזור אישי
router.get('/personal-area', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Welcome to your personal area', user: req.user });
});

// שאר הנתיבים...
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verify-code', authController.verifyCode);
router.post('/resend-verification-code', authController.resendVerificationCode);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.resetPasswordPage);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
