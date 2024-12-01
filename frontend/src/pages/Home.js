import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Home.css';

function Home() {
  const [stations] = useState([
    {
      id: 1,
      name: 'Station A',
      address: 'Ben Gurion Blvd 123, Tel Aviv',
      city: 'Tel Aviv',
      status: 'Available',
      waitTime: 0,
      isFavorite: false,
      location: { lat: 32.0853, lng: 34.7818 },
    },
    {
      id: 2,
      name: 'Station B',
      address: 'Jerusalem St 456, Jerusalem',
      city: 'Jerusalem',
      status: 'Occupied',
      waitTime: 3,
      isFavorite: false,
      location: { lat: 31.7683, lng: 35.2137 },
    },
    {
      id: 3,
      name: 'Station C',
      address: 'Allenby St 100, Tel Aviv',
      city: 'Tel Aviv',
      status: 'Available',
      waitTime: 1,
      isFavorite: false,
      location: { lat: 32.0707, lng: 34.7799 },
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState(stations);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    const matches = stations
      .map((station) => station.city)
      .filter((city, index, array) => array.indexOf(city) === index) // Remove duplicates
      .filter((city) => city.includes(query));

    setSuggestions(matches);

    const filtered = stations.filter(
      (station) =>
        station.city.includes(query) || station.address.includes(query)
    );
    setFilteredStations(filtered);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    const filtered = stations.filter(
      (station) => station.city === suggestion || station.address.includes(suggestion)
    );
    setFilteredStations(filtered);
  };

  return (
    <div className="home-container">
      <div className="main-content">
        
        {/* Added "Search Charging Stations" title above the search bar */}
        <h2 className="search-title">Search Charging Stations</h2>

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

        <div className="station-list">
          {filteredStations.map((station) => (
            <div key={station.id} className="station-card">
              <h3 className="station-name">{station.name}</h3>
              <p className="station-address">{station.address}</p>
              <p className={`station-status ${station.status.toLowerCase()}`}>
                {station.status === 'Available' ? 'Available' : 'Occupied'}
              </p>
              <p className="station-wait-time">
                <strong>Wait time:</strong> {station.waitTime} people waiting
              </p>
              <a
                href={`https://waze.com/ul?ll=${station.location.lat},${station.location.lng}&from=now&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="navigate-to-station"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Waze_logo.svg"
                  alt="Navigate with Waze"
                  className="waze-icon"
                />
                Navigate to station
              </a>
            </div>
          ))}
        </div>

        {/* Bottom fixed bar */}
        <div className="bottom-bar">
          <Link to="/favorites" className="bottom-bar-button">Favorites</Link>
          <Link to="/personal-area" className="bottom-bar-button">Personal Area</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
