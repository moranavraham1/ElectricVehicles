import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Home.css';
import wazeIcon from '../assets/WAZE.jpg';
import logo from '../assets/logo.jpg';

// טעינת מפתח Google Maps API מהמפתח שהוגדר בקובץ .env
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
        if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity; // שימוש באינסוף כדי לא לשבש מיון
        const R = 6371; // רדיוס כדור הארץ בק"מ
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

    const filteredStations = stations.filter((station) =>
        station['Station Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.City.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.Address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // מיון לפי מרחק מהמשתמש
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

                        {/* Google Maps Street View Interactive */}
                        <iframe
                            title={`Street View of ${station['Station Name']}`}
                            className="station-image-small"
                            width="250"
                            height="150"
                            style={{ borderRadius: '10px', border: 'none', marginLeft: 'auto' }}
                            src={`https://www.google.com/maps/embed/v1/streetview?location=${station.Latitude},${station.Longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en&region=US`}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/250x150?text=No+Image';
                            }}
                        ></iframe>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
