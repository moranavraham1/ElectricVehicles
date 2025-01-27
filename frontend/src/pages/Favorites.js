import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../designs/Favorites.css'; // ייבוא עיצוב ייחודי למועדפים

const Favorites = () => {
    const [favoriteStations, setFavoriteStations] = useState([]);
    const [loading, setLoading] = useState(true); // מצב טעינה
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
<<<<<<< HEAD
        const fetchFavorites = async () => {
            const loggedInUser = localStorage.getItem('loggedInUser');
            const token = localStorage.getItem('token');
          
            if (!loggedInUser || !token) {
                alert('Please log in to view favorites!');
                setLoading(false);
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
            } finally {
                setLoading(false); // סיום הטעינה
            }
        };
          
        fetchFavorites();
    }, []);
    
    const removeFromFavorites = async (station) => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const token = localStorage.getItem('token');
    
        if (!loggedInUser || !token) {
            alert('Please log in to manage favorites!');
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
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    return (
        <div className="favorites-container">
            {/* בדיקת טעינה */}
            {loading ? (
                <div className="loading-message">Loading your favorite stations...</div>
            ) : (
                <>
                    <div className="favorites-summary">
                        <h2>Favorite Charging Stations ❤️</h2>
                        <p>
                            You have <strong>{favoriteStations.length}</strong> favorite station{favoriteStations.length !== 1 ? 's' : ''}.
                        </p>
                    </div>

                    {favoriteStations.length > 0 ? (
                        favoriteStations.map((station, index) => (
                            <div key={index} className="station-card">
                                <h3>{station['Station Name']}</h3>
                                <p><strong>Address:</strong> {station.Address || 'N/A'}</p>
                                <p><strong>City:</strong> {station.City || 'N/A'}</p>
                                <p><strong>Charging Stations:</strong> {station['Duplicate Count'] || 'N/A'}</p>
                                <button
                                    className="remove-button"
                                    onClick={() => removeFromFavorites(station)}
                                >
                                    ❌ 
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-favorites">No favorite stations added yet.</p>
                    )}

                    <Link to="/home" className="back-button">⬅ Back to Home</Link>

                    {/* תפריט תחתון */}
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
                </>
            )}
        </div>
    );
};

export default Favorites;
