import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WazeLogo from '../assets/WAZE.jpg';
import '../Home.css';

function Home() {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeButton, setActiveButton] = useState(''); 

  const navigate = useNavigate();

  // Fetch stations from the backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/stations');
        setStations(response.data);
        setFilteredStations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Failed to fetch charging stations. Please try again later.');
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Search stations
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredStations(stations);
      return;
    }

    const filtered = stations.filter((station) => {
      const lowerQuery = query.toLowerCase();
      return (
        station['Station Name'].toLowerCase().includes(lowerQuery) ||
        station.Address.toLowerCase().includes(lowerQuery) ||
        station.City.toLowerCase().includes(lowerQuery)
      );
    });

    setFilteredStations(filtered);
  };

  if (loading) return <div className="loading-message">Loading charging stations...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-container">
      {/* Search Bar */}
      <div className="main-content">
        <h2 className="search-title">Search Charging Stations</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search city, address, or station name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-bar"
          />
        </div>
      </div>

      {/* Station List */}
      <div className="station-list">
        {filteredStations.length > 0 ? (
          filteredStations.map((station) => (
            <div key={station._id} className="station-card">
  <div className="station-details">
  <h3 className="station-name">{station['Station Name']}</h3>

    <p><strong>Address:</strong> {station.Address}</p>
    <p><strong>City:</strong> {station.City}</p>
    <p><strong>Charging stations:</strong> {station['Duplicate Count']}</p>
    <a
      href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
      target="_blank"
      rel="noopener noreferrer"
      className="navigate-to-station"
    >
      <img src={WazeLogo} alt="Waze" />
      <span>Navigate to Station</span>
    </a>
  </div>
</div>

          ))
        ) : (
          <p>No charging stations match your search criteria.</p>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-bar">
        <button
          onClick={() => navigate('/logout')}
          className={`bottom-bar-button logout ${activeButton === 'logout' ? 'active' : ''}`}
          onClickCapture={() => setActiveButton('logout')}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>

        <Link
          to="/favorites"
          className={`bottom-bar-button favorites ${activeButton === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveButton('favorites')}
        >
          <i className="fas fa-heart"></i>
          <span>Favorites</span>
        </Link>

        <Link
          to="/personal-area"
          className={`bottom-bar-button personal ${activeButton === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveButton('personal')}
        >
          <i className="fas fa-user"></i>
          <span>Personal Area</span>
        </Link>

        <Link
          to="/map"
          className={`bottom-bar-button map ${activeButton === 'map' ? 'active' : ''}`}
          onClick={() => setActiveButton('map')}
        >
          <i className="fas fa-search-location"></i>
          <span>Search on Map</span>
        </Link>
      </div>
    </div>
  );
}

export default Home;
