require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const Station = require('./Station');

// Get MongoDB URI from the environment variable
const MONGO_URI = process.env.MONGO_URI;

// Station data
const stationData = [
    {
        "Station Name": "G Tzamerat | Nissim Aloni 10 | Tel Aviv-Yafo",
        "Address": "Nissim Aloni 10",
        "City": "תל אביב יפו",
        "Latitude": 32.089065,
        "Longitude": 34.797274,
        "Operator": "EvEdge",
    },
    {
        "Station Name": "G Tzamerat | Nissim Aloni 10 | Tel Aviv-Yafo",
        "Address": "Nissim Aloni 10",
        "City": "תל אביב יפו",
        "Latitude": 32.089065,
        "Longitude": 34.797274,
        "Operator": "EvEdge",
    },
    {
        "Station Name": "Derech Yitshak Rabin 11 | Beit Shemesh",
        "Address": "Derech Yitzhak Rabin 11",
        "City": "בית שמש",
        "Latitude": 31.747551,
        "Longitude": 34.993779,
        "Operator": "EvEdge",
    },
    {
        "Station Name": "Derech Yitshak Rabin 11 | Beit Shemesh",
        "Address": "Derech Yitzhak Rabin 11",
        "City": "בית שמש",
        "Latitude": 31.747551,
        "Longitude": 34.993779,
        "Operator": "EvEdge",
    },
    {
        "Station Name": "Community Center | Derech Yitshak Rabin 21 | Beit Shemesh",
        "Address": "Derech Yitzhak Rabin 21",
        "City": "בית שמש",
        "Latitude": 31.74437,
        "Longitude": 34.993723,
        "Operator": "EvEdge",
    }
];

// Main function to insert data
async function insertData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Insert data
        const result = await Station.insertMany(stationData);
        console.log(`${result.length} stations inserted successfully`);

    } catch (error) {
        console.error('Error inserting data:', error.message);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Execute the script
insertData();
