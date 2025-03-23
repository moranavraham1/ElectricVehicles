import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../designs/Home.css';
import wazeIcon from '../assets/WAZE.jpg';
import logo from '../assets/logo.jpg';


const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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
  const closeModal = () => {
    setShowModal(false);
    setDate('');
    setTime('');
    setAvailableTimes([]);
  };
  const [showNoTimesMessage, setShowNoTimesMessage] = useState(false);
  const startCharging = async (station) => {
    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/check-availability`,
        {
          station: station["Station Name"],
          date: today
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const availableTimes = response.data.availableTimes || [];

      // סינון רק לשעות שטרם עברו
      const now = new Date();
      const futureTimes = availableTimes.filter((time) => {
        const [hour, minute] = time.split(":").map(Number);
        const slot = new Date(today);
        slot.setHours(hour);
        slot.setMinutes(minute);
        return slot > now;
      });

      if (futureTimes.length === 0) {
        alert("⚠️ No available time slots remaining for today.");
        return;
      }

      const nextAvailableTime = futureTimes[0]; // הראשון שזמין באמת

      navigate("/charging", {
        state: {
          station,
          date: today,
          time: nextAvailableTime
        }
      });
    } catch (error) {
      console.error("⚠️ Error checking availability:", error);
      alert("Unable to check availability. Please try again.");
    }
  };



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
    fetchUserLocation();
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
      const response = await axios.get('http://localhost:3001/api/stations');
      const stationsWithDistance = response.data.map((station) => ({
        ...station,
        distance: calculateDistance(latitude, longitude, station.Latitude, station.Longitude),
      }));

      const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
      setStations(sortedStations);
      setFilteredStations(sortedStations);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };
  const [chargingSlots, setChargingSlots] = useState({});

  const fetchAvailableTimes = async (selectedDate) => {
    if (!selectedStation) return;

    setShowNoTimesMessage(false); // איפוס ההודעה בכל קריאה

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/check-availability`,
        { station: selectedStation["Station Name"], date: selectedDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

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
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(parseInt(hour));
        slotDateTime.setMinutes(parseInt(minute));
        return slotDateTime > now;
      });

      setAvailableTimes(availableTimeSlots);
      setChargingSlots(updatedChargingSlots);
      setIsAvailable(availableTimeSlots.length > 0);

      // הצגת ההודעה רק אחרי 10 שניות אם אין זמינות
      if (availableTimeSlots.length === 0) {
        setTimeout(() => {
          setShowNoTimesMessage(true);
        }, 10000); // 10 שניות
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
      setAvailableTimes([]);
      setChargingSlots({});
      setIsAvailable(false);
      setTimeout(() => {
        setShowNoTimesMessage(true);
      }, 10000);
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
        { station: selectedStation["Station Name"], date, time },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
      const isFavorite = station.likedBy.includes(loggedInUser.toLowerCase());
      if (isFavorite) {
        await axios.delete(`http://localhost:3001/api/stations/${station._id}/unlike`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          data: { user: loggedInUser.toLowerCase() },
        });

        setStations((prevStations) =>
          prevStations.map((s) =>
            s._id === station._id
              ? { ...s, likedBy: s.likedBy.filter((email) => email !== loggedInUser.toLowerCase()) }
              : s
          )
        );
      } else {
        await axios.post(`http://localhost:3001/api/stations/${station._id}/like`,
          { user: loggedInUser.toLowerCase() },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        setStations((prevStations) =>
          prevStations.map((s) =>
            s._id === station._id
              ? { ...s, likedBy: [...s.likedBy, loggedInUser.toLowerCase()] }
              : s
          )
        );
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };




  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const favoriteKey = `favorites_${loggedInUser}`;
      const savedFavorites = JSON.parse(localStorage.getItem(favoriteKey)) || [];
      setFavorites(savedFavorites.map((station) => station['Station Name']));
    }
  }, []);


  return (
    <div className="home-container" onClick={() => setSuggestions([])}>
      <div className="logo-container">
        <img src={logo} alt="EVision Logo" className="logo" />
      </div>

      <div className="location-bar">
        <p>{loadingLocation ? 'Loading...' : userLocation} 📍</p>
        <button className="refresh-location-button" onClick={fetchUserLocation}>
          🔄 Refresh Location
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

      <div className="station-list">
        {filteredStations.map((station, index) => (
          <div key={index} className="station-card">
            <div className="distance-badge">
              {calculateDistance(latitude, longitude, station.Latitude, station.Longitude)} km
            </div>

            <div className="station-details">
              <h3>{station['Station Name']}</h3>
              <p><strong>Address:</strong> {station.Address}</p>
              <p><strong>City:</strong> {station.City}</p>
              <p><strong>Charging Stations:</strong> {station['Duplicate Count']}</p>
              <div className="waze-container">
                <a
                  href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="waze-button"
                >
                  <img src={wazeIcon} alt="Waze" />
                </a>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
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
                📅 Book Appointment
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startCharging(station);
                }}
              >
                ⚡ Start Charging
              </button>
            </div>


            {/* Favorite Button */}
            <div
              className={`heart-icon ${station.likedBy.includes(localStorage.getItem('loggedInUser').toLowerCase()) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(station);
              }}
            >
              <i className={`fa-${station.likedBy.includes(localStorage.getItem('loggedInUser').toLowerCase()) ? 'solid' : 'regular'} fa-heart`}></i>
            </div>

            {/* Google Maps Street View */}
            <iframe
              title={`Street View of ${station['Station Name']}`}
              className="station-image-small"
              style={{
                borderRadius: '10px',
                border: 'none',
                marginLeft: 'auto',
                width: '100%',
                maxWidth: '400px',
                height: '180px',
              }}
              src={`https://www.google.com/maps/embed/v1/streetview?location=${station.Latitude},${station.Longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en&region=US`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onError={(e) => {
                console.error('Error loading street view:', e);
                e.target.src = 'https://placehold.co/400x250?text=No+Image';
              }}
            ></iframe>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Book an appointment for {selectedStation['Station Name']}</h2>

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

            {showNoTimesMessage && date && availableTimes.length === 0 && (
              <p style={{ color: "red" }}>
                {date === today
                  ? " No more available slots for today. Please choose another date."
                  : " No available times for this date."}
              </p>
            )}


            <button onClick={bookAppointment} disabled={!isAvailable || !time}>
              📌 Confirm Booking
            </button>
            <button onClick={closeModal}>❌ Close</button>
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
          <i className="fas fa-map-marked-alt"></i> Search on Map
        </Link>
      </div>
    </div >
  );


}

export default Home;
