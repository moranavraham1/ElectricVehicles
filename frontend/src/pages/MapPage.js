import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, LayersControl } from "react-leaflet";
import { Link, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "../designs/map.css";
import WazeLogo from "../assets/WAZE.jpg";


const { BaseLayer } = LayersControl;

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

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

const MapTypeButton = () => {
  const map = useMap();
  const [mapType, setMapType] = useState('standard');

  const toggleMapType = () => {
    let newType;
    if (mapType === 'standard') {
      newType = 'satellite';
    } else if (mapType === 'satellite') {
      newType = 'topographic';
    } else {
      newType = 'standard';
    }

    setMapType(newType);

    // Remove all existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (newType === 'satellite') {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19
        }
      ).addTo(map);
    } else if (newType === 'topographic') {
      L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          attribution: "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)",
          maxZoom: 17
        }
      ).addTo(map);
    } else {
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19
        }
      ).addTo(map);
    }
  };

  // Get the button text based on the current map type
  const getButtonText = () => {
    switch (mapType) {
      case 'standard':
        return 'Switch to Satellite';
      case 'satellite':
        return 'Switch to Topographic';
      case 'topographic':
        return 'Switch to Standard';
      default:
        return 'Change Map Type';
    }
  };

  return (
    <button
      className={`map-type-toggle-button ${mapType}`}
      onClick={toggleMapType}
    >
      {getButtonText()}
    </button>
  );
};


const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-logo">
      <div className="loading-circle"></div>
      <div className="loading-text">Loading map...</div>
    </div>
  </div>
);

