import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [stations, setStations] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Populate stations dynamically (replace this with real data extraction logic)
    const fetchedStations = [
      {
        id: 1,
        name: 'Afcon EV',
        address: 'Industrial Area, Dimona',
        city: 'Dimona',
        status: 'Available',
        waitTime: 0,
      },
      {
        id: 2,
        name: 'Paz (Yellow)',
        address: 'Milos Hotel, Ein Bokek',
        city: 'Dead Sea',
        status: 'Occupied',
        waitTime: 2,
      },
      {
        id: 3,
        name: 'EV Edge',
        address: 'Sonol Gas Station, Yeruham',
        city: 'Yeruham',
        status: 'Available',
        waitTime: 1,
      },
    ];
    setStations(fetchedStations);
  }, []);

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="title">AC/DC Charging Stations</h1>
      </header>

      <div className="search-bar-container">
        <button className="map-button" onClick={() => setShowMap(!showMap)}>
          {showMap ? 'Back to List' : 'Show Map'}
        </button>
      </div>

      {showMap ? (
        <div className="map-container">
          <iframe
            src="https://cellocharge.com/"
            width="100%"
            height="480"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Charging Stations Map"
          ></iframe>
        </div>
      ) : (
        <div className="station-list">
          {stations.map((station) => (
            <div key={station.id} className="station-card">
              <h3 className="station-name">{station.name}</h3>
              <p className="station-address">{station.address}</p>
              <p className={`station-status ${station.status.toLowerCase()}`}>
                {station.status === 'Available' ? 'Available' : 'Occupied'}
              </p>
              <p className="station-wait-time">
                <strong>Wait Time:</strong> {station.waitTime} people waiting
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
