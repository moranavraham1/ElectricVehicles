const express = require('express');
const mongoose = require('./db'); 
const cors = require('cors');
const authRoutes = require('./authRoutes');
const osmRoutes = require('./osmRoutes'); // Add this line
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRoutes);
app.use('/api/osm', osmRoutes); // Add OSM routes

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));