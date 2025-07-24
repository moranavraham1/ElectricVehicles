import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../designs/Home.css';
import logo from '../assets/logo.jpg';
import wazeIcon from '../assets/WAZE.jpg';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';

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
  const [fullMapLoading, setFullMapLoading] = useState({});  // State for booking management
  const [userBookings, setUserBookings] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedStationForAppointment, setSelectedStationForAppointment] = useState(null);
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [nearestBooking, setNearestBooking] = useState(null);
  const [waitingTimes, setWaitingTimes] = useState({}); // Store waiting times for each booking

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
  // Legacy function - now redirects to new appointment-based logic
  const startCharging = (station) => {
    handleStartCharging(station);
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
    if (latitude && longitude) {
      fetchStations();
    } else {
      // Ensure stations are fetched even if location isn't available yet
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
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const filtered = stations.filter(
        (station) =>
          station['Station Name'].toLowerCase().includes(normalizedQuery) ||
          station.City.toLowerCase().includes(normalizedQuery) ||
          station.Address.toLowerCase().includes(normalizedQuery)
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
        // Set default location to Tel Aviv
        setLatitude(32.0853);
        setLongitude(34.7818);
        setUserLocation('Tel Aviv, Israel');
        setLoadingLocation(false);
        // Refresh stations with default location
        fetchStations();
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
      
      // Always fetch from server to get the latest favorites data
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/stations`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if(process.env.NODE_ENV === 'development'){
      console.log('API Response for stations:', response.data);
      }
      let stationsWithDistance;
      
      if (latitude && longitude) {
        // If location is available, calculate distances
        stationsWithDistance = response.data.map((station) => ({
          ...station,
          distance: calculateDistance(latitude, longitude, station.Latitude, station.Longitude),
        }));
        // Sort by distance
        const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
        setStations(sortedStations);
        setFilteredStations(sortedStations);
      } else {
        // If no location, sort alphabetically by station name
        const sortedStations = response.data.sort((a, b) => 
          a['Station Name'].localeCompare(b['Station Name'])
        );
        setStations(sortedStations);
        setFilteredStations(sortedStations);
      }

      // Save to cache
      setCachedStations(response.data);

    } catch (error) {
      console.error('Error fetching stations:', error);
      
      // Try to get cached data as fallback
      const cachedData = getCachedStations();
      if (cachedData) {
        let stationsWithDistance;
        if (latitude && longitude) {
          // If location is available, calculate distances
          stationsWithDistance = cachedData.map((station) => ({
            ...station,
            distance: calculateDistance(latitude, longitude, station.Latitude, station.Longitude),
          }));
          // Sort by distance
          const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
          setStations(sortedStations);
          setFilteredStations(sortedStations);
        } else {
          // If no location, sort alphabetically by station name
          const sortedStations = cachedData.sort((a, b) => 
            a['Station Name'].localeCompare(b['Station Name'])
          );
          setStations(sortedStations);
          setFilteredStations(sortedStations);
        }
      }
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
      const maxCapacity = response.data.maxCapacity || selectedStation["Duplicate Count"] || 1;
      console.log(`🔌 Station capacity: ${maxCapacity} charging points`);
      let updatedChargingSlots = {};

      // Get current time
      const now = new Date();
      // Calculate one hour from now threshold
      const oneHourFromNow = new Date(now);
      oneHourFromNow.setHours(now.getHours() + 1);
      
      // Get ALL possible time slots from the response, not just available ones
      // This is important to include fully booked slots that are one hour ahead
      let allTimeSlots = [];
      
      // Extract all time slots from the bookingsPerTime object
      for (const timeSlot in bookingsPerTime) {
        if (!availableTimeSlots.includes(timeSlot)) {
          allTimeSlots.push(timeSlot);
        }
      }
      
      // Combine with available time slots to get all possible slots
      allTimeSlots = [...new Set([...availableTimeSlots, ...allTimeSlots])];
      console.log("💡 All possible time slots:", allTimeSlots);
      
      // Process each time slot
      const processedTimeSlots = allTimeSlots.map(time => {
        const bookedCount = bookingsPerTime[time] || 0;
        const remainingSlots = maxCapacity - bookedCount;
        updatedChargingSlots[time] = remainingSlots;
        return { time, remainingSlots };
      }).filter(({ time, remainingSlots }) => {
        const [hour, minute] = time.split(":");
        
        // Create date object for this time slot
        const slotDateTime = new Date(`${selectedDate}T${hour}:${minute}:00`);
        
        // Check if slot is at least one hour in the future
        const isOneHourAhead = slotDateTime >= oneHourFromNow;
        
        // If it's at least one hour ahead, include it regardless of capacity
        // Otherwise, check if there are remaining slots
        const shouldInclude = isOneHourAhead || remainingSlots > 0;
        
        console.log(`💡 Time slot ${time} - Is one hour ahead: ${isOneHourAhead}, Remaining slots: ${remainingSlots}, Include: ${shouldInclude}`);
        
        // Still need to be after current time (basic check)
        return slotDateTime > now && shouldInclude;
      }).map(item => item.time);

      // Sort time slots chronologically
      const sortedTimeSlots = processedTimeSlots.sort((a, b) => {
        const [aHour, aMinute] = a.split(":").map(Number);
        const [bHour, bMinute] = b.split(":").map(Number);
        
        if (aHour !== bHour) {
          return aHour - bHour;
        }
        return aMinute - bMinute;
      });

      console.log("💡 Final sorted time slots:", sortedTimeSlots);

      setAvailableTimes(sortedTimeSlots);
      setChargingSlots(updatedChargingSlots);
      setIsAvailable(sortedTimeSlots.length > 0);
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
      // 🔒 CRITICAL: Re-check availability immediately before booking to prevent race conditions
      console.log("🔍 Performing final availability check before booking...");
      
      const availabilityResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/check-availability`,
        {
          station: selectedStation["Station Name"] || selectedStation,
          date: date,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { availableTimes, maxCapacity, bookingsPerTime } = availabilityResponse.data;
      const currentBookingsForTime = bookingsPerTime[time] || 0;
      
      console.log(`🔍 Final check - Time ${time}: ${currentBookingsForTime}/${maxCapacity} slots used`);
      
      // Check if time is at least one hour from now
      const now = new Date();
      const oneHourFromNow = new Date(now);
      oneHourFromNow.setHours(now.getHours() + 1);
      
      const [hour, minute] = time.split(":");
      const selectedDateTime = new Date(`${date}T${hour}:${minute}:00`);
      const isOneHourAhead = selectedDateTime >= oneHourFromNow;
      
      // Check if the selected time is still available or if it's at least one hour ahead
      if (!availableTimes.includes(time) && !isOneHourAhead) {
        alert(`⚠️ Sorry! This time slot (${time}) is no longer available.\n\nStation "${selectedStation["Station Name"]}" has ${maxCapacity} charging point${maxCapacity > 1 ? 's' : ''} and all are now reserved for this time.\n\nPlease select a different time slot.`);
        
        // Refresh available times to show current status
        setAvailableTimes(availableTimes);
        setTime(""); // Clear the selected time
        return;
      }

      // Submit booking request - always as pending status
      // The appointment scheduler will process it ~1 hour before the appointment time
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

      alert("Booking request submitted successfully! Your booking will remain in 'pending' status until approximately 1 hour before the scheduled time. At that point, our system will process all pending requests and you will receive a confirmation email if your booking is approved.");

      // Refresh bookings list to update status
      fetchUserBookings();

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
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        if (errorData.capacity && errorData.currentBookings) {
          // Check if the booking is at least one hour ahead
          const now = new Date();
          const oneHourFromNow = new Date(now);
          oneHourFromNow.setHours(now.getHours() + 1);
          
          const [hour, minute] = time.split(":");
          const selectedDateTime = new Date(`${date}T${hour}:${minute}:00`);
          const isOneHourAhead = selectedDateTime >= oneHourFromNow;
          
          if (isOneHourAhead) {
            alert(`⚠️ There seems to be an issue with your booking request. For time slots more than 1 hour ahead, you should be able to make a booking even if others have pending bookings.\n\nPlease try again or contact support if the issue persists.`);
          } else {
            alert(`⚠️ This time slot is fully booked!\n\nStation "${selectedStation["Station Name"]}" has ${errorData.capacity} charging point${errorData.capacity > 1 ? 's' : ''} and all are reserved for ${time} on ${date}.\n\nPlease choose a different time slot.`);
          }
        } else {
          alert(`❌ Booking failed: ${errorData.message || 'Unknown error'}`);
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        alert(`Booking failed: ${error.response.data.message}`);
      } else {
        alert("Failed to book appointment. Please try again later.");
      }
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
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/stations/${station._id}/unlike`, {
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
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stations/${station._id}/like`,
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

  // Use effects
  useEffect(() => {
    fetchUserLocation();
    fetchStations();
    fetchUserBookings();
  }, []);  // Function to fetch user bookings
  const fetchUserBookings = async () => {
    try {
      console.log("📡 Fetching user bookings...");
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("loggedInUser");
      console.log("📧 User email from localStorage:", userEmail);
      console.log("🔑 Token exists:", !!token);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📊 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📋 Fetched bookings data:", data);
        setUserBookings(data);
        
        // Fetch waiting times for approved bookings
        await fetchWaitingTimes(data);
      } else {
        console.error("❌ Failed to fetch bookings, status:", response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
    }
  };

  // Function to fetch waiting times for user bookings
  const fetchWaitingTimes = async (bookingsData) => {
    try {
      const token = localStorage.getItem("token");
      const waitingTimesPromises = bookingsData
        .filter(booking => booking.status === 'approved')
        .map(async (booking) => {
          try {
            const encodedStation = encodeURIComponent(booking.station);
            const response = await fetch(
              `${process.env.REACT_APP_BACKEND_URL}/api/bookings/waiting-time/${encodedStation}/${booking.date}/${booking.time}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              return {
                bookingId: booking._id,
                waitingTime: data.waitingTime,
                stationFull: data.stationFull
              };
            }
          } catch (error) {
            console.error(`Error fetching waiting time for booking ${booking._id}:`, error);
          }
          return null;
        });

      const waitingTimesResults = await Promise.all(waitingTimesPromises);
      const waitingTimesMap = {};
      
      waitingTimesResults.forEach(result => {
        if (result) {
          waitingTimesMap[result.bookingId] = {
            waitingTime: result.waitingTime,
            stationFull: result.stationFull
          };
        }
      });
      
      setWaitingTimes(waitingTimesMap);
    } catch (error) {
      console.error("Error fetching waiting times:", error);
    }
  };

  // Refresh bookings when component mounts and when coming back from other pages
  useEffect(() => {
    fetchUserBookings();
  }, [location.pathname]);

  // Refresh bookings every minute to keep status up to date
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserBookings();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);
  // Function to check booking status for a specific station
  const checkBookingStatus = (stationName) => {
    console.log("🔍 Checking booking status for station:", stationName);
    const userEmail = localStorage.getItem('loggedInUser');
    console.log("👤 User email for filtering:", userEmail);
    console.log("📋 All user bookings:", userBookings);
    console.log("📋 userBookings length:", userBookings.length);
      const stationBookings = userBookings.filter(
      booking => {
        console.log("🔍 Comparing booking:", booking);
        console.log("   booking.user:", booking.user);
        console.log("   userEmail:", userEmail);
        console.log("   booking.station:", booking.station);
        console.log("   stationName:", stationName);
        
        const userMatch = booking.user === userEmail;
        // Case-insensitive comparison for station names
        const stationMatch = booking.station.toLowerCase().trim() === stationName.toLowerCase().trim();
        console.log("   userMatch:", userMatch, "stationMatch:", stationMatch);
        console.log("   booking.station.toLowerCase():", booking.station.toLowerCase().trim());
        console.log("   stationName.toLowerCase():", stationName.toLowerCase().trim());
        
        return userMatch && stationMatch;
      }
    );

    console.log("🎯 Filtered station bookings:", stationBookings);

    if (stationBookings.length === 0) {
      console.log("❌ No bookings found for this station");
      return {
        hasBooking: false,
        status: 'no_booking',
        message: 'No booking found for this station'
      };
    }

    // Find bookings within the acceptable time window, considering waiting time
    const now = new Date();
    console.log("⏰ Current time:", now);
    
    const relevantBookings = stationBookings
      .map(booking => {
        const waitingInfo = waitingTimes[booking._id];
        const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
        
        // Calculate actual start time considering waiting time
        const actualStartTime = waitingInfo ? 
          new Date(bookingDateTime.getTime() + (waitingInfo.waitingTime * 60000)) : 
          bookingDateTime;
          
        return {
          ...booking,
          bookingDateTime,
          actualStartTime,
          waitingInfo
        };
      })
      .filter(booking => {
        // Use actual start time (including waiting time) for the window calculation
        const timeDiffInMinutes = (now - booking.actualStartTime) / (1000 * 60);
        console.log("📅 Booking datetime:", booking.bookingDateTime);
        console.log("⏰ Actual start time (with waiting):", booking.actualStartTime);
        console.log("⏱️ Time difference from actual start (positive = past, negative = future):", timeDiffInMinutes);
        
        // If station is full and there's waiting time, user must wait
        if (booking.waitingInfo && booking.waitingInfo.stationFull && booking.waitingInfo.waitingTime > 0) {
          console.log("🚫 Station is full, user must wait");
          return false;
        }
        
        // CRITICAL FIX: Check if there are other users whose charging time would overlap with this booking
        // If the waiting time > 0, it means someone else is charging and we must wait
        if (booking.waitingInfo && booking.waitingInfo.waitingTime > 0) {
          console.log("⏰ Must wait for others to finish charging:", booking.waitingInfo.waitingTime, "minutes");
          return false; 
        }
        
        // Accept bookings from 10 minutes before to 10 minutes after actual start time
        const isWithinWindow = timeDiffInMinutes >= -10 && timeDiffInMinutes <= 10;
        console.log("✅ Is within 10-minute window of actual start:", isWithinWindow);
        return isWithinWindow;
      })
      .sort((a, b) => Math.abs((now - a.actualStartTime)) - Math.abs((now - b.actualStartTime))); // Sort by closest to actual start time

    console.log("🎯 Relevant bookings within time window:", relevantBookings);

    if (relevantBookings.length === 0) {
      // If no bookings in the current window, find the next upcoming booking
      const upcomingBookings = stationBookings
        .map(booking => {
          const waitingInfo = waitingTimes[booking._id];
          const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
          const actualStartTime = waitingInfo ? 
            new Date(bookingDateTime.getTime() + (waitingInfo.waitingTime * 60000)) : 
            bookingDateTime;
            
          return {
            ...booking,
            bookingDateTime,
            actualStartTime,
            waitingInfo
          };
        })
        .filter(booking => booking.actualStartTime > now)
        .sort((a, b) => a.actualStartTime - b.actualStartTime);

      console.log("🔮 Next upcoming bookings:", upcomingBookings);

      if (upcomingBookings.length === 0) {
        console.log("⏰ No upcoming bookings");
        return {
          hasBooking: false,
          status: 'no_upcoming_booking',
          message: 'No upcoming bookings for this station'
        };
      }

      const nextBooking = upcomingBookings[0];
      console.log("📅 Next booking scheduled for later");
      
      // Include waiting time info in the message
      let message = `Next booking: ${nextBooking.bookingDateTime.toLocaleString()}`;
      if (nextBooking.waitingInfo && nextBooking.waitingInfo.waitingTime > 0) {
        message += ` (Expected wait: ${nextBooking.waitingInfo.waitingTime} minutes)`;
      }
      
      return {
        hasBooking: true,
        status: 'booking_scheduled',
        booking: nextBooking,
        message
      };
    }

    // If we have bookings within the window, use the closest one
    const closestBooking = relevantBookings[0];
    console.log("✅ Ready to charge with booking:", closestBooking);
    
    // CRITICAL FIX: Final check for any waiting time - if we have to wait, we can't charge yet
    if (closestBooking.waitingInfo && closestBooking.waitingInfo.waitingTime > 0) {
      console.log("⏰ Cannot start charging now - must wait:", closestBooking.waitingInfo.waitingTime, "minutes");
      
      return {
        hasBooking: true,
        status: 'booking_scheduled',
        booking: closestBooking,
        message: `Your booking is ready, but you need to wait approximately ${closestBooking.waitingInfo.waitingTime} minutes before charging as other users are currently using the station.`
      };
    }
    
    let message = 'You can start charging now!';
    return {
      hasBooking: true,
      status: 'ready_to_charge',
      booking: closestBooking,
      message
    };
  };
  // Enhanced start charging function
  const handleStartCharging = (station) => {
    console.log("🚗 handleStartCharging called with station:", station);
    console.log("🏢 Station name:", station['Station Name']);
    
    const bookingCheck = checkBookingStatus(station['Station Name']);
    console.log("📋 Booking check result:", bookingCheck);
    
    if (bookingCheck.status === 'ready_to_charge') {
      console.log("✅ User can start charging - navigating to charging page");
      
      // Extract all necessary data from the booking for charging
      const booking = bookingCheck.booking;
      
      // User can start charging - pass all required data to the charging page
      navigate('/charging', { 
        state: { 
          station,
          date: booking.date,
          time: booking.time,
          estimatedChargeTime: booking.estimatedChargeTime || 30,
          currentBattery: booking.currentBattery || batteryLevel,
          targetBattery: booking.targetBattery || 80,
          booking: booking
        } 
      });
    } else {
      console.log("❌ User cannot start charging - showing appointment modal");
      console.log("📋 Setting appointment status to:", bookingCheck.status);
      // Show appointment modal
      setSelectedStationForAppointment(station);
      setAppointmentStatus(bookingCheck.status);
      setNearestBooking(bookingCheck.booking);
      setShowAppointmentModal(true);
    }
  };
  // Close appointment modal
  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedStationForAppointment(null);
    setAppointmentStatus('');
    setNearestBooking(null);
  };

  // Navigate to booking modal instead of appointment page
  const goToBookingFromModal = () => {
    closeAppointmentModal();
    // Open the booking modal
    setSelectedStation(selectedStationForAppointment);
    setDate("");
    setTime("");
    setAvailableTimes([]);
    setShowModal(true);
  };

  // Auto-refresh availability when modal is open to prevent race conditions
  useEffect(() => {
    let intervalId;
    
    if (showModal && selectedStation && date) {
      // Set up auto-refresh every 10 seconds when modal is open
      intervalId = setInterval(() => {
        console.log("🔄 Auto-refreshing availability to prevent race conditions...");
        fetchAvailableTimes(date);
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [showModal, selectedStation, date]);

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
          <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={station.likedBy && Array.isArray(station.likedBy) && 
                            station.likedBy.includes(localStorage.getItem('loggedInUser')?.toLowerCase()) ? 
                            "#FF6B6B" : "none"}
                      stroke={station.likedBy && Array.isArray(station.likedBy) && 
                             station.likedBy.includes(localStorage.getItem('loggedInUser')?.toLowerCase()) ? 
                             "#FF6B6B" : "currentColor"}
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
                </button>                <button
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
                    handleStartCharging(station);
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
                  // תמונה סטטית כברירת מחדל - מפה רגילה
                  <div
                    onClick={() => toggleFullMap(index)}
                    style={{
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
                    {/* מפה סטטית של OpenStreetMap */}
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
      )}      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Book an appointment for {selectedStation['Station Name']}</h2>
            
            {/* Real-time availability indicator */}
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#166534',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '12px' }}>🔄</span>
              Availability updates automatically every 10 seconds
            </div>
            
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
            />            <label htmlFor="time">Select Time:</label>
            <select
              id="time"
              value={time}
              onChange={async (e) => {
                const selectedTime = e.target.value;
                
                if (selectedTime) {
                  // 🔒 Real-time check when user selects a time
                  try {
                    console.log(`🔍 Checking if time ${selectedTime} is still available...`);
                    const availabilityResponse = await axios.post(
                      `${process.env.REACT_APP_BACKEND_URL}/api/bookings/check-availability`,
                      {
                        station: selectedStation["Station Name"] || selectedStation,
                        date: date,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      }
                    );

                    const { availableTimes, maxCapacity, bookingsPerTime } = availabilityResponse.data;
                    const currentBookingsForTime = bookingsPerTime[selectedTime] || 0;
                    
                    // Check if time is at least one hour from now
                    const now = new Date();
                    const oneHourFromNow = new Date(now);
                    oneHourFromNow.setHours(now.getHours() + 1);
                    
                    const [hour, minute] = selectedTime.split(":");
                    const selectedDateTime = new Date(`${date}T${hour}:${minute}:00`);
                    const isOneHourAhead = selectedDateTime >= oneHourFromNow;
                    
                    console.log(`🔍 Selected time: ${selectedTime} - Is one hour ahead: ${isOneHourAhead}`);
                    
                    // If time is fully booked and not at least one hour ahead, show warning
                    if (!availableTimes.includes(selectedTime) && !isOneHourAhead) {
                      alert(`⚠️ Sorry! The time slot ${selectedTime} is no longer available.\n\nStation "${selectedStation["Station Name"]}" has ${maxCapacity} charging point${maxCapacity > 1 ? 's' : ''} and all are now reserved for this time.\n\nPlease select a different time.`);
                      
                      // Update available times and clear selection
                      setAvailableTimes(availableTimes);
                      setTime("");
                      return;
                    }
                    
                    console.log(`✅ Time ${selectedTime} is acceptable for booking ${isOneHourAhead ? '(one hour ahead rule)' : '(slots available)'}`);
                  } catch (error) {
                    console.error("Error checking time availability:", error);
                    // Continue with selection even if check fails
                  }
                }
                
                setTime(selectedTime);
              }}
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
      )}      {/* Appointment Status Modal */}
      {showAppointmentModal && (
        <div className="modal-overlay" onClick={closeAppointmentModal}>
          <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Start Charging</h2>
            <div className="station-info">
              <h3>{selectedStationForAppointment?.['Station Name']}</h3>
              <p>{selectedStationForAppointment?.Address}, {selectedStationForAppointment?.City}</p>
            </div>            <div className="appointment-status-info">              {appointmentStatus === 'no_booking' && (
                <div className="status-message no-appointment">
                  <div className="status-icon">❌</div>
                  <div className="status-text">
                    <h4>No Booking Found</h4>
                    <p>You don't have any active reservations for this station. Please book a time slot to charge here.</p>
                  </div>
                </div>
              )}

              {appointmentStatus === 'no_upcoming_booking' && (
                <div className="status-message no-upcoming">
                  <div className="status-icon">⏰</div>
                  <div className="status-text">
                    <h4>No Upcoming Bookings</h4>
                    <p>You don't have any upcoming reservations for this station. Please book a new time slot to charge here.</p>
                  </div>
                </div>
              )}

              {appointmentStatus === 'ready_to_charge' && (
                <div className="status-message ready">
                  <div className="status-icon">✅</div>
                  <div className="status-text">
                    <h4>Ready to Charge!</h4>
                    <p>Your booking is within the 10-minute window. You can start charging now.</p>
                    {nearestBooking && (
                      <div className="appointment-details">
                        <p><strong>Booking:</strong> {new Date(nearestBooking.date).toLocaleDateString()} at {nearestBooking.time}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {appointmentStatus === 'booking_scheduled' && (
                <div className="status-message scheduled">
                  <div className="status-icon">📅</div>
                  <div className="status-text">
                    <h4>Booking Scheduled</h4>
                    <p>You have an upcoming booking for this station.</p>
                    {nearestBooking && (
                      <div className="appointment-details">
                        <p><strong>Next Booking:</strong></p>
                        <p>{new Date(nearestBooking.date).toLocaleDateString()} at {nearestBooking.time}</p>
                        <p className="time-notice">You can start charging 10 minutes before your booking time.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>            {/* Action buttons */}
            <div className="appointment-modal-actions">
              {appointmentStatus === 'ready_to_charge' ? (
                <div className="button-group">
                  <button
                    onClick={() => {
                      closeAppointmentModal();
                      navigate('/charging', { 
                        state: { 
                          station: selectedStationForAppointment,
                          booking: nearestBooking
                        } 
                      });
                    }}
                    className="primary-button"
                  >
                    Start Charging
                  </button>
                  <button
                    onClick={closeAppointmentModal}
                    className="secondary-button"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="button-group">                  <button
                    onClick={goToBookingFromModal}
                    className="primary-button"
                  >
                    Book Time Slot
                  </button>
                  <button
                    onClick={closeAppointmentModal}
                    className="secondary-button"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