const MapPage = () => {
  const [location, setLocation] = useState([32.0853, 34.7818]);
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [stations, setStations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [hoveredStationId, setHoveredStationId] = useState(null);
  const mapRef = useRef();
  const searchContainerRef = useRef();
  const navigate = useNavigate();
  const [showLayersControl, setShowLayersControl] = useState(false);
  const layersControlRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  const handleLogout = () => {
    try {
      localStorage.clear();
      alert('You have been logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchStationsAndSetMap = async () => {
      try {
        console.log("Fetching stations from:", `${backendUrl}/api/stations`);
        const response = await axios.get(`${backendUrl}/api/stations`);
        console.log("Stations data received:", response.data.length, "stations");

        if (!response.data || response.data.length === 0) {
          console.error("No stations received from API");
          alert("Failed to load stations. Please refresh the page.");
          setPageLoading(false);
          return;
        }

        setStations(response.data);

        let userLat = 32.0853;
        let userLon = 34.7818;

        if (navigator.geolocation) {
          try {
            const positionPromise = new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              });

              setTimeout(() => {
                reject(new Error("Geolocation request timed out"));
              }, 5000);
            });

            const position = await positionPromise;
            userLat = position.coords.latitude;
            userLon = position.coords.longitude;
            console.log("User position:", userLat, userLon);
          } catch (geoError) {
            console.warn("Geolocation failed:", geoError.message);
          }
        } else {
          console.warn("Geolocation not supported by this browser");
        }

        const nearestStation = response.data.reduce((closest, station) => {
          const distanceToUser = calculateDistance(userLat, userLon, station.Latitude, station.Longitude);
          return !closest || distanceToUser < closest.distance
            ? { ...station, distance: distanceToUser }
            : closest;
        }, null);

        setLocation([userLat, userLon]);
        setZoom(13);

        setTimeout(() => {
          if (mapRef.current) {
            console.log("Setting map view to:", nearestStation ?
              [nearestStation.Latitude, nearestStation.Longitude] :
              [userLat, userLon]);

            mapRef.current.setView(
              nearestStation ?
                [nearestStation.Latitude, nearestStation.Longitude] :
                [userLat, userLon],
              nearestStation ? 15 : 12
            );

            mapRef.current.invalidateSize();
          } else {
            console.error("Map reference not available");
          }

          setPageLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error loading stations or location:", error);
        alert("Error loading stations. Please refresh the page.");
        setPageLoading(false);
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

      setSuggestions(filteredSuggestions.slice(0, 5));

      if (filteredSuggestions.length > 0 && mapRef.current) {
        const firstStation = filteredSuggestions[0];
        mapRef.current.setView([firstStation.Latitude, firstStation.Longitude], 15);
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
        setSuggestions([]);
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
      mapRef.current.setView([station.Latitude, station.Longitude], 18);
    }
  };

  useEffect(() => {
    const fixLayersControl = () => {
      document.querySelectorAll('.layers-close-button').forEach(button => {
        button.remove();
      });


      const layerControls = document.querySelectorAll('.leaflet-control-layers');

      if (layerControls.length > 1) {
        console.log(`Found ${layerControls.length} layer controls - removing duplicates`);
        for (let i = 1; i < layerControls.length; i++) {
          layerControls[i].remove();
        }
      }

      const layersToggle = document.querySelector('.leaflet-control-layers-toggle');
      const layersList = document.querySelector('.leaflet-control-layers-list');
      const layersControl = document.querySelector('.leaflet-control-layers');

      if (!layersToggle || !layersList || !layersControl) {
        console.log('Required elements not found, skipping layer control setup');
        return;
      }


      layersControlRef.current = layersControl;

      const closeButton = document.createElement('div');
      closeButton.className = 'layers-close-button';
      closeButton.innerHTML = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '8px';
      closeButton.style.right = '8px';
      closeButton.style.width = '24px';
      closeButton.style.height = '24px';
      closeButton.style.display = 'flex';
      closeButton.style.alignItems = 'center';
      closeButton.style.justifyContent = 'center';
      closeButton.style.backgroundColor = '#f0f0f0';
      closeButton.style.borderRadius = '50%';
      closeButton.style.cursor = 'pointer';
      closeButton.style.fontSize = '20px';
      closeButton.style.color = '#666';
      closeButton.style.fontWeight = 'bold';
      closeButton.style.zIndex = '9999';
      closeButton.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';

      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setShowLayersControl(false);
        layersControl.classList.remove('leaflet-control-layers-expanded');
        layersList.style.visibility = 'hidden';
        layersList.style.opacity = '0';
      });

      layersList.appendChild(closeButton);

      const newToggle = layersToggle.cloneNode(true);
      layersToggle.parentNode.replaceChild(newToggle, layersToggle);

      newToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setShowLayersControl(prev => !prev);
        if (!layersControl.classList.contains('leaflet-control-layers-expanded')) {
          layersControl.classList.add('leaflet-control-layers-expanded');
          layersList.style.visibility = 'visible';
          layersList.style.opacity = '1';
        } else {
          layersControl.classList.remove('leaflet-control-layers-expanded');
          layersList.style.visibility = 'hidden';
          layersList.style.opacity = '0';
        }
      });

      const tileLayerUrls = [
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Standard
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // Satellite
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' // Topographic
      ];


      const tileLayerAttributions = [
        '&copy; OpenStreetMap contributors',
        '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
      ];

      const tileLayerMaxZooms = [19, 19, 17];

      const layerInputs = document.querySelectorAll('.leaflet-control-layers-selector');

      layerInputs.forEach((input, index) => {
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        newInput.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();

          console.log(`Switching to map layer ${index}`);

          if (!mapRef.current) {
            console.error('Map reference not available');
            return;
          }

          const map = mapRef.current;

          map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
              map.removeLayer(layer);
            }
          });

          try {
            const tileLayerUrl = tileLayerUrls[index];
            const attribution = tileLayerAttributions[index];
            const maxZoom = tileLayerMaxZooms[index];

            console.log(`Adding new tile layer: ${tileLayerUrl}`);

            const newLayer = L.tileLayer(tileLayerUrl, {
              attribution: attribution,
              maxZoom: maxZoom
            });

            newLayer.addTo(map);

            map.invalidateSize();

            map.panBy([1, 1]);
            map.panBy([-1, -1]);

            const currentInputs = document.querySelectorAll('.leaflet-control-layers-selector');
            currentInputs.forEach((otherInput, otherIndex) => {
              otherInput.checked = (otherIndex === index);
            });

            setTimeout(() => {
              layersControl.classList.add('leaflet-control-layers-expanded');
              layersList.style.visibility = 'visible';
              layersList.style.opacity = '1';
              setShowLayersControl(true);
            }, 50);
          } catch (error) {
            console.error('Error switching map layer:', error);
          }

          return false;
        });
      });

      // Prevent the mouseout behavior from closing the panel
      layersControl.addEventListener('mouseout', (e) => {
        if (showLayersControl) {
          e.stopPropagation();
        }
      });

      // מנע סגירת התפריט על ידי עצירת האירוע
      layersList.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // מנע סגירת התפריט כאשר עוזבים את העכבר
      layersList.addEventListener('mouseleave', (e) => {
        if (showLayersControl) {
          e.stopPropagation();
        }
      });
    };

    // Call the function only after map is fully loaded
    const timer = setTimeout(fixLayersControl, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [showLayersControl]);

  // Add this useEffect to handle state changes
  useEffect(() => {
    if (!layersControlRef.current) return;

    const layersList = layersControlRef.current.querySelector('.leaflet-control-layers-list');
    if (!layersList) return;

    if (showLayersControl) {
      layersControlRef.current.classList.add('leaflet-control-layers-expanded');
      layersList.style.visibility = 'visible';
      layersList.style.opacity = '1';
    } else {
      layersControlRef.current.classList.remove('leaflet-control-layers-expanded');
      layersList.style.visibility = 'hidden';
      layersList.style.opacity = '0';
    }
  }, [showLayersControl]);

  // Add useEffect to handle base layer changes and ensure map updates
  useEffect(() => {
    const handleBaseLayerChange = () => {
      if (mapRef.current) {
        console.log("Base layer changed, updating map view");
        // Force the map to refresh
        mapRef.current.invalidateSize();

        // Ensure markers are visible by slightly adjusting the view
        const currentCenter = mapRef.current.getCenter();
        const currentZoom = mapRef.current.getZoom();
        setTimeout(() => {
          mapRef.current.setView([currentCenter.lat, currentCenter.lng], currentZoom, {
            animate: false,
            duration: 0
          });
        }, 100);
      }
    };

    // Add event listener to all layer inputs
    if (mapRef.current) {
      const layerInputs = document.querySelectorAll('.leaflet-control-layers-selector');
      layerInputs.forEach(input => {
        input.addEventListener('change', handleBaseLayerChange);
      });

      // Clean up
      return () => {
        layerInputs.forEach(input => {
          input.removeEventListener('change', handleBaseLayerChange);
        });
      };
    }
  }, [pageLoading]);  // Run after initial loading is complete

  const handleBookAppointment = async (station) => {
    try {
      // Navigate to the home page and pass the selected station information
      navigate('/home', {
        state: {
          selectedStation: station,
          openBookingModal: true
        }
      });
    } catch (error) {
      console.error('Error handling booking:', error);
    }
  };

  // הוספת פונקציה לטיפול בשינוי סוג המפה באופן תקין
  const setMapLayer = (index) => {
    if (!mapRef.current) return;

    console.log(`Setting map layer to ${index}`);

    const map = mapRef.current;
    const tileLayerUrls = [
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Standard
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // Satellite
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' // Topographic
    ];

    const tileLayerAttributions = [
      '&copy; OpenStreetMap contributors',
      '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
    ];

    const tileLayerMaxZooms = [19, 19, 17];

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    try {
      const tileLayerUrl = tileLayerUrls[index];
      const attribution = tileLayerAttributions[index];
      const maxZoom = tileLayerMaxZooms[index];

      const newLayer = L.tileLayer(tileLayerUrl, {
        attribution: attribution,
        maxZoom: maxZoom
      });

      newLayer.addTo(map);
      map.invalidateSize();

      // עדכון קל לתצוגה
      setTimeout(() => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        map.setView(center, zoom, { animate: false });
      }, 100);

      // עדכון הכפתורים המסומנים
      const currentInputs = document.querySelectorAll('.leaflet-control-layers-selector');
      currentInputs.forEach((otherInput, otherIndex) => {
        otherInput.checked = (otherIndex === index);
      });

    } catch (error) {
      console.error('Error setting map layer:', error);
    }
  };

  // הוספת מאזין מיוחד שמתמודד עם לחיצות על תפריט בחירת המפה
  useEffect(() => {
    if (!mapRef.current) return;

    const handleLayerSelectionClick = (e) => {
      if (e.target && e.target.classList.contains('leaflet-control-layers-selector')) {
        const inputs = document.querySelectorAll('.leaflet-control-layers-selector');
        const index = Array.from(inputs).indexOf(e.target);

        if (index !== -1) {
          e.preventDefault();
          e.stopPropagation();

          setMapLayer(index);

          // שמירת התפריט פתוח
          const layersControl = document.querySelector('.leaflet-control-layers');
          const layersList = document.querySelector('.leaflet-control-layers-list');

          if (layersControl && layersList) {
            setTimeout(() => {
              layersControl.classList.add('leaflet-control-layers-expanded');
              layersList.style.visibility = 'visible';
              layersList.style.opacity = '1';
              setShowLayersControl(true);
            }, 50);
          }
        }
      }
    };

    document.addEventListener('click', handleLayerSelectionClick, true);

    return () => {
      document.removeEventListener('click', handleLayerSelectionClick, true);
    };
  }, [mapRef.current]);

  return (
    <>
      {pageLoading ? (
        <LoadingScreen />
      ) : (
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
              {/* Use only the built-in LayersControl with better styling */}
              <LayersControl position="topright">
                <BaseLayer checked name="Standard Map">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                </BaseLayer>
                <BaseLayer name="Satellite View">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                  />
                </BaseLayer>
                <BaseLayer name="Topographic Map">
                  <TileLayer
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    attribution="Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)"
                    maxZoom={17}
                  />
                </BaseLayer>
              </LayersControl>

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
                      <div>
                        <strong>{station["Station Name"]}</strong>
                        {station.Address}, {station.City}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                          <a
                            href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="waze-navigation-link"
                          >
                            <img src={WazeLogo} alt="Navigate with Waze" />
                          </a>
                          <button
                            onClick={() => handleBookAppointment(station)}
                            className="tooltip-appointment-button"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </Tooltip>
                  )}
                </Marker>
              ))}
              <ZoomControl position="bottomright" />
            </MapContainer>
          </div>

          <div className="bottom-bar">
            <Link to="/home" className="bottom-bar-button">
              <HomeIcon />
              <span>Home</span>
            </Link>
            <Link to="/map" className="bottom-bar-button active">
              <MapIcon />
              <span>Map</span>
            </Link>
            <Link to="/favorites" className="bottom-bar-button">
              <HeartIcon />
              <span>Favorites</span>
            </Link>
            <Link to="/personal-area" className="bottom-bar-button">
              <UserIcon />
              <span>Profile</span>
            </Link>
            <button className="bottom-bar-button" onClick={handleLogout}>
              <LogoutIcon />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MapPage;
