import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './Home.css';

function Home() {
  const [stations] = useState([
    {
      id: 1,
      name: 'תחנה A',
      address: 'שדרות בן גוריון 123, תל אביב',
      city: 'תל אביב',
      status: 'Available',
      waitTime: 0,
      isFavorite: false,
      location: { lat: 32.0853, lng: 34.7818 },
    },
    {
      id: 2,
      name: 'תחנה B',
      address: 'דרך ירושלים 456, ירושלים',
      city: 'ירושלים',
      status: 'Occupied',
      waitTime: 3,
      isFavorite: false,
      location: { lat: 31.7683, lng: 35.2137 },
    },
    {
      id: 3,
      name: 'תחנה C',
      address: 'רחוב אלנבי 100, תל אביב',
      city: 'תל אביב',
      status: 'Available',
      waitTime: 1,
      isFavorite: false,
      location: { lat: 32.0707, lng: 34.7799 },
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState(stations);
  const [suggestions, setSuggestions] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);

    const matches = stations
      .map((station) => station.city)
      .filter((city, index, array) => array.indexOf(city) === index) // מניעת כפילויות
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

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '15px',
  };

  const mapCenter =
    filteredStations.length > 0
      ? filteredStations[0].location
      : { lat: 32.0853, lng: 34.7818 };

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="title">AC/DC תחנות טעינה</h1>
      </header>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="חפש עיר או כתובת..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-bar"
        />
        <button className="map-button" onClick={() => setShowMap(!showMap)}>
          {showMap ? 'חזור לרשימה' : 'חפש במפה'}
        </button>
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

      {showMap ? (
        <LoadScript googleMapsApiKey="AIzaSyDaXpZE3bFz-0An8LY3vi7vMrkVtLypi7A">
          <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={10}>
            {filteredStations.map((station) => (
              <Marker
                key={station.id}
                position={station.location}
                onClick={() => setSelectedStation(station)}
              />
            ))}
            {selectedStation && (
              <InfoWindow
                position={selectedStation.location}
                onCloseClick={() => setSelectedStation(null)}
              >
                <div>
                  <h3>{selectedStation.name}</h3>
                  <p><strong>כתובת:</strong> {selectedStation.address}</p>
                  <p><strong>סטטוס:</strong> {selectedStation.status === 'Available' ? 'פנוי' : 'תפוס'}</p>
                  <p><strong>זמן המתנה:</strong> {selectedStation.waitTime} אנשים ממתינים</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      ) : (
        <div className="station-list">
          {filteredStations.map((station) => (
            <div key={station.id} className="station-card">
              <h3 className="station-name">{station.name}</h3>
              <p className="station-address">{station.address}</p>
              <p className={`station-status ${station.status.toLowerCase()}`}>
                {station.status === 'Available' ? 'פנוי' : 'תפוס'}
              </p>
              <p className="station-wait-time">
                <strong>זמן המתנה:</strong> {station.waitTime} אנשים ממתינים
              </p>
              {/* כפתור נווט לתחנה */}
              <a
                 href={`https://waze.com/ul?ll=${station.location.lat},${station.location.lng}&from=now&navigate=yes`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="navigate-to-station"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Waze_logo.svg"
                  alt="נווט באמצעות Waze"
                  className="waze-icon"
                />

                נווט לתחנה
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
