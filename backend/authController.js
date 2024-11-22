const User = require('./User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// הרשמה
exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;

    console.log(fullName)


    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password))
        return res.status(400).json({ message: 'Password does not meet requirements' });

    try {
        const user = new User({ fullName, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// התחברות
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// התנתקות
exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};
