import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Favorites.css'; // ייבוא עיצוב ייחודי למועדפים

const Favorites = () => {
    const [favoriteStations, setFavoriteStations] = useState([]);

    useEffect(() => {
<<<<<<< HEAD
        const fetchFavorites = async () => {
            const loggedInUser = localStorage.getItem('loggedInUser');
            const token = localStorage.getItem('token');
          
            if (!loggedInUser || !token) {
                alert('Please log in to view favorites!');
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
                // סינון התחנות שמכילות את המייל של המשתמש המחובר בשדה likedBy
                const favoriteStations = stations.filter((station) =>
                    station.likedBy.includes(loggedInUser.toLowerCase())
                );
                setFavoriteStations(favoriteStations);
            } catch (error) {
                console.error('Error fetching favorites:', error.message);
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
                body: JSON.stringify({ email: loggedInUser.toLowerCase() }) // העברת המייל להסרה
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove from favorites.');
            }
    
            // הסרת התחנה מהסטייט המקומי
            setFavoriteStations((prevFavorites) =>
                prevFavorites.filter((favStation) => favStation._id !== station._id)
            );
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };
    
=======
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavoriteStations(savedFavorites);
    }, []);

    // פונקציה להסרת תחנה מהמועדפים
    const removeFromFavorites = (stationName) => {
        const updatedFavorites = favoriteStations.filter(
            (station) => station['Station Name'] !== stationName
        );
        setFavoriteStations(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

>>>>>>> 95979c7d (Adding stations to favorites)
    return (
        <div className="favorites-container">
            {/* סיכום המועדפים */}
            <div className="favorites-summary">
                <h2>Favorite Charging Stations ❤️</h2>
                <p>
                    You have <strong>{favoriteStations.length}</strong> favorite station{favoriteStations.length !== 1 ? 's' : ''}.
                </p>
            </div>

            {/* רשימת התחנות */}
            {favoriteStations.length > 0 ? (
                favoriteStations.map((station, index) => (
                    <div key={index} className="station-card">
                        <h3>{station['Station Name']}</h3>
<<<<<<< HEAD
                        <p><strong>Address:</strong> {station.Address || 'N/A'}</p>
                        <p><strong>City:</strong> {station.City || 'N/A'}</p>
                        <p><strong>Charging Stations:</strong> {station['Duplicate Count'] || 'N/A'}</p>
                        {/* כפתור הסרה */}
                        <button
                            className="remove-button"
                            onClick={() => removeFromFavorites(station)}
=======
                        <p><strong>Address:</strong> {station.Address}</p>
                        <p><strong>City:</strong> {station.City}</p>
                        <p><strong>Charging Stations:</strong> {station['Duplicate Count']}</p>
                        {/* כפתור הסרה */}
                        <button
                            className="remove-button"
                            onClick={() => removeFromFavorites(station['Station Name'])}
>>>>>>> 95979c7d (Adding stations to favorites)
                        >
                            ❌ 
                        </button>
                    </div>
                ))
            ) : (
                <p className="no-favorites">No favorite stations added yet.</p>
            )}

            {/* כפתור חזרה לדף הבית */}
            <Link to="/home" className="back-button">⬅ Back to Home</Link>
        </div>
    );
};

export default Favorites;
