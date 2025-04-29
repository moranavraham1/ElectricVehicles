// ChargingQueue.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import "../designs/ChargingQueue.css";
import logo from "../assets/logo.jpg";

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

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const ChargingQueue = () => {
    const { stationName, selectedDate } = useParams();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [returnToStation, setReturnToStation] = useState(null);

    useEffect(() => {
        if (location.state?.fromStation) {
            setReturnToStation(location.state.fromStation);
        }

        const fetchQueue = async () => {
            try {
                setLoading(true);
                const encodedStation = encodeURIComponent(stationName);
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/bookings/queue/${encodedStation}/${selectedDate}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setQueue(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch queue:", err);
                setError("Failed to load charging queue data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
    }, [stationName, selectedDate, location.state]);

    const handleBack = () => {
        if (returnToStation) {
            navigate('/home', {
                state: {
                    highlightStation: stationName,
                    fromQueuePage: true
                }
            });
        } else {
            navigate(-1);
        }
    };

    const handleLogout = () => {
        try {
            localStorage.clear();
            alert('You have been logged out successfully!');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getUrgencyInfo = (level) => {
        switch (Number(level)) {
            case 1:
                return { label: 'Low' };
            case 2:
                return { label: 'Medium' };
            case 3:
                return { label: 'High' };
            case 4:
                return { label: 'Critical' };
            default:
                return { label: 'Unknown' };
        }
    };

    const calculateWaitingTime = (index, queue) => {
        if (index === 0) return "You're next!";

        let totalWaitTime = 0;
        for (let i = 0; i < index; i++) {
            totalWaitTime += queue[i].estimatedChargeTime || 30;
        }

        if (totalWaitTime < 60) {
            return `Estimated wait: ${totalWaitTime} minutes`;
        } else {
            const hours = Math.floor(totalWaitTime / 60);
            const minutes = totalWaitTime % 60;
            return `Estimated wait: ${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minutes` : ''}`;
        }
    };

    return (
        <div className="queue-container">
            <div className="queue-header">
                <button onClick={handleBack} className="back-button-highlight">
                    <BackIcon />
                </button>
                <h1>
                    <span className="queue-icon">📋</span>Charging Queue
                </h1>
                <p className="queue-subtitle">for {stationName} - {selectedDate}</p>
            </div>

            <div className="queue-content">
                {loading ? (
                    <div className="loading-container">
                        <p>Loading queue data...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => fetchQueue()}>
                            Try Again
                        </button>
                    </div>
                ) : queue.length === 0 ? (
                    <div className="empty-queue">
                        <p>No bookings scheduled for this date yet.</p>
                    </div>
                ) : (
                    <div className="queue-list">
                        {queue.map((booking, index) => {
                            const urgency = getUrgencyInfo(booking.urgencyLevel);
                            const waitingTime = calculateWaitingTime(index, queue);
                            return (
                                <div key={index} className="queue-item">
                                    <div className="queue-item-content">
                                        <div className="queue-item-row">
                                            <span className="time-icon">⏰</span> <strong>Time:</strong> {booking.time}
                                        </div>
                                        <div className="queue-item-row">
                                            <span className="urgency-icon">🔺</span> <strong>Urgency:</strong> {urgency.label}
                                        </div>
                                        <div className="queue-item-row">
                                            <span className="user-icon">📧</span> <strong>User:</strong> {booking.user}
                                        </div>
                                        <div className="queue-item-row">
                                            <span className="charging-icon">⏱️</span> <strong>Charging Time:</strong> {booking.estimatedChargeTime} minutes
                                        </div>
                                        <div className="queue-item-row">
                                            <span className="waiting-icon">⏳</span> <strong>{waitingTime}</strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Navigation - using Link components like in PersonalArea */}
            <div className="bottom-bar">
                <Link to="/home" className="bottom-bar-button">
                    <HomeIcon />
                    <span>Home</span>
                </Link>
                <Link to="/map" className="bottom-bar-button">
                    <MapIcon />
                    <span>Map</span>
                </Link>
                <Link to="/favorites" className="bottom-bar-button">
                    <HeartIcon />
                    <span>Favorites</span>
                </Link>
                <Link to="/profile" className="bottom-bar-button">
                    <UserIcon />
                    <span>Profile</span>
                </Link>
                <button className="bottom-bar-button" onClick={handleLogout}>
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default ChargingQueue;