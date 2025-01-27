import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "../map.css";
import WazeLogo from "../assets/WAZE.jpg";

// Configure Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const chargingIconGreen = L.divIcon({
  className: "custom-charging-icon-green",
  html: `<div style="width: 30px; height: 40px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0px 2px 6px rgba(0,0,0,0.3);"><div style="color: white; font-size: 16px; font-weight: bold;">⚡</div></div>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -30],
});

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const MapPage = () => {
  const [location, setLocation] = useState([32.0853, 34.7818]);
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStationId, setHoveredStationId] = useState(null);
  const mapRef = useRef();
  const searchContainerRef = useRef(); // Ref for detecting clicks outside

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    const fetchStationsAndSetMap = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/stations`);
        setStations(response.data);
        setLoading(false);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            const nearestStation = response.data.reduce((closest, station) => {
              const distanceToUser = calculateDistance(userLat, userLon, station.Latitude, station.Longitude);
              return !closest || distanceToUser < closest.distance
                ? { ...station, distance: distanceToUser }
                : closest;
            }, null);

            setLocation([userLat, userLon]);
            setZoom(15);

            if (nearestStation && mapRef.current) {
              mapRef.current.setView([nearestStation.Latitude, nearestStation.Longitude], 15);
            }
          });
        }
      } catch (error) {
        console.error("Error loading stations or location:", error);
        setLoading(false);
      }
    };

    fetchStationsAndSetMap();
  }, [backendUrl]);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const normalizedQuery = normalizeText(searchQuery);
      const filteredSuggestions = stations.filter((station) => {
        const normalizedCity = normalizeText(station.City);
        const normalizedAddress = normalizeText(station.Address);
        const normalizedName = normalizeText(station["Station Name"]);
        return (
          normalizedCity.includes(normalizedQuery) ||
          normalizedAddress.includes(normalizedQuery) ||
          normalizedName.includes(normalizedQuery)
        );
      });

      setSuggestions(filteredSuggestions.slice(0, 5)); // Show up to 5 suggestions

      if (filteredSuggestions.length > 0 && mapRef.current) {
        const firstStation = filteredSuggestions[0];
        mapRef.current.setView([firstStation.Latitude, firstStation.Longitude], 15); // Move map to first result
      }
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, stations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSuggestions([]); // Close suggestions dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[\u0590-\u05FF]/g, (char) => char)
      .replace(/[^a-z0-9\u0590-\u05FF\s]/g, "");
  };

  const handleSearchSelect = (station) => {
    setSearchQuery(station["Station Name"]);
    setSuggestions([]);
    setZoom(18);
    if (mapRef.current) {
      mapRef.current.setView([station.Latitude, station.Longitude], 18); // Focus on the selected station
    }
  };

  if (loading) return <div>Loading stations...</div>;

  return (
    <div className="map-page-container">
      <div className="map-search-bar-container" ref={searchContainerRef}>
        <input
          type="text"
          placeholder="Search city, address, or station name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        {suggestions.length > 0 && (
          <div className="suggestions-container">
            {suggestions.map((station) => (
              <div
                key={station._id}
                className="suggestion-item"
                onClick={() => handleSearchSelect(station)}
              >
                {station["Station Name"]} - {station.Address}, {station.City}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "100%", height: "100vh", position: "relative", zIndex: "1" }}>
        <MapContainer
          center={location}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {stations.map((station) => (
            <Marker
              key={station._id}
              position={[station.Latitude, station.Longitude]}
              icon={chargingIconGreen}
              eventHandlers={{
                mouseover: () => setHoveredStationId(station._id),
                mouseout: () => setHoveredStationId(null),
              }}
            >
              {hoveredStationId === station._id && (
                <Tooltip direction="top" offset={[0, -30]} permanent interactive>
                  <div style={{ textAlign: "center" }}>
                    <strong>{station["Station Name"]}</strong>
                    <br />
                    {station.Address}, {station.City}
                    <br />
                    <a
                      href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        marginTop: "5px",
                        textDecoration: "none",
                        color: "blue",
                      }}
                    >
                      <span>Navigate with Waze</span>
                      <img src={WazeLogo} alt="Navigate with Waze" style={{ width: "24px", height: "24px" }} />
                    </a>
                  </div>
                </Tooltip>
              )}
            </Marker>
          ))}
          <ZoomControl position="topright" />
        </MapContainer>
      </div>

      <div className="bottom-bar">
        <button className="bottom-bar-button logout">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
        <Link to="/personal-area" className="bottom-bar-button personal">
          <i className="fas fa-user"></i> Personal Area
        </Link>
        <Link to="/favorites" className="bottom-bar-button favorites">
          <i className="fas fa-heart"></i> Favorites
        </Link>
        <Link to="/home" className="bottom-bar-button home">
          <i className="fas fa-home"></i> Home
        </Link>
        <Link to="/map" className="bottom-bar-button map">
          <i className="fas fa-map-marked-alt"></i> Search on Map
        </Link>
      </div>
    </div>
  );
};

export default MapPage;
