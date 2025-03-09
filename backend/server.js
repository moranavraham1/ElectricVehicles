const mongoose = require('./db');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const osmRoutes = require('./osmRoutes');
const stationsRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');
require('dotenv').config();
const express = require('express');
const authMiddleware = require('./authMiddleware');
const app = express();
<<<<<<< HEAD
const dotenv = require('dotenv');
=======
const router = express.Router();
const appointmentRoutes = require('./routes/appointmentRoutes');

>>>>>>> 419312ab (View appointments in your personal area and send an email about appointments, cancellations, and appointment updates.)

dotenv.config();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRoutes);
<<<<<<< HEAD
app.use('/api/osm', osmRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
=======
app.use('/api/osm', osmRoutes); // Add OSM routes
app.use('/api/stations', stationsRoutes); // Mount /api/stations route

app.use('/api/appointments', appointmentRoutes);
>>>>>>> 419312ab (View appointments in your personal area and send an email about appointments, cancellations, and appointment updates.)

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
