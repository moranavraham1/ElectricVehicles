import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Charging = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { station, date, time } = location.state || {};
    const [isCharging, setIsCharging] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const startCharging = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/bookings/start-charging`,
                {
                    station: station['Station Name'],
                    date,
                    time
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            alert(response.data.message);
            setIsCharging(true);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error starting charging.');
        } finally {
            setLoading(false);
        }
    };

    const stopCharging = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/bookings/stop-charging`,
                { station: station['Station Name'] },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert(response.data.message);
            setIsCharging(false);
            setError('');
            navigate('/home');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error stopping charging.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    }, []);

    if (!station) {
        return <div>Station not selected. Please go back.</div>;
    }

    return (
        <div className="charging-container" style={{ padding: 30, textAlign: 'center' }}>
            <h2>Charging at {station['Station Name']}</h2>
            <p><strong>Address:</strong> {station.Address}</p>
            <p><strong>City:</strong> {station.City}</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {isCharging ? (
                <button onClick={stopCharging} disabled={loading}>
                    🛑 Stop Charging
                </button>
            ) : (
                <button onClick={startCharging} disabled={loading}>
                    ⚡ Start Charging
                </button>
            )}

            <br /><br />
            <button onClick={() => navigate('/home')}>🔙 Back to Home</button>
        </div>
    );
};

export default Charging;
