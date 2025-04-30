// Script to manually process pending appointments
require('dotenv').config();
const mongoose = require('mongoose');
const { manualCheckAllPendingAppointments } = require('./appointmentScheduler');
require('./models/Appointment');

async function main() {
  console.log('🚀 Starting manual appointment processing script');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/electricVehicles');
    console.log('Connected to MongoDB');
    
    // Run the manual processing
    console.log('Processing appointments...');
    const result = await manualCheckAllPendingAppointments();
    
    console.log('Processing completed:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error); 