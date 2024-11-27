import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Home.css'; // קובץ CSS מותאם

function Home() {
  const [stations, setStations] = useState([
    {
      id: 1,
      name: 'תחנה A',
      address: 'שדרות בן גוריון 123, תל אביב',
      status: 'Available',
      waitTime: 0,
      isFavorite: false,
      location: { lat: 32.0853, lng: 34.7818 }, // Tel Aviv
      image: 'https://via.placeholder.com/300x150.png?text=Station+A', // Replace with real image URL
    },
    {
      id: 2,
      name: 'תחנה B',
      address: 'דרך ירושלים 456, ירושלים',
      status: 'Occupied',
      waitTime: 3,
      isFavorite: false,
      location: { lat: 31.7683, lng: 35.2137 }, // Jerusalem
      image: 'https://via.placeholder.com/300x150.png?text=Station+B', // Replace with real image URL
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState(stations);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = stations.filter(
      (station) =>
        station.name.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query)
    );
    setFilteredStations(filtered);
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '15px',
  };

  const mapCenter = stations.length > 0 ? stations[0].location : { lat: 0, lng: 0 };

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="title">AC/DC תחנות טעינה</h1>
        <button className="location-button">רענן מיקום</button>
      </header>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="חפש תחנות..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>

      <div className="station-list">
        {filteredStations.map((station) => (
          <div key={station.id} className="station-card">
            <img src={station.image} alt={station.name} className="station-image" />
            <div className="station-info">
              <h3 className="station-name">{station.name}</h3>
              <p className="station-address">{station.address}</p>
              <p className={`station-status ${station.status.toLowerCase()}`}>
                {station.status === 'Available' ? 'פנוי' : 'תפוס'}
              </p>
              <p className="station-wait-time">
                <strong>זמן המתנה:</strong> {station.waitTime} אנשים ממתינים
              </p>
              <div className="station-actions">
                <button className="navigate-button">נווט לתחנה</button>
                <button
                  className={`favorite-button ${station.isFavorite ? 'favorite' : ''}`}
                  onClick={() =>
                    setStations((prevStations) =>
                      prevStations.map((s) =>
                        s.id === station.id ? { ...s, isFavorite: !s.isFavorite } : s
                      )
                    )
                  }
                >
                  {station.isFavorite ? '❤️ מועדף' : '♡ הוסף למועדפים'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <LoadScript googleMapsApiKey="AIzaSyDaXpZE3bFz-0An8LY3vi7vMrkVtLypi7A">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={10}
        >
          {filteredStations.map((station) => (
            <Marker key={station.id} position={station.location} />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Home;
