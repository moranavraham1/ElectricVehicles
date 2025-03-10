const mongoose = require('./db');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const osmRoutes = require('./osmRoutes'); 
const stationsRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings'); // ✅ הוספת נתיב הזמנות
require('dotenv').config();
const express = require('express');
const authMiddleware = require('./authMiddleware'); 
const app = express();
const dotenv = require('dotenv');

dotenv.config();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ הוספת ניהול נתיבים
app.use('/api/auth', authRoutes);
app.use('/api/osm', osmRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes); // ✅ הוספת ניהול הזמנות

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
