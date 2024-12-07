const express = require('express');
const router = express.Router();
const authController = require('./authController'); 


// POST route for registration
router.post('/register', authController.register);

// GET route to check register route status
router.get('/register', authController.registerStatus);

// Other authentication routes...
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.post('/verify-code', authController.verifyCode);
router.post('/resend-verification-code',authController.resendVerificationCode);



module.exports = router;
