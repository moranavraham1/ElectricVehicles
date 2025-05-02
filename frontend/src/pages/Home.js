import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../designs/Home.css';
import logo from '../assets/logo.jpg';
import wazeIcon from '../assets/WAZE.jpg';

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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// קוד לטיפול במטמון
const STATIONS_CACHE_KEY = 'cached_stations';
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 דקות

const getCachedStations = () => {
  try {
    const cached = localStorage.getItem(STATIONS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    // בדיקה שהמטמון לא פג תוקף
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(STATIONS_CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const setCachedStations = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(STATIONS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};



import wazeIcon from '../assets/WAZE.jpg'; // תמונת ה-Waze


import logo from '../assets/logo.jpg'; // ייבוא הלוגו



const Home = () => {
  const [userLocation, setUserLocation] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [stations, setStations] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isAvailable, setIsAvailable] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [urgencyLevel, setUrgencyLevel] = useState(1); // Default value
  const [userName, setUserName] = useState(""); // User's full name
  const location = useLocation();
  const [loadingStations, setLoadingStations] = useState(true);
  const [showFullMap, setShowFullMap] = useState({});
  const [stationsPage, setStationsPage] = useState(1);
  const STATIONS_PER_PAGE = 5;
  const [mapLoading, setMapLoading] = useState({});
  const [fullMapLoading, setFullMapLoading] = useState({});

  // Check if we're navigating from Map or Favorites with a station to book
  useEffect(() => {
    if (location.state?.selectedStation && location.state?.openBookingModal) {
      setSelectedStation(location.state.selectedStation);
      setShowModal(true);

      // Clear the location state to prevent modal from reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Fetch user's actual first and last name from the backend
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/fetch-details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.firstName && response.data.lastName) {
          const fullName = `${response.data.firstName} ${response.data.lastName}`;
          setUserName(fullName);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setDate('');
    setTime('');
    setAvailableTimes([]);
  };

  const startCharging = (station) => {
    navigate('/charging', { state: { station } });
  };
  const goToAppointmentPage = async (station) => {
    try {
      const battery = await navigator.getBattery();
      const level = Math.round(battery.level * 100);
      navigate('/appointment', {
        state: {
          station,
          batteryLevel: level
        }
      });
    } catch (err) {
      console.error('Battery API not available:', err);
      navigate('/appointment', {
        state: { station }
      });
    }
  };


  const carModelsData = {
    "Tesla Model 3": { fullChargeTime: 80 },
    "Tesla Model Y": { fullChargeTime: 90 },
    "Hyundai Ioniq 5": { fullChargeTime: 70 },
    "Kia EV6": { fullChargeTime: 75 },
    "Nissan Leaf": { fullChargeTime: 90 },
    "BYD Atto 3": { fullChargeTime: 85 },
    "MG ZS EV": { fullChargeTime: 80 },
    "Skoda Enyaq": { fullChargeTime: 85 },
    "Volkswagen ID.4": { fullChargeTime: 85 },
    "Renault Zoe": { fullChargeTime: 60 },
    "Chevrolet Bolt EV": { fullChargeTime: 70 },
    "Other / Manual Input": { fullChargeTime: null }
  };

  const [selectedCarModel, setSelectedCarModel] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(20);
  const [targetLevel, setTargetLevel] = useState(80);
  const [estimatedChargeTime, setEstimatedChargeTime] = useState(0);
  const [manualTime, setManualTime] = useState(30);

  useEffect(() => {
    if (!selectedCarModel || batteryLevel >= targetLevel) return;

    const baseTime = selectedCarModel === "Other / Manual Input"
      ? manualTime
      : carModelsData[selectedCarModel]?.fullChargeTime || 0;

    const diff = targetLevel - batteryLevel;
    const time = (baseTime * diff) / 100;
    setEstimatedChargeTime(Math.round(time));

    if (diff >= 60) setUrgencyLevel(3);
    else if (diff >= 30) setUrgencyLevel(2);
    else setUrgencyLevel(1);

  }, [selectedCarModel, batteryLevel, targetLevel, manualTime]);

  useEffect(() => {
    let batteryRef;

    const getBattery = async () => {
      try {
        const battery = await navigator.getBattery();
        batteryRef = battery;
        const updateLevel = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };

        updateLevel(); // Initial update
        battery.addEventListener("levelchange", updateLevel);
      } catch (err) {
        console.error("Battery API not supported", err);
      }
    };

    if (showModal) {
      getBattery();
    }

    return () => {
      if (batteryRef) {
        batteryRef.removeEventListener("levelchange", () => { });
      }
    };
  }, [showModal]);


  useEffect(() => {
    if (!selectedCarModel || batteryLevel >= targetLevel) return;

    const baseTime = selectedCarModel === "Other / Manual Input"
      ? manualTime
      : carModelsData[selectedCarModel]?.fullChargeTime || 0;

    const diff = targetLevel - batteryLevel;
    const time = (baseTime * diff) / 100;
    setEstimatedChargeTime(Math.round(time));
  }, [selectedCarModel, batteryLevel, targetLevel, manualTime]);



  const navigate = useNavigate();

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
    if (!selectedCarModel || batteryLevel >= targetLevel) return;

    const baseTime = selectedCarModel === "Other / Manual Input"
      ? manualTime
      : carModelsData[selectedCarModel]?.fullChargeTime || 0;

    const diff = targetLevel - batteryLevel;
    const time = (baseTime * diff) / 100;
    setEstimatedChargeTime(Math.round(time));
  }, [selectedCarModel, batteryLevel, targetLevel, manualTime]);



  useEffect(() => {
    fetchUserLocation();
  }, []);


  useEffect(() => {

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchStations();
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      alert('User not logged in!');
      navigate('/login');
    }
    const favoriteKey = `favorites_${loggedInUser}`;
    const savedFavorites = JSON.parse(localStorage.getItem(favoriteKey)) || [];
    setFavorites(savedFavorites.map((station) => station['Station Name']));
  }, [navigate]);


  useEffect(() => {
    if (searchQuery) {
      const filtered = stations.filter(
        (station) =>
          station['Station Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.City.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStations(filtered);
    } else {
      setFilteredStations(stations);
    }
  }, [searchQuery, stations]);

  const fetchUserLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error('Error fetching location:', error);
        setLoadingLocation(false);
      }
    );
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
      );
      const { address } = response.data;
      const road = address.road || 'Address not available';
      const city = address.city || address.town || address.village || 'City not available';
      setUserLocation(`${road}, ${city}`);
    } catch (error) {
      console.error('Error:', error);
      setUserLocation('Location not available');
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchStations = async () => {
    try {
      setLoadingStations(true);

      // ניסיון לקבל נתונים מהמטמון תחילה
      const cachedData = getCachedStations();
      if (cachedData) {
        const stationsWithDistance = cachedData.map((station) => ({
          ...station,
          distance: calculateDistance(latitude, longitude, station.Latitude, station.Longitude),
        }));

        const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
        setStations(sortedStations);
        setFilteredStations(sortedStations);
        setLoadingStations(false);
        return;
      }

      // אם אין מטמון תקף, נטען מהשרת
      const response = await axios.get('http://localhost:3001/api/stations');
      const stationsWithDistance = response.data.map((station) => ({
        ...station,
        distance: calculateDistance(latitude, longitude, station.Latitude, station.Longitude),
      }));

      const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
      setStations(sortedStations);
      setFilteredStations(sortedStations);

      // שמירה במטמון
      setCachedStations(response.data);


    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoadingStations(false);
    }
  };

  // הדפסה של רק כמות מוגבלת של תחנות בכל פעם
  const paginatedStations = filteredStations.slice(
    0,
    stationsPage * STATIONS_PER_PAGE
  );

  // טעינת תחנות נוספות בגלילה
  const handleLoadMoreStations = () => {
    setStationsPage(prev => prev + 1);
  };

  // הפונקציה להצגת מפה מלאה
  const toggleFullMap = (index) => {
    // סימון שהמפה בטעינה
    setFullMapLoading(prev => ({
      ...prev,
      [index]: true
    }));

    // החלפת מצב תצוגת המפה
    setShowFullMap(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // פונקציה לטיפול בסיום טעינת המפה המלאה
  const handleFullMapLoad = (index) => {
    setFullMapLoading(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const [chargingSlots, setChargingSlots] = useState({});

  const fetchAvailableTimes = async (selectedDate) => {
    if (!selectedStation) return;

    
    console.log("💡 fetchAvailableTimes called with date:", selectedDate);
    console.log("💡 selectedStation:", selectedStation);


    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/check-availability`,
        { station: selectedStation["Station Name"], date: selectedDate }
        ,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      console.log("✅ response from check-availability:", response.data);
      let availableTimeSlots = response.data.availableTimes || [];
      const bookingsPerTime = response.data.bookingsPerTime || {};
      const maxCapacity = selectedStation["Duplicate Count"] || 1;
      let updatedChargingSlots = {};

      availableTimeSlots = availableTimeSlots.filter(time => {
        const bookedCount = bookingsPerTime[time] || 0;
        const remainingSlots = maxCapacity - bookedCount;
        updatedChargingSlots[time] = remainingSlots;
        return remainingSlots > 0;
      });
      const now = new Date();
      availableTimeSlots = availableTimeSlots.filter(time => {
        const [hour, minute] = time.split(":");

        // Ensure proper date format for creating date object (YYYY-MM-DD)
        const slotDateTime = new Date(`${selectedDate}T${hour}:${minute}:00`);
        const isAfterNow = slotDateTime > now;
        console.log(`💡 Time slot ${time} - Date: ${slotDateTime.toISOString()} - Is after now (${now.toISOString()}): ${isAfterNow}`);
        return isAfterNow;
      });

      console.log("💡 Final available time slots:", availableTimeSlots);

      setAvailableTimes(availableTimeSlots);
      setChargingSlots(updatedChargingSlots);
      setIsAvailable(availableTimeSlots.length > 0);
    } catch (error) {
      console.error("Error fetching available times:", error);
      setAvailableTimes([]);
      setChargingSlots({});
      setIsAvailable(false);
    }
  };


  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const matchingSuggestions = stations.filter((station) =>
        station['Station Name'].toLowerCase().includes(query.toLowerCase()) ||
        station.City.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matchingSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion['Station Name']);
    setSuggestions([]);
  };



  const bookAppointment = async () => {
    if (!selectedStation || !date || !time) {
      alert("Please select a station, date, and time.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/book`,
        {
          station: selectedStation["Station Name"],
          date,
          time,
          estimatedChargeTime,
          urgencyLevel,
          currentBattery: batteryLevel,
          targetBattery: targetLevel
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert("Booking successful!");

      setChargingSlots(prevSlots => {
        const updatedSlots = { ...prevSlots };
        if (updatedSlots[time] > 1) {
          updatedSlots[time] -= 1;
        } else {
          delete updatedSlots[time];
          setAvailableTimes(prevTimes => prevTimes.filter(t => t !== time));
        }
        return updatedSlots;
      });

      closeModal();
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again later.");
    }
  };




  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
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

  const toggleFavorite = async (station) => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      alert('Please log in to manage favorites!');
      return;
    }

    try {
      const userEmail = loggedInUser.toLowerCase();
      const isFavorite = station.likedBy && Array.isArray(station.likedBy) && station.likedBy.includes(userEmail);

      if (isFavorite) {

        await axios.delete(`http://localhost:3001/api/stations/${station._id}/unlike`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          data: { user: userEmail },
        });


        setStations((prevStations) =>
          prevStations.map((s) =>
            s._id === station._id
              ? { ...s, likedBy: Array.isArray(s.likedBy) ? s.likedBy.filter((email) => email !== userEmail) : [] }
              : s
          )
        );
      } else {

        await axios.post(`http://localhost:3001/api/stations/${station._id}/like`,
          { user: userEmail },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

          { user: loggedInUser.toLowerCase() },

          { user: userEmail },

          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );


        setStations((prevStations) =>
          prevStations.map((s) =>
            s._id === station._id
              ? { ...s, likedBy: [...(Array.isArray(s.likedBy) ? s.likedBy : []), userEmail] }
              : s
          )
        );
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };



  // Function to navigate to the appointment page with the station details
  const navigateToAppointment = (station) => {
    navigate('/appointment', { state: { station } });
  };


  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const favoriteKey = `favorites_${loggedInUser}`;
      const savedFavorites = JSON.parse(localStorage.getItem(favoriteKey)) || [];
      setFavorites(savedFavorites.map((station) => station['Station Name']));
    }
  }, []);

  // פונקציה לטיפול בסיום טעינת המפה
  const handleMapLoad = (index) => {
    setMapLoading(prev => ({
      ...prev,
      [index]: false
    }));
  };

  // פונקציה לטיפול בתחילת טעינת המפה
  const handleMapLoadStart = (index) => {
    setMapLoading(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // הוספת סגנון האנימציה ל-head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);


  // פונקציה לטיפול בתחילת טעינת המפה
  const handleMapLoadStart = (index) => {
    setMapLoading(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // הוספת סגנון האנימציה ל-head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);


  return (
    <div className="home-container" onClick={() => setSuggestions([])}>
      <div className="logo-container">
        <img src={logo} alt="EVision Logo" className="logo" />
      </div>

      {/* Welcome user by name */}
      <div className="user-welcome-bar">
        <h2>Welcome, {userName || 'User'}</h2>
      </div>

      <div className="location-bar">
        <p>{loadingLocation ? 'Loading...' : userLocation} </p>
        <button className="refresh-location-button" onClick={fetchUserLocation}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="search-bar-container" ref={suggestionsRef} onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          className="search-bar"
          placeholder="Search stations by address..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion['Station Name']} - {suggestion.City}
              </li>
            ))}
          </ul>
        )}
      </div>


      {loadingStations ? (
        <div className="station-list">
          {/* תבנית טעינה (סקלטון UI) */}
          {[1, 2, 3].map((skeleton, index) => (
            <div key={`skeleton-${index}`} className="station-card skeleton">
              <div className="skeleton-section">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
              </div>
              <div className="skeleton-section buttons">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
              <div className="skeleton-map"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="station-list">
          {paginatedStations.map((station, index) => (
            <div key={index} className="station-card" style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              padding: '15px',
              margin: '0 0 16px 0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              background: 'white',
              position: 'relative',
              overflow: 'hidden',
              gap: '10px'
            }}>
              {/* Right side - station info and details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* Station details */}
                <div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    marginTop: '0',
                    marginBottom: '10px'
                  }}>{station['Station Name']}</h3>

                  <div style={{ marginBottom: '10px' }}>
                    <p style={{
                      margin: '5px 0',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}><strong>Address:</strong> {station.Address}</p>
                    <p style={{
                      margin: '5px 0',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}><strong>City:</strong> {station.City}</p>
                    <p style={{
                      margin: '5px 0',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}><strong>Charging Stations:</strong> {station['Duplicate Count']}</p>
                  </div>
                </div>


                {/* Waze logo and button */}
                <img
                  src={wazeIcon}
                  alt="Waze Navigation"
                  className="waze-logo"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    bottom: '10px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    padding: '5px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    zIndex: 999,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'block'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&navigate=yes`, '_blank')
                  }}
                />
              </div>

              {/* Buttons in the station card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: '0 15px',
                gap: '10px',
                position: 'relative',
                marginRight: '35px',
                marginLeft: '-40px',
                marginTop: '-10px'
              }}>
                {/* Distance and favorites icon */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '5px',
                  marginBottom: '5px',
                  position: 'relative',
                  width: '100%',
                  marginRight: '15px',
                  marginTop: '5px'
                }}>
                  {/* Favorites icon */}
                  <div
                    style={{
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(station);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={station.likedBy && localStorage.getItem('loggedInUser') ?
                        (station.likedBy.includes(localStorage.getItem('loggedInUser')?.toLowerCase() || '') ? '#ef4444' : 'none') : 'none'}
                      stroke={station.likedBy && localStorage.getItem('loggedInUser') ?
                        (station.likedBy.includes(localStorage.getItem('loggedInUser')?.toLowerCase() || '') ? '#ef4444' : '#777777') : '#777777'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </div>

                  {/* Distance icon */}
                  <div style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {calculateDistance(latitude, longitude, station.Latitude, station.Longitude)} km
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    border: '2px solid #3B82F6',
                    background: 'white',
                    color: '#333333',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStation(station);
                    setDate("");
                    setTime("");
                    setAvailableTimes([]);
                    setShowModal(true);
                  }}
                >

                  Book Appointment
                </button>

                <button
                  type="button"
                  style={{
                    border: '2px solid #3B82F6',
                    background: 'white',
                    color: '#333333',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startCharging(station);
                  }}
                >
                  Start Charging
                </button>

                <button
                  type="button"
                  style={{
                    border: '2px solid #3B82F6',
                    background: 'white',
                    color: '#333333',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/charging-queue/${encodeURIComponent(station['Station Name'])}/${today}`);
                  }}
                >
                  View Queue
                </button>
              </div>

              {/* Left side - the map (now optimized) */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                height: '220px',
                minWidth: '220px'
              }}>
                {showFullMap[index] ? (
                  // אם המשתמש לחץ, להציג iframe
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&location=${station.Latitude},${station.Longitude}&heading=210&pitch=10&fov=90`}
                      width="100%"
                      height="100%"
                      style={{
                        border: 'none',
                        height: '220px',
                        borderRadius: '8px'
                      }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => handleFullMapLoad(index)}
                    ></iframe>

                    {/* גלגל טעינה למפה המלאה */}
                    {fullMapLoading[index] && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        zIndex: 20
                      }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          border: '5px solid rgba(0, 0, 0, 0.1)',
                          borderLeft: '5px solid #3B82F6',
                          borderRadius: '50%',
                          animation: 'spin 1.2s linear infinite'
                        }} />
                      </div>
                    )}
                  </div>
                ) : (
                  // תמונה סטטית כברירת מחדל
                  <div
                    onClick={() => toggleFullMap(index)}
                    style={{
                      backgroundImage: `url(https://www.openstreetmap.org/export/embed.html?bbox=${station.Longitude - 0.005},${station.Latitude - 0.005},${station.Longitude + 0.005},${station.Latitude + 0.005}&layer=mapnik)`,
                      backgroundColor: '#e9eef2',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {/* כאן נשים iframe של מפה במקום רק תמונה */}
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${station.Longitude - 0.005},${station.Latitude - 0.005},${station.Longitude + 0.005},${station.Latitude + 0.005}&layer=mapnik&marker=${station.Latitude},${station.Longitude}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '8px',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      onLoad={() => handleMapLoad(index)}
                      onLoadStart={() => handleMapLoadStart(index)}
                    />

                    {/* גלגל טעינה - יוצג רק כשהמפה בטעינה */}
                    {(mapLoading[index] === true) && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e9eef2',
                        borderRadius: '8px',
                        zIndex: 15
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '4px solid rgba(0, 0, 0, 0.1)',
                          borderLeft: '4px solid #3B82F6',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      </div>
                    )}

                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(200, 200, 200, 0.2)',
                      borderRadius: '8px',
                      zIndex: 10
                    }}>
                      <div className="map-overlay" style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        position: 'absolute',
                        top: '45%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'max-content',
                        maxWidth: '90%',
                        textAlign: 'center',
                        fontSize: 'clamp(14px, 3vw, 16px)'
                      }}>
                        Click to view map
                      </div>
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'white',
                        borderRadius: '5px',
                        padding: '3px 6px',
                        fontSize: '11px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        zIndex: 10
                      }}
                    >
                      OpenStreetMap
                    </div>
                  </div>
                )}

              </div>
              <div className="skeleton-section buttons">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
              <div className="skeleton-map"></div>
            </div>

          ))}

          {/* כפתור לטעינת תחנות נוספות */}
          {paginatedStations.length < filteredStations.length && (
            <button
              className="load-more-button"
              onClick={handleLoadMoreStations}
            >
              Load more stations
            </button>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Book an appointment for {selectedStation['Station Name']}</h2>
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.3)',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔋 Current Battery Level: {batteryLevel}%
            </div>
            {/* Select Car Model */}
            <label htmlFor="carModel">Select Car Model:</label>
            <select
              id="carModel"
              value={selectedCarModel}
              onChange={(e) => setSelectedCarModel(e.target.value)}
            >
              <option value="">Select Car Model</option>
              {Object.keys(carModelsData).map((carModel, index) => (
                <option key={index} value={carModel}>
                  {carModel}
                </option>
              ))}
            </select>

            {/* Battery Level (editable) */}
            <label htmlFor="batteryLevel">Battery Level (%):</label>
            <input
              id="batteryLevel"
              type="number"
              min="0"
              max="100"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(e.target.value)}
            />

            {/* Target Battery Level */}
            <label htmlFor="targetLevel">Target Battery Level (%):</label>
            <input
              id="targetLevel"
              type="number"
              min="0"
              max="100"
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
            />

            {/* Display Estimated Charge Time */}
            <div>
              ⏱ Estimated Charging Time: <strong>{estimatedChargeTime} minutes</strong>
            </div>

            <label htmlFor="date">Select Date:</label>
            <input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                const selectedDate = e.target.value;
                if (selectedDate < today) {
                  alert("You cannot select a past date!");
                  setDate(today);
                  fetchAvailableTimes(today);
                } else {
                  setDate(selectedDate);
                  setTime("");
                  fetchAvailableTimes(selectedDate);
                }
              }}
            />

            <label htmlFor="time">Select Time:</label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={availableTimes.length === 0}
            >
              <option value="">-- Select Time --</option>
              {availableTimes.map((availableTime, index) => (
                <option key={index} value={availableTime}>
                  {availableTime}
                </option>
              ))}
            </select>

            {date && availableTimes.length === 0 && (
              <p style={{ color: "red" }}>
                {date === today
                  ? "⚠️ No more available slots for today. Please choose another date."
                  : "No available times for this date."}
              </p>
            )}

            {/* Modal to book an appointment */}

            <button
              onClick={bookAppointment}
              disabled={!isAvailable || !time}
              style={{
                background: "white",
                color: "#3B82F6",
                border: "2px solid #3B82F6",
                padding: "14px 28px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginTop: "15px",
                width: "100%",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)"
              }}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}


              position: 'relative',
              overflow: 'hidden',
              gap: '10px'
            }}>
              {/* Right side - station info and details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* Station details */}
                <div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    marginTop: '0',
                    marginBottom: '10px'
                  }}>{station['Station Name']}</h3>

                  <div style={{ marginBottom: '10px' }}>
                    <p style={{
                      margin: '5px 0',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}><strong>Address:</strong> {station.Address}</p>
                    <p style={{
                      margin: '5px 0',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}><strong>City:</strong> {station.City}</p>
                    <p style={{
                      margin: '5px 0',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}><strong>Charging Stations:</strong> {station['Duplicate Count']}</p>
                  </div>
                </div>

                {/* Waze logo and button */}
                <img
                  src={wazeIcon}
                  alt="Waze Navigation"
                  className="waze-logo"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    bottom: '10px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    padding: '5px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    zIndex: 999,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'block'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&navigate=yes`, '_blank')
                  }}
                />
              </div>


              <button
                type="button"
                style={{
                  border: '2px solid #3B82F6',
                  background: 'white',
                  color: '#333333',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',

              {/* Buttons in the station card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: '0 15px',
                gap: '10px',
                position: 'relative',
                marginRight: '35px',
                marginLeft: '-40px',
                marginTop: '-10px'
              }}>
                {/* Distance and favorites icon */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '5px',
                  marginBottom: '5px',
                  position: 'relative',

                  width: '100%',
                  marginRight: '15px',
                  marginTop: '5px'
                }}>
                  {/* Favorites icon */}
                  <div
                    style={{
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(station);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={station.likedBy && localStorage.getItem('loggedInUser') ?
                        (station.likedBy.includes(localStorage.getItem('loggedInUser')?.toLowerCase() || '') ? '#ef4444' : 'none') : 'none'}
                      stroke={station.likedBy && localStorage.getItem('loggedInUser') ?
                        (station.likedBy.includes(localStorage.getItem('loggedInUser')?.toLowerCase() || '') ? '#ef4444' : '#777777') : '#777777'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </div>

                  {/* Distance icon */}
                  <div style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {calculateDistance(latitude, longitude, station.Latitude, station.Longitude)} km
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    border: '2px solid #3B82F6',
                    background: 'white',
                    color: '#333333',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStation(station);
                    setDate("");
                    setTime("");
                    setAvailableTimes([]);
                    setShowModal(true);
                  }}
                >
                  Book Appointment
                </button>

                <button
                  type="button"
                  style={{
                    border: '2px solid #3B82F6',
                    background: 'white',
                    color: '#333333',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startCharging(station);
                  }}
                >
                  Start Charging
                </button>

                <button
                  type="button"
                  style={{
                    border: '2px solid #3B82F6',
                    background: 'white',
                    color: '#333333',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/charging-queue/${encodeURIComponent(station['Station Name'])}/${today}`);
                  }}
                >
                  View Queue
                </button>
              </div>

              {/* Left side - the map (now optimized) */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                height: '220px',
                minWidth: '220px'
              }}>
                {showFullMap[index] ? (
                  // אם המשתמש לחץ, להציג iframe
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&location=${station.Latitude},${station.Longitude}&heading=210&pitch=10&fov=90`}
                      width="100%"
                      height="100%"
                      style={{
                        border: 'none',
                        height: '220px',
                        borderRadius: '8px'
                      }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => handleFullMapLoad(index)}
                    ></iframe>

                    {/* גלגל טעינה למפה המלאה */}
                    {fullMapLoading[index] && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        zIndex: 20
                      }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          border: '5px solid rgba(0, 0, 0, 0.1)',
                          borderLeft: '5px solid #3B82F6',
                          borderRadius: '50%',
                          animation: 'spin 1.2s linear infinite'
                        }} />
                      </div>
                    )}
                  </div>
                ) : (
                  // תמונה סטטית כברירת מחדל
                  <div
                    onClick={() => toggleFullMap(index)}
                    style={{
                      backgroundImage: `url(https://www.openstreetmap.org/export/embed.html?bbox=${station.Longitude - 0.005},${station.Latitude - 0.005},${station.Longitude + 0.005},${station.Latitude + 0.005}&layer=mapnik)`,
                      backgroundColor: '#e9eef2',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {/* כאן נשים iframe של מפה במקום רק תמונה */}
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${station.Longitude - 0.005},${station.Latitude - 0.005},${station.Longitude + 0.005},${station.Latitude + 0.005}&layer=mapnik&marker=${station.Latitude},${station.Longitude}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '8px',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      onLoad={() => handleMapLoad(index)}
                      onLoadStart={() => handleMapLoadStart(index)}
                    />

                    {/* גלגל טעינה - יוצג רק כשהמפה בטעינה */}
                    {(mapLoading[index] === true) && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e9eef2',
                        borderRadius: '8px',
                        zIndex: 15
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '4px solid rgba(0, 0, 0, 0.1)',
                          borderLeft: '4px solid #3B82F6',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      </div>
                    )}

                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(200, 200, 200, 0.2)',
                      borderRadius: '8px',
                      zIndex: 10
                    }}>
                      <div className="map-overlay" style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        position: 'absolute',
                        top: '45%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'max-content',
                        maxWidth: '90%',
                        textAlign: 'center',
                        fontSize: 'clamp(14px, 3vw, 16px)'
                      }}>
                        Click to view map
                      </div>
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'white',
                        borderRadius: '5px',
                        padding: '3px 6px',
                        fontSize: '11px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        zIndex: 10
                      }}
                    >
                      OpenStreetMap
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}


            <div
              className={`heart-icon ${station.likedBy.includes(localStorage.getItem('loggedInUser').toLowerCase()) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(station);
              }}
            >
              <i className={`fa-${station.likedBy.includes(localStorage.getItem('loggedInUser').toLowerCase()) ? 'solid' : 'regular'} fa-heart`}></i>

            {/* Left side - the map */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
              height: '220px',
              minWidth: '220px'
            }}>
              {/* Google Street View iframe */}
              <iframe
                src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&location=${station.Latitude},${station.Longitude}&heading=210&pitch=10&fov=90`}
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                  height: '220px'
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

            </div>
          </div>
        ))}
      </div>

          {/* כפתור לטעינת תחנות נוספות */}
          {paginatedStations.length < filteredStations.length && (
            <button
              className="load-more-button"
              onClick={handleLoadMoreStations}
            >
              Load more stations
            </button>
          )}
        </div>
      )}


      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Book an appointment for {selectedStation['Station Name']}</h2>
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.3)',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔋 Current Battery Level: {batteryLevel}%
            </div>
            {/* Select Car Model */}
            <label htmlFor="carModel">Select Car Model:</label>
            <select
              id="carModel"
              value={selectedCarModel}
              onChange={(e) => setSelectedCarModel(e.target.value)}
            >
              <option value="">Select Car Model</option>
              {Object.keys(carModelsData).map((carModel, index) => (
                <option key={index} value={carModel}>
                  {carModel}
                </option>
              ))}
            </select>

            {/* Battery Level (editable) */}
            <label htmlFor="batteryLevel">Battery Level (%):</label>
            <input
              id="batteryLevel"
              type="number"
              min="0"
              max="100"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(e.target.value)}
            />

            {/* Target Battery Level */}
            <label htmlFor="targetLevel">Target Battery Level (%):</label>
            <input
              id="targetLevel"
              type="number"
              min="0"
              max="100"
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
            />

            {/* Display Estimated Charge Time */}
            <div>
              ⏱ Estimated Charging Time: <strong>{estimatedChargeTime} minutes</strong>
            </div>

            <label htmlFor="date">Select Date:</label>
            <input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                const selectedDate = e.target.value;
                if (selectedDate < today) {
                  alert("You cannot select a past date!");
                  setDate(today);
                  fetchAvailableTimes(today);
                } else {
                  setDate(selectedDate);
                  setTime("");
                  fetchAvailableTimes(selectedDate);
                }
              }}
            />

            <label htmlFor="time">Select Time:</label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={availableTimes.length === 0}
            >
              <option value="">-- Select Time --</option>
              {availableTimes.map((availableTime, index) => (
                <option key={index} value={availableTime}>
                  {availableTime}
                </option>
              ))}
            </select>

            {date && availableTimes.length === 0 && (
              <p style={{ color: "red" }}>
                {date === today
                  ? "⚠️ No more available slots for today. Please choose another date."
                  : "No available times for this date."}
              </p>
            )}

            {/* Modal to book an appointment */}

            <button
              onClick={bookAppointment}
              disabled={!isAvailable || !time}
              style={{
                background: "white",
                color: "#3B82F6",
                border: "2px solid #3B82F6",
                padding: "14px 28px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginTop: "15px",
                width: "100%",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)"
              }}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}



      <div className="bottom-bar">
        <button className="bottom-bar-button logout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>

        <Link to="/personal-area" className="bottom-bar-button">
          <i className="fas fa-user"></i> Personal Area
        </Link>
        <Link to="/favorites" className="bottom-bar-button">
          <i className="fas fa-heart"></i> Favorites
        </Link>
        <Link to="/home" className="bottom-bar-button">
          <i className="fas fa-home"></i> Home
        </Link>
        <Link to="/map" className="bottom-bar-button">

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

      {/* Bottom Navigation */}
      <div className="bottom-navigation">
        <div className="nav-item active">
          <HomeIcon />
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/map')}>
          <MapIcon />
          <span>Map</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/favorites')}>
          <HeartIcon />
          <span>Favorites</span>
        </div>

        <div className="nav-item" onClick={() => navigate('/personal-area')}>

          <UserIcon />
          <span>Profile</span>
        </div>
        <div className="nav-item" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </div>

      </div>
    </div>
  );
};

export default Home;
