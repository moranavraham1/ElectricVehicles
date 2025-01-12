import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Home.css';
import wazeIcon from '../assets/WAZE.jpg';
import logo from '../assets/logo.jpg';

// טעינת מפתח Google Maps API
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
            const formattedLocation = `${address.road || 'Address not available'}, ${address.city || 'City not available'}`;
            setUserLocation(formattedLocation.trim());
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingLocation(false);
        }
    };

    const fetchStations = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/stations');
            setStations(response.data);
            setFavorites(Array(response.data.length).fill(false));
        } catch (error) {
            console.error('Error fetching stations:', error);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 'N/A';
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    const toggleFavorite = (index) => {
        setFavorites((prevFavorites) => {
            const newFavorites = [...prevFavorites];
            newFavorites[index] = !newFavorites[index];
            const favoriteStations = stations.filter((_, i) => newFavorites[i]);
            localStorage.setItem('favorites', JSON.stringify(favoriteStations));
            return newFavorites;
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
                        {/* מרחק מוצג בצורה קבועה בפינה הימנית העליונה */}
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

                        {/* תמונה ממוזערת מימין */}
                        <img
                            src={`https://maps.googleapis.com/maps/api/streetview?size=150x150&location=${encodeURIComponent(station.Address + ', ' + station.City)}&fov=80&heading=70&pitch=0&key=${GOOGLE_MAPS_API_KEY}`}
                            alt={`Street View of ${station['Station Name']}`}
                            className="station-image-small"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/150x150?text=No+Image';
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
