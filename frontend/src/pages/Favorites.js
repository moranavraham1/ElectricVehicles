import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Favorites.css'; // ייבוא עיצוב ייחודי למועדפים

const Favorites = () => {
    const [favoriteStations, setFavoriteStations] = useState([]);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser'); // קבלת המשתמש המחובר
        if (!loggedInUser) {
            alert('Please log in to view favorites!');
            return;
        }

        const favoriteKey = `favorites_${loggedInUser}`;
        const savedFavorites = JSON.parse(localStorage.getItem(favoriteKey)) || [];
        setFavoriteStations(savedFavorites);
    }, []);

    // פונקציה להסרת תחנה מהמועדפים
    const removeFromFavorites = (stationName) => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const favoriteKey = `favorites_${loggedInUser}`;
        const updatedFavorites = favoriteStations.filter(
            (station) => station['Station Name'] !== stationName
        );
        setFavoriteStations(updatedFavorites);
        localStorage.setItem(favoriteKey, JSON.stringify(updatedFavorites));
    };

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
                        <p><strong>Address:</strong> {station.Address || 'N/A'}</p>
                        <p><strong>City:</strong> {station.City || 'N/A'}</p>
                        <p><strong>Charging Stations:</strong> {station['Duplicate Count'] || 'N/A'}</p>
                        {/* כפתור הסרה */}
                        <button
                            className="remove-button"
                            onClick={() => removeFromFavorites(station['Station Name'])}
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
