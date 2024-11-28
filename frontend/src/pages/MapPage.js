import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import shiraz from "./shiraz.jpg";

// Fix for default marker icon not appearing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapPage() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Fetch user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation([latitude, longitude]);
      },
      (error) => {
        console.error("Error fetching location", error);
      }
    );
  }, []); // Add an empty dependency array to run useEffect only once

  // Custom funny icon
  const funnyIcon = new L.Icon({
    iconUrl: shiraz, // Replace with your funny icon URL or path
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Position of the icon's anchor point
    popupAnchor: [0, -32], // Position of the popup relative to the icon
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {location ? (
        <MapContainer center={location} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={location} icon={funnyIcon}>
            <Popup>You are here!</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p style={{ textAlign: "center", padding: "2rem" }}>
          Fetching your location...
        </p>
      )}
    </div>
  );
}

export default MapPage;
