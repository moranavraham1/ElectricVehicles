import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';


const Charging = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        station,
        date: incomingDate,
        time: incomingTime,
        estimatedChargeTime: incomingChargeTime
    } = location.state || {};

    const [isCharging, setIsCharging] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [estimatedChargeTime, setEstimatedChargeTime] = useState(null);
    const [endTime, setEndTime] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        if (!station) return;

        const now = new Date();
        const isoDate = now.toISOString().split('T')[0];
        const roundedMinutes = Math.floor(now.getMinutes() / 20) * 20;
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = roundedMinutes.toString().padStart(2, '0');
        const currentTime = `${hh}:${mm}`;

        const selectedDate = incomingDate || isoDate;
        const selectedTime = incomingTime || currentTime;

        setDate(selectedDate);
        setTime(selectedTime);

        // אם הגיע estimatedChargeTime → נחשב זמן סיום
        if (incomingChargeTime) {
            setEstimatedChargeTime(incomingChargeTime);
            const [hour, minute] = selectedTime.split(':');
            const startDateTime = new Date(`${selectedDate}T${hour}:${minute}`);
            const endDateTime = new Date(startDateTime.getTime() + incomingChargeTime * 60000);
            const formattedEnd = endDateTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            setEndTime(formattedEnd);
        }
    }, [station, incomingDate, incomingTime, incomingChargeTime]);

    const startCharging = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/bookings/start-charging`,
                {
                    station: station,
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
            setElapsedTime(0);
            startTimer();
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
            const stationName =
                typeof station === 'string' ? station : station?.['Station Name'];
            if (!stationName) {
                setError('Station name is missing.');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/bookings/stop-charging`,
                { station: stationName },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            alert(response.data.message);
            setIsCharging(false);
            setError('');
            stopTimer();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error stopping charging.');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
    };


    useEffect(() => {
        return () => stopTimer();
    }, []);

    const formatElapsedTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (!station) {
        return <div>Station not selected. Please go back.</div>;
    }

    return (
        <div className="charging-container" style={{ padding: 30, textAlign: 'center' }}>
            <h2>🔌 Charging at {station['Station Name']}</h2>
            <p><strong>📍 Address:</strong> {station.Address}</p>
            <p><strong>🏙 City:</strong> {station.City}</p>
            <p><strong>📅 Date:</strong> {date}</p>
            <p><strong>🕒 Start Time:</strong> {time}</p>

            {/* הצגת זמן סיום רק אם המשתמש הגיע עם תור */}
            {estimatedChargeTime && (
                <>
                    <p><strong>🛑 Estimated End Time:</strong> {endTime}</p>
                    <p><strong>⏱ Charging Duration:</strong> ~{estimatedChargeTime} minutes</p>
                </>
            )}

            {isCharging && (
                <p><strong>⏳ Time Elapsed:</strong> {formatElapsedTime(elapsedTime)}</p>
            )}

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
            <div className="bottom-bar">
                <button className="bottom-bar-button logout" onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
                <Link to="/personal-area" className="bottom-bar-button">
                    <i className="fas fa-user"></i> Personal Area
                </Link>
                <Link to="/favorites" className="bottom-bar-button">
                    <i className="fas fa-heart"></i> Favorites
                </Link>
                <Link to="/home" className="bottom-bar-button">
                    <i className="fas fa-home"></i> Home
                </Link>
                <Link to="/map" className="bottom-bar-button">
                    <i className="fas fa-map-marked-alt"></i> Search on Map
                </Link>
            </div>


        </div>

    );
};

export default Charging;