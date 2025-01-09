import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "../map.css";
import WazeLogo from "../assets/WAZE.jpg"; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapPage = () => {
  const [location, setLocation] = useState([32.0853, 34.7818]); 
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStationId, setHoveredStationId] = useState(null);
  const mapRef = useRef();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/stations`);
        setStations(response.data);
        setLoading(false);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            setLocation([position.coords.latitude, position.coords.longitude]);
            setZoom(15);
          });
        }
      } catch (error) {
        console.error("Error loading stations:", error);
        setLoading(false);
      }
    };
    fetchStations();
  }, [backendUrl]);

  // ביצוע חיפוש אוטומטי בעת ההקלדה עם עיכוב (debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        handleSearch();
      }
    }, 500); // מבצע חיפוש רק לאחר 500ms של חוסר הקלדה

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]); // מאזין לשינויים בשורת החיפוש בלבד

  const handleSearch = () => {
    const foundStation = stations.find(
      (station) =>
        station.City.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.Address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station["Station Name"].toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundStation) {
      setZoom(15);
      if (mapRef.current) {
        mapRef.current.setView([foundStation.Latitude, foundStation.Longitude], 15);
      }
    }
  };

  const chargingIconGreen = L.divIcon({
    className: "custom-charging-icon-green",
    html: `<div style="width: 30px; height: 40px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0px 2px 6px rgba(0,0,0,0.3);"><div style="color: white; font-size: 16px; font-weight: bold;">⚡</div></div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -30],
  });

  if (loading) return <div>Loading stations...</div>;

  return (
    <div className="map-page-container">
      {/* Back to Home Button */}
      <div className="home-button-container">
        <Link to="/home" className="home-button">
          ← Back to Home Page
        </Link>
      </div>

      {/* Search Bar */}
      <div className="map-search-bar-container">
        <input
          type="text"
          placeholder="Search city, address, or station name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
      </div>

      {/* Map */}
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
                    {/* Waze Navigation Button */}
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
    </div>
  );
};

export default MapPage;
