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

  // Step 1: Get the user's location
  useEffect(() => {
    fetchUserLocation();
  }, []);

  // Step 2: Once location is available, fetch the stations
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

  // Filtering and sorting stations
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

      // Sort stations by distance in ascending order
      const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
      setStations(sortedStations);
      setFilteredStations(sortedStations); // Also sort the filtered stations
    } catch (error) {
      console.error('Error fetching stations:', error);
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

  const handleStationClick = (clickedStation) => {
    setStations((prevStations) => {
      const updatedStations = prevStations.filter(
        (station) => station['Station Name'] !== clickedStation['Station Name']
      );
      return [clickedStation, ...updatedStations];
    });
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
        // Remove from favorites
        await axios.delete(`http://localhost:3001/api/stations/${station._id}/unlike`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          data: { user: loggedInUser.toLowerCase() },
        });

        // Update favorites list for the station
        setStations((prevStations) =>
          prevStations.map((s) =>
            s._id === station._id
              ? { ...s, likedBy: s.likedBy.filter((email) => email !== loggedInUser.toLowerCase()) }
              : s
          )
        );
      } else {
        // Add to favorites
        await axios.post(
          `http://localhost:3001/api/stations/${station._id}/like`,
          { user: loggedInUser.toLowerCase() },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        // Update favorites list for the station
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
          <div
            key={index}
            className="station-card"
            onClick={() => handleStationClick(station)}
          >
            <div className="distance-badge">
              {calculateDistance(latitude, longitude, station.Latitude, station.Longitude)} km
            </div>

            {/* Appointment button appears below the distance badge */}
            <button 
              className="appointment-button" 
              onClick={(e) => {
                e.stopPropagation();
                navigateToAppointment(station);
              }}
            >
              Book Appointment
            </button>

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

            <div
              className={`heart-icon ${station.likedBy.includes(localStorage.getItem('loggedInUser').toLowerCase()) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(station);
              }}
            >
              <i className={`fa-${station.likedBy.includes(localStorage.getItem('loggedInUser').toLowerCase()) ? 'solid' : 'regular'} fa-heart`}></i>
            </div>

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

      <div className="bottom-bar">
        <button className="bottom-bar-button logout" onClick={handleLogout}>
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

export default Home;
