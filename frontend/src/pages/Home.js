import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WazeLogo from '../assets/WAZE.jpg'; // Import the image
import '../Home.css';

function Home() {
  const [stations, setStations] = useState([]); // All stations from the API
  const [filteredStations, setFilteredStations] = useState([]); // Filtered stations for display
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [distance, setDistance] = useState(1); // Default to 1km distance
  const [userLocation, setUserLocation] = useState(null); // User's location

  // Fetch stations from the backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/stations'); // Fetch stations from backend
        setStations(response.data); // Store stations in state
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Failed to fetch charging stations. Please try again later.');
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Get user location (using geolocation API)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }, (err) => {
        setError('Could not get user location. Please enable location services.');
      });
    }
  }, []);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Filter and sort stations by distance from user's location
  useEffect(() => {
    if (userLocation && userLocation.latitude !== 0 && userLocation.longitude !== 0) {
      const filteredStations = stations
        .map(station => {
          const distanceToStation = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            station.Latitude,
            station.Longitude
          );
          return { ...station, distance: distanceToStation };
        })
        .filter(station => station.distance <= distance) // Filter stations within the set distance
        .sort((a, b) => a.distance - b.distance); // Sort stations by distance (ascending order)

      setFilteredStations(filteredStations);
    }
  }, [stations, userLocation, distance]);

  // Handle search input changes
  const handleSearch = (query) => {
    setSearchQuery(query);

    // Filter stations based on city, address, or station name
    const filtered = stations.filter(
      (station) =>
        station.City.toLowerCase().includes(query.toLowerCase()) ||
        station.Address.toLowerCase().includes(query.toLowerCase()) ||
        station['Station Name'].toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStations(filtered);
  };

  // Handle distance slider change
  const handleDistanceChange = (event) => {
    const newDistance = event.target.value;
    setDistance(newDistance);
  };

  // Render loading, error, or station list
  if (loading) return <div className="loading-message">Loading charging stations...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-container">
      <div className="main-content">
        <h2 className="search-title">Search Charging Stations</h2>

        {/* Search bar */}
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search city, address, or station name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-bar"
          />
          <Link to="/map" className="map-button">Search on Map</Link>
        </div>

        {/* Distance slider */}
        <div className="distance-slider">
          <label>Max Distance: {distance} km</label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={distance}
            onChange={handleDistanceChange}
            className="slider"
          />
        </div>

        {/* Station list */}
        <div className="station-list">
          {filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <div key={station._id} className="station-card">
                <h3 className="station-name">{station['Station Name']}</h3>
                <p className="station-address">{station.Address}</p>
                <p className="station-city">{station.City}</p>
                <p className="station-duplicate-count">Charging stations: {station['Duplicate Count']}</p>

                {/* Waze logo and navigate button */}
                <a
                  href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigate-to-station"
                >
                  <span className="navigate-text">Navigate to Station</span>
                  <img
                    src={WazeLogo} // Use the uploaded Waze image
                    alt="Navigate with Waze"
                    className="waze-icon"
                  />
                </a>
              </div>
            ))
          ) : (
            <p className="no-stations-message">No charging stations found.</p>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="bottom-bar">
          <Link to="/favorites" className="bottom-bar-button">Favorites</Link>
          <Link to="/personal-area" className="bottom-bar-button">Personal Area</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
