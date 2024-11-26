const express = require('express');
const router = express.Router();
const authController = require('./authController'); // Assuming you've saved the previous file as authController.js

// POST route for registration
router.post('/register', authController.register);

// GET route to check register route status
router.get('/register', authController.registerStatus);

// Other authentication routes...
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
