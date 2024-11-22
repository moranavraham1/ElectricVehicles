const express = require('express');
const mongoose = require('./db'); 
const authRoutes = require('./authRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up' });
  });
const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
