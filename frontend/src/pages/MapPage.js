import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "../map.css";

// תיקון בעיות אייקון ברירת מחדל ב-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapPage = () => {
  const [location, setLocation] = useState([32.0853, 34.7818]); // מיקום ברירת מחדל - תל אביב
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // שליפת תחנות מהשרת
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/stations");
        setStations(response.data);
        setLoading(false);
      } catch (error) {
        console.error("שגיאה בטעינת התחנות:", error);
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // הגדרת אייקון מותאם אישית עם HTML ו-CSS
  const chargingIcon = L.divIcon({
    className: "custom-charging-icon",
    html: 
      `<div style="
        width: 30px; 
        height: 40px; 
        background: #4CAF50; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0px 2px 6px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          color: white; 
          font-size: 16px; /* גודל טקסט מותאם */
          font-weight: bold;
          font-family: Arial, sans-serif;
        ">
          <span style="color: white;">⚡</span>
        </div>
      </div>`,
    iconSize: [30, 40], // שמירה על גודל האייקון כאליפסה יפה
    iconAnchor: [15, 40],
    popupAnchor: [0, -30],
  });

  // עדכון מיקום וזום במפה
  const MapUpdater = ({ location, zoom }) => {
    const map = useMap();
    map.setView(location, zoom);
    return null;
  };

  // חיפוש עיר ועדכון המפה והתחנות
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${searchQuery}&format=json`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const cityLat = parseFloat(data[0].lat);
        const cityLon = parseFloat(data[0].lon);

        // עדכון מיקום וזום במפה לאחר חיפוש העיר
        setLocation([cityLat, cityLon]);
        setZoom(15); // שינוי רמת הזום
      } else {
        alert("לא נמצאה עיר עבור החיפוש.");
      }
    } catch (error) {
      console.error("שגיאה במהלך החיפוש:", error);
    }
  };

  // טיפולי סגירת ה-popup
  const handleMarkerMouseOut = (marker) => {
    marker.closePopup(); // סגור את ה-popup הקודם
  };

  const handleMarkerMouseOver = (marker) => {
    marker.openPopup(); // פתח את ה-popup
  };

  if (loading) return <div>טעינת תחנות...</div>;

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
        <button onClick={handleSearch} className="search-button">
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
          {/* החזרת אריחי מפה של OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* הצגת התחנות */}
          {stations.map((station) => (
            <Marker
              key={station._id}
              position={[station.Latitude, station.Longitude]}
              icon={chargingIcon} // שימוש באייקון המותאם
              eventHandlers={{
                mouseover: (e) => handleMarkerMouseOver(e.target), // על ריחוף מעל תחנה
                mouseout: (e) => handleMarkerMouseOut(e.target), // על יציאה מעל תחנה
              }}
            >
              <Popup>
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
            </Marker>
          ))}

          <ZoomControl position="topright" />
          <MapUpdater location={location} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
