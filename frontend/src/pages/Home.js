import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Home.css';
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

    useEffect(() => {
        fetchUserLocation();
        fetchStations();

        // Load favorites from localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(savedFavorites.map((station) => station['Station Name']));
    }, []);

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

            const formattedLocation = `${road}, ${city}`;
            setUserLocation(formattedLocation.trim());
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
            setStations(response.data);
        } catch (error) {
            console.error('Error fetching stations:', error);
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

    const toggleFavorite = (stationName) => {
        setFavorites((prevFavorites) => {
            let updatedFavorites = [...prevFavorites];

            if (updatedFavorites.includes(stationName)) {
                // Remove from favorites
                updatedFavorites = updatedFavorites.filter((name) => name !== stationName);
            } else {
                // Add to favorites
                updatedFavorites.push(stationName);
            }

            // Update localStorage
            const favoriteStations = stations.filter((station) =>
                updatedFavorites.includes(station['Station Name'])
            );
            localStorage.setItem('favorites', JSON.stringify(favoriteStations));

            return updatedFavorites;
        });
    };

    const filteredStations = stations.filter((station) =>
        station['Station Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.City.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.Address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedStations = [...filteredStations].sort((a, b) => {
        const distanceA = calculateDistance(latitude, longitude, a.Latitude, a.Longitude);
        const distanceB = calculateDistance(latitude, longitude, b.Latitude, b.Longitude);
        return distanceA - distanceB;
    });

    return (
        <div className="home-container">
            <div className="logo-container">
                <img src={logo} alt="EVision Logo" className="logo" />
            </div>

            <div className="location-bar">
                <p>{loadingLocation ? 'Loading...' : userLocation} 📍</p>
                <button className="refresh-location-button" onClick={fetchUserLocation}>
                    🔄 Refresh Location
                </button>
            </div>

            <div className="search-bar-container">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search stations by address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="station-list">
                {sortedStations.map((station, index) => (
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

                        <div 
                            className={`heart-icon ${favorites.includes(station['Station Name']) ? 'active' : ''}`}
                            onClick={() => toggleFavorite(station['Station Name'])}
                        >
                            <i className={`fa-${favorites.includes(station['Station Name']) ? 'solid' : 'regular'} fa-heart`}></i>
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
                                height: '180px'
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
                <Link to="/logout" className="bottom-bar-button logout">
                    <i className="fas fa-sign-out-alt"></i> Logout
                </Link>
                <Link to="/home" className="bottom-bar-button home">
                    <i className="fas fa-home"></i> Home
                </Link>
                <Link to="/favorites" className="bottom-bar-button favorites">
                    <i className="fas fa-heart"></i> Favorites
                </Link>
                <Link to="/personal-area" className="bottom-bar-button personal">
                    <i className="fas fa-user"></i> Personal Area
                </Link>
                <Link to="/map" className="bottom-bar-button map">
                    <i className="fas fa-map-marked-alt"></i> Search on Map
                </Link>
            </div>
        </div>
    );
};

export default Home;
