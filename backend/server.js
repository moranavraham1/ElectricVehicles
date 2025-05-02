const mongoose = require('./db');
const cors = require('cors');

const authRoutes = require('./authRoutes');
const osmRoutes = require('./osmRoutes');
const stationsRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');

const paymentRoutes = require('./routes/payments');
const appointmentRoutes = require('./appointmentRoutes');
const { startScheduler } = require('./appointmentScheduler');

require('dotenv').config();
const express = require('express');
const authMiddleware = require('./authMiddleware');
const app = express();

const dotenv = require('dotenv');

const router = express.Router();



dotenv.config();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use('/api/auth', authRoutes);

app.use('/api/osm', osmRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/appointments', appointmentRoutes);


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

// Start the appointment scheduler
startScheduler();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

