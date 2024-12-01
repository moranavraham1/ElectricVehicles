import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import shiraz from "./shiraz.jpg";
import '../map.css';

// Fix for default marker icon not appearing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapPage = () => {
  const [location, setLocation] = useState([32.0853, 34.7818]); // Default location (Tel Aviv)
  const [zoom, setZoom] = useState(13); // Initial zoom level
  const [searchQuery, setSearchQuery] = useState('');
  const [stations] = useState([
    {
      id: 1,
      name: 'Station A',
      location: { lat: 32.0853, lng: 34.7818 },
    },
    {
      id: 2,
      name: 'Station B',
      location: { lat: 31.7683, lng: 35.2137 },
    },
    {
      id: 3,
      name: 'Station C',
      location: { lat: 32.0707, lng: 34.7799 },
    },
  ]);

  // Function to fetch coordinates based on city name
  const getCoordinatesFromCity = async (cityName) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${cityName}&format=json`);
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      } else {
        throw new Error("No results found");
      }
    } catch (error) {
      alert("Error finding location");
      console.error(error);
      return null;
    }
  };

  const handleSearch = async () => {
    // Fetch the coordinates for the search query (city name)
    const coords = await getCoordinatesFromCity(searchQuery);
    if (coords) {
      setLocation(coords); // Update location with new coordinates
      setZoom(15); // Zoom in when a location is found
    } else {
      alert("No location found for the search.");
    }
  };

  // Custom funny icon
  const funnyIcon = new L.Icon({
    iconUrl: shiraz,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Component to update the map view when location changes
  const MapUpdater = ({ location, zoom }) => {
    const map = useMap();
    map.setView(location, zoom); // Set new center and zoom
    return null;
  };

  return (
    <div className="map-page-container">
      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>

      <div style={{ width: "80%", height: "60vh", margin: "0 auto" }}> {/* Smaller map */}
        <MapContainer 
          center={location} 
          zoom={zoom} 
          style={{ height: "100%", width: "100%" }} 
          zoomControl={false} // Disabling default zoom control
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {stations.map((station) => (
            <Marker key={station.id} position={station.location} icon={funnyIcon}>
              <Popup>{station.name}</Popup>
            </Marker>
          ))}
          <ZoomControl position="topright" /> {/* Added zoom control on the top right */}

          {/* Update the map when the location or zoom changes */}
          <MapUpdater location={location} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
