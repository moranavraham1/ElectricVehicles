const User = require('./User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// הרשמה
exports.register = async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    // בדיקת פורמט של מספר טלפון
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // בדיקת פורמט סיסמה
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
        return res.status(400).json({ message: 'Password does not meet requirements' });
    }

    try {
        // בדיקה אם המשתמש כבר קיים לפי כתובת מייל
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // יצירת משתמש חדש
        const hashedPassword = await bcrypt.hash(password, 10); // הצפנת הסיסמה
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// בדיקה של סטטוס הרישום
exports.registerStatus = (req, res) => {
    res.status(200).json({
        message: 'Register route is up and running',
        status: 'active',
    });
};

// התחברות
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // בדיקה אם המשתמש קיים לפי כתובת מייל
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // בדיקה אם הסיסמה תואמת
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // יצירת טוקן JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// התנתקות
exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};