// ChargingQueue.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import "../designs/ChargingQueue.css";
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

const ChargingQueue = () => {
    const { stationName, selectedDate } = useParams();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [returnToStation, setReturnToStation] = useState(null);
    const [stationDetails, setStationDetails] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Add refreshQueue as a useCallback function to prevent unnecessary recreations
    const refreshQueue = useCallback(async () => {
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
            console.error("Failed to refresh queue:", err);
            setError("Failed to refresh charging queue data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [stationName, selectedDate]);

    useEffect(() => {
        // Get current user's email
        const userEmail = localStorage.getItem('loggedInUser');
        if (userEmail) {
            setCurrentUserEmail(userEmail.toLowerCase());
        }


        if (location.state?.fromStation) {
            setReturnToStation(location.state.fromStation);
        }


        const fetchStationDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/stations/details/${encodeURIComponent(stationName)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setStationDetails(response.data);
            } catch (err) {
                console.error("Failed to fetch station details:", err);
            }
        };

        // Initial fetch of queue data
        refreshQueue();
        fetchStationDetails();

        // Set up an interval to refresh the queue data every 30 seconds
        const intervalId = setInterval(() => {
            refreshQueue();
        }, 30000); // 30 seconds

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);

    }, [stationName, selectedDate, location.state, refreshQueue]);

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

    // חישוב זמן המתנה מדויק לפי סדר עדיפות, עמדות וזמני טעינה
    const calculateWaitingTime = (index, sortedQueue) => {
        // קבל את כמות עמדות הטעינה בתחנה
        const numChargingPoints = stationDetails?.["Duplicate Count"] || 1;
        // מערך שמייצג מתי כל עמדה פנויה (בדקות מאז חצות)
        const chargingPoints = Array(numChargingPoints).fill(0);

        // עבור כל משתמש בתור (לפי סדר העדיפות)
        for (let i = 0; i < sortedQueue.length; i++) {
            const booking = sortedQueue[i];
            const [hours, minutes] = booking.time.split(":").map(Number);
            const startTimeInMinutes = hours * 60 + minutes;
            const duration = booking.estimatedChargeTime || 30;

            // מצא את העמדה שתהיה פנויה הכי מוקדם
            let earliestAvailable = Math.min(...chargingPoints);
            let earliestPointIndex = chargingPoints.indexOf(earliestAvailable);

            // מתי המשתמש באמת יוכל להתחיל טעינה
            const actualStart = Math.max(startTimeInMinutes, chargingPoints[earliestPointIndex]);
            const waitTime = actualStart - startTimeInMinutes;

            // עדכן את זמן הסיום של העמדה
            chargingPoints[earliestPointIndex] = actualStart + duration;

            // אם זה המשתמש שאנחנו רוצים לחשב עבורו
            if (i === index) {
                if (waitTime <= 0) {
                    return "No waiting time - station available";
                } else if (waitTime < 60) {
                    return `Estimated wait: ${waitTime} minutes`;
                } else {
                    const hours = Math.floor(waitTime / 60);
                    const mins = waitTime % 60;
                    return `Estimated wait: ${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} minutes` : ''}`;
                }
            }
        }
        // fallback
        return "Error calculating wait time";
    };

    // Add function to manually trigger appointment processing
    const triggerProcessing = async () => {
        try {
            setIsProcessing(true);
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/bookings/process-pending`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            // After processing, refresh the queue to show any newly approved bookings
            await refreshQueue();
            alert('Processing completed. The queue has been refreshed.');
        } catch (err) {
            console.error("Failed to trigger processing:", err);
            alert('Failed to process pending appointments. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="queue-container">
            <div className="queue-header">
                <button onClick={handleBack} className="back-button-highlight">
                    <HomeIcon />
                </button>
                <h1>
                    <span className="queue-icon">📋</span>Charging Queue
                </h1>
                <p className="queue-subtitle">for {stationName} - {selectedDate}</p>
            </div>

            <div className="queue-actions">
                <button 
                    className="refresh-button" 
                    onClick={refreshQueue} 
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Queue'}
                </button>
                
            </div>

            <div className="queue-notification">
                <strong>Note:</strong> This queue shows only approved appointments. Pending appointments are processed 1 hour before their scheduled time.
            </div>

            <div className="queue-content">
                {loading ? (
                    <div className="loading-container">
                        <p>Loading queue data...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => refreshQueue()}>
                            Try Again
                        </button>
                    </div>
                ) : queue.length === 0 ? (
                    <div className="empty-queue">
                        <p>No approved bookings scheduled for this date yet.</p>
                        <p className="queue-note">Note: Appointments are approved 1 hour before their scheduled time based on priority.</p>
                    </div>
                ) : (
                    <div className="queue-list">
                        {(() => {
                            const sortedQueue = [...queue].sort((a, b) => {
                                if (a.priorityScore !== b.priorityScore) {
                                    return a.priorityScore - b.priorityScore;
                                }
                                // אם ציון העדיפות זהה, תן עדיפות לסוללה נמוכה יותר
                                return (a.currentBattery ?? 100) - (b.currentBattery ?? 100);
                            });
                            return sortedQueue.map((booking, index) => {
                                const urgency = getUrgencyInfo(booking.urgencyLevel);
                                const waitingTime = calculateWaitingTime(index, sortedQueue);
                                const isCurrentUser = booking.user.toLowerCase() === currentUserEmail;
                                return (
                                    <div 
                                        key={index} 
                                        className={`queue-item ${isCurrentUser ? 'current-user-booking' : ''}`}
                                    >
                                        <div className="queue-item-content">
                                            {isCurrentUser && (
                                                <div className="current-user-badge">
                                                    Your booking
                                                </div>
                                            )}
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
                            });
                        })()}
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
    );
};

export default ChargingQueue;