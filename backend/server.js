const mongoose = require('./db');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const authRoutes = require('./authRoutes');
const osmRoutes = require('./osmRoutes');
const stationsRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const appointmentRoutes = require('./appointmentRoutes');
const { startScheduler } = require('./appointmentScheduler');

const express = require('express');
const authMiddleware = require('./authMiddleware');
const app = express();

const router = express.Router();

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

