import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "../map.css";

// אייקוני ברירת מחדל של Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapPage = () => {
  const [location, setLocation] = useState(null); // ללא מיקום ברירת מחדל
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStationId, setSelectedStationId] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/stations");
        setStations(response.data);
        setLoading(false);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            setLocation([userLat, userLon]);
            setZoom(15);
            const nearestStation = response.data.reduce((prev, curr) => {
              const prevDistance = Math.sqrt(
                Math.pow(prev.Latitude - userLat, 2) + Math.pow(prev.Longitude - userLon, 2)
              );
              const currDistance = Math.sqrt(
                Math.pow(curr.Latitude - userLat, 2) + Math.pow(curr.Longitude - userLon, 2)
              );
              return currDistance < prevDistance ? curr : prev;
            });
            setSelectedStationId(nearestStation._id);
          });
        }
      } catch (error) {
        console.error("שגיאה בטעינת התחנות:", error);
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const chargingIconGreen = L.divIcon({
    className: "custom-charging-icon-green",
    html: `
      <div style="
        width: 30px; 
        height: 40px; 
        background: #4CAF50; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0px 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="color: white; font-size: 16px; font-weight: bold;">⚡</div>
      </div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -30],
  });

  const chargingIconRed = L.divIcon({
    className: "custom-charging-icon-red",
    html: `
      <div style="
        width: 30px; 
        height: 40px; 
        background: #FF0000; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0px 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="color: white; font-size: 16px; font-weight: bold;">⚡</div>
      </div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -30],
  });

  const handleMarkerClick = (stationId) => {
    setSelectedStationId(stationId);
  };

  if (loading || !location) return <div>טעינת תחנות...</div>;

  return (
    <div className="map-page-container">
      {/* סרגל חיפוש */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="חפש עיר..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        <button onClick={() => handleSearch()} className="search-button">
          חפש
        </button>
      </div>

      {/* מפה */}
      <div style={{ width: "80%", height: "60vh", margin: "0 auto" }}>
        <MapContainer
          center={location}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {stations.map((station) => (
            <Marker
              key={station._id}
              position={[station.Latitude, station.Longitude]}
              icon={
                selectedStationId === station._id ? chargingIconRed : chargingIconGreen
              }
              eventHandlers={{
                click: () => handleMarkerClick(station._id),
              }}
            >
              {selectedStationId === station._id && (
                <Popup autoClose={false} closeOnClick={false}>
                  <strong>{station["Station Name"]}</strong>
                  <br />
                  {station.Address}, {station.City}
                  <br />
                  <a
                    href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    נווט באמצעות Waze
                  </a>
                </Popup>
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