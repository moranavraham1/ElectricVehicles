import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Home.css';
import wazeIcon from '../assets/WAZE.jpg';
import logo from '../assets/logo.jpg';

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
    
            // שליפת נתונים רלוונטיים
            const road = address.road || 'Address not available'; // כתובת
            const city = address.city || address.town || address.village || 'City not available'; // עיר
            const region = address.state || 'Region not available'; // מחוז
            const postcode = address.postcode || 'Postcode not available'; // מיקוד
            const country = address.country || 'Country not available'; // ארץ
    
            // יצירת מחרוזת בפורמט הרצוי
            const formattedLocation = `${road}, ${city}, ${region}, ${postcode}, ${country}`;
    
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
    
            // שמירת המועדפים ב-localStorage
            const favoriteStations = stations.filter((_, i) => newFavorites[i]);
            localStorage.setItem('favorites', JSON.stringify(favoriteStations));
    
            return newFavorites;
        });
    };
    
    // טעינת המועדפים מה-localStorage בעת הטעינה
    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const initialFavorites = stations.map((station) =>
            savedFavorites.some((fav) => fav['Station Name'] === station['Station Name'])
        );
        setFavorites(initialFavorites);
    }, [stations]);
    

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
            {/* לוגו */}
            <div className="logo-container">
                <img src={logo} alt="EVision Logo" className="logo" />
            </div>

            {/* מיקום */}
            <div className="location-bar">
                <p>{loadingLocation ? 'Loading...' : userLocation} 📍</p>
                <button className="refresh-location-button" onClick={fetchUserLocation}>
                    🔄 Refresh Location
                </button>
            </div>

            {/* חיפוש */}
            <div className="search-bar-container">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search stations by name, city, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* רשימת תחנות */}
            <div className="station-list">
                {sortedStations.map((station, index) => (
                    <div key={index} className="station-card">
                        <div>
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
                        <div className="distance-container">
                            <div className="distance-badge">
                                {calculateDistance(latitude, longitude, station.Latitude, station.Longitude)} km
                            </div>
                            {/* כפתור לב */}
                            <div 
                                className={`heart-icon ${favorites[index] ? 'active' : ''}`} 
                                onClick={() => toggleFavorite(index)}
                            >
                                <i className={`fa-${favorites[index] ? 'solid' : 'regular'} fa-heart`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* תפריט תחתון */}
            
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
