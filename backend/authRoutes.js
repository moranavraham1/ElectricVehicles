const express = require('express');
const router = express.Router();

const authController = require('./authController');
const authMiddleware = require('./authMiddleware');

// נתיב מוגן - אזור אישי

router.get('/personal-area', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Welcome to your personal area', user: req.user });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verify-code', authController.verifyCode);
router.post('/resend-verification-code', authController.resendVerificationCode);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post("/change-password", authController.changePassword);
router.post('/check-email', authController.checkEmail);
router.post('/delete-account', authMiddleware, authController.deleteAccount);

router.get('/fetch-details', authController.fetchDetails);
router.put('/update-details', authMiddleware, authController.updateDetails);

module.exports = router;
