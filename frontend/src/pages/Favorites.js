import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../designs/Favorites.css';

// SVG Icons
const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

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

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const CityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="6" x2="12" y2="6.01"></line>
        <line x1="12" y1="10" x2="12" y2="10.01"></line>
        <line x1="12" y1="14" x2="12" y2="14.01"></line>
        <line x1="12" y1="18" x2="12" y2="18.01"></line>
    </svg>
);

const ChargingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
    </svg>
);

const EmptyHeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const Favorites = () => {
    const [favoriteStations, setFavoriteStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchFavorites = async () => {
            const loggedInUser = localStorage.getItem('loggedInUser');
            const token = localStorage.getItem('token');

            if (!loggedInUser || !token) {
                showToast('Please log in to view favorites!', 'error');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                const response = await fetch('http://localhost:3001/api/stations', {
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
            }
        };

        fetchFavorites();
    }, [navigate]);

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
            const response = await fetch(`http://localhost:3001/api/stations/${station._id}/unlike`, {
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

    // We don't want to navigate when clicking on the card
    const handleCardClick = (event) => {
        // Just prevent default behavior, no navigation
        if (event.target.closest('.remove-button')) {
            return; // Let the remove button handler work
        }

        // Do nothing else when clicking on the card
        return;
    };

    return (
        <div className="favorites-container">
            {/* Toast Notification */}
            <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
                {toast.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                )}
                <span className="toast-message">{toast.message}</span>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="loading-message">
                    <div className="loading-spinner"></div>
                    <p>Loading your favorite stations...</p>
                </div>
            ) : (
                <>
                    <div className="favorites-summary">
                        <h2>Favorite Charging Stations</h2>
                        <p>
                            You have <strong>{favoriteStations.length}</strong> favorite station{favoriteStations.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {favoriteStations.length > 0 ? (
                        <div className="station-list">
                            {favoriteStations.map((station, index) => (
                                <div key={index} className="station-card" onClick={handleCardClick}>
                                    <div className="station-details">
                                        <h3>{station['Station Name']}</h3>
                                        <div className="station-info">
                                            <div className="station-info-item">
                                                <LocationIcon />
                                                <strong>Address:</strong>
                                                <span>{station.Address || 'N/A'}</span>
                                            </div>
                                            <div className="station-info-item">
                                                <CityIcon />
                                                <strong>City:</strong>
                                                <span>{station.City || 'N/A'}</span>
                                            </div>
                                            <div className="station-info-item">
                                                <ChargingIcon />
                                                <strong>Charging Points:</strong>
                                                <span>{station['Duplicate Count'] || '1'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="remove-button"
                                        onClick={(e) => removeFromFavorites(station, e)}
                                        aria-label="Remove from favorites"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-favorites">
                            <EmptyHeartIcon />
                            <p>You haven't added any favorite stations yet.</p>
                            <Link to="/map" className="back-button">
                                Find stations on map
                            </Link>
                        </div>
                    )}



                    {/* Bottom Navigation Bar */}
                    <div className="bottom-bar">
                        <Link to="/home" className="bottom-bar-button">
                            <HomeIcon />
                            <span>Home</span>
                        </Link>
                        <Link to="/map" className="bottom-bar-button">
                            <MapIcon />
                            <span>Map</span>
                        </Link>
                        <Link to="/favorites" className="bottom-bar-button favorites">
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
                </>
            )}
        </div>
    );
};

export default Favorites;