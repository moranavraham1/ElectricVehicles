
const express = require('express');
const { register, login, logout } = require('./authController');
const router = express.Router();

router.post('/register', register); // הרשמה
router.post('/login', login);       // התחברות
router.post('/logout', logout);     // התנתקות

module.exports = router;
