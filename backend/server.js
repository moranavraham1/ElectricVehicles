const mongoose = require('./db'); 
const cors = require('cors');
const authRoutes = require('./authRoutes');
const osmRoutes = require('./osmRoutes'); // Add this line
const stationsRoutes = require('./routes/stations'); // Import stations routes
require('dotenv').config();
const express = require('express');
const authMiddleware = require('./authMiddleware'); // middleware לאימות
const app = express();
const router = express.Router();
const appointmentRoutes = require('./routes/appointmentRoutes');


app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRoutes);
app.use('/api/osm', osmRoutes); // Add OSM routes
app.use('/api/stations', stationsRoutes); // Mount /api/stations route

app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


