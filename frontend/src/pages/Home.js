import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Home.css';

function Home() {
  const [stations, setStations] = useState([]); // All stations from the API
  const [filteredStations, setFilteredStations] = useState([]); // Filtered stations for display
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [suggestions, setSuggestions] = useState([]); // City suggestions
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch stations from the backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/stations'); // Fetch stations from backend
        setStations(response.data); // Store stations in state
        setFilteredStations(response.data); // Display all stations initially
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Failed to fetch charging stations. Please try again later.');
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Handle search input changes
  const handleSearch = (query) => {
    setSearchQuery(query);

    // Generate city suggestions
    const matches = stations
      .map((station) => station.City)
      .filter((city, index, array) => array.indexOf(city) === index) // Remove duplicates
      .filter((city) => city.toLowerCase().includes(query.toLowerCase()));

    setSuggestions(matches);

    // Filter stations based on city or address
    const filtered = stations.filter(
      (station) =>
        station.City.toLowerCase().includes(query.toLowerCase()) ||
        station.Address.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStations(filtered);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    const filtered = stations.filter(
      (station) => station.City === suggestion || station.Address.includes(suggestion)
    );
    setFilteredStations(filtered);
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
            placeholder="Search city or address..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-bar"
          />
          <Link to="/map" className="map-button">Search on Map</Link>
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
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
        <a
          href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          className="navigate-to-station"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Waze_logo.svg"
            alt="Navigate with Waze"
            className="waze-icon"
          />
          Navigate to Station
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
