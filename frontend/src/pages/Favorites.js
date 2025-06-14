import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../designs/Favorites.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon, LocationIcon, CityIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';
import wazeIcon from '../assets/WAZE.jpg';

const ChargingIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
    </svg>
);

const BackIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const EmptyHeartIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const SuccessIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const LoadingScreen = () => (
    <div className="loading-screen">
        <div className="loading-logo">
            <div className="loading-circle"></div>
            <div className="loading-text">Loading favorites...</div>
        </div>
    </div>
);

const Favorites = () => {
    const [favoriteStations, setFavoriteStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isAvailable, setIsAvailable] = useState(null);
    const today = new Date().toISOString().split("T")[0];
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);
            },
            (error) => {
                console.error('Error fetching location:', error);
            }
        );


        const fetchFavorites = async () => {
            const loggedInUser = localStorage.getItem('loggedInUser');
            const token = localStorage.getItem('token');

            if (!loggedInUser || !token) {
                showToast('Please log in to view favorites!', 'error');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch favorites.');
                }

                const stations = await response.json();
                const favoriteStations = stations.filter((station) =>
                    station.likedBy.includes(loggedInUser.toLowerCase())
                );
                setFavoriteStations(favoriteStations);
            } catch (error) {
                console.error('Error fetching favorites:', error.message);
                showToast('Failed to load favorites. Please try again.', 'error');
            } finally {
                setLoading(false);
                setTimeout(() => {
                    setPageLoading(false);
                }, 1000);
            }
        };

        fetchFavorites();
    }, [navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleLogout = () => {
        try {
            localStorage.clear();
            showToast('You have been logged out successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Logout failed. Please try again.', 'error');
        }
    };

    const removeFromFavorites = async (station, event) => {
        // Prevent the click from bubbling up to parent elements
        event.stopPropagation();
        event.preventDefault();

        const loggedInUser = localStorage.getItem('loggedInUser');
        const token = localStorage.getItem('token');

        if (!loggedInUser || !token) {
            showToast('Please log in to manage favorites!', 'error');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stations/${station._id}/unlike`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: loggedInUser.toLowerCase() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove from favorites.');
            }

            setFavoriteStations((prevFavorites) =>
                prevFavorites.filter((favStation) => favStation._id !== station._id)
            );

            showToast(`Station removed from favorites`);
        } catch (error) {
            console.error('Error removing favorite:', error);
            showToast('Failed to remove station. Please try again.', 'error');
        }
    };

    const handleCardClick = (event) => {
        // Just prevent default behavior, no navigation
        if (event.target.closest('.remove-button')) {
            return;
        }

        return;
    };

    const startCharging = (station) => {
        navigate('/charging', { state: { station } });
    };

    const goToAppointmentPage = async (station) => {
        try {
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

    return (
        <>
            {pageLoading ? (
                <LoadingScreen />
            ) : (
                <div className="favorites-container">
                    {/* Toast Notification */}
                    <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
                        {toast.type === 'success' ? (
                            <SuccessIcon />
                        ) : (
                            <ErrorIcon />
                        )}
                        <span className="toast-message">{toast.message}</span>
                    </div>

                    <div className="favorites-summary">
                        <h2>Your Favorites</h2>
                        <p>Manage your collection of <strong>{favoriteStations.length}</strong> favorite charging stations</p>
                    </div>

                    {/* תוכן דף המועדפים */}
                    {favoriteStations.length > 0 ? (
                        <div className="station-list">
                            {favoriteStations.map((station, index) => (
                                <div
                                    key={index}
                                    className="station-card"
                                    onClick={handleCardClick}
                                    style={{ "--item-index": index }}
                                >
                                    <h3>{station['Station Name']}</h3>
                                    <div className="station-info">
                                        <div className="station-info-item">
                                            <LocationIcon />
                                            <span>{station.Address || 'N/A'}</span>
                                        </div>
                                        <div className="station-info-item">
                                            <CityIcon />
                                            <span>{station.City || 'N/A'}</span>
                                        </div>
                                        <div className="station-info-item">
                                            <ChargingIcon />
                                            <span>{station['Duplicate Count'] || '1'} charging points</span>
                                        </div>
                                    </div>

                                    {/* Add distance badge if location is available */}
                                    {latitude && longitude && station.Latitude && station.Longitude && (
                                        <div className="distance-badge">
                                            {calculateDistance(latitude, longitude, station.Latitude, station.Longitude)} km
                                        </div>
                                    )}

                                    {/* Station action buttons */}
                                    <div className="station-buttons">
                                        <button
                                            type="button"
                                            className="book-button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                goToAppointmentPage(station);
                                            }}
                                        >
                                            Book Appointment
                                        </button>

                                        <button
                                            type="button"
                                            className="charge-button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                startCharging(station);
                                            }}
                                        >
                                            Start Charging
                                        </button>

                                        <a
                                            href={`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&from=now&navigate=yes`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="waze-button"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img src={wazeIcon} alt="Waze" />
                                            <span>Navigate</span>
                                        </a>
                                    </div>

                                    <button
                                        className="remove-button"
                                        onClick={(e) => removeFromFavorites(station, e)}
                                        title="Remove from favorites"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-favorites">
                            <EmptyHeartIcon />
                            <p>You haven't added any stations to your favorites yet.</p>
                        </div>
                    )}

                    {/* Bottom Navigation Bar - Exactly like Home page */}
                    <div className="bottom-bar">
                        <Link to="/home" className="bottom-bar-button">
                            <HomeIcon />
                            <span>Home</span>
                        </Link>
                        <Link to="/map" className="bottom-bar-button">
                            <MapIcon />
                            <span>Map</span>
                        </Link>
                        <Link to="/favorites" className="bottom-bar-button favorites active" style={{ color: "#27ae60" }}>
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

export default Favorites;