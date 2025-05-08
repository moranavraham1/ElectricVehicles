// ChargingQueue.js
import React, { useEffect, useState } from "react";
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

        fetchStationDetails();

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

        
        // Get the number of charging points at this station (default to 1 if not available)
        const numChargingPoints = stationDetails?.["Duplicate Count"] || 1;
        
        // Group bookings by time slot
        const timeSlots = {};
        queue.forEach((booking, i) => {
            if (!timeSlots[booking.time]) {
                timeSlots[booking.time] = [];
            }
            timeSlots[booking.time].push({...booking, queueIndex: i});
        });
        
        // Find current user's time slot
        const currentUserTime = queue[index].time;
        const currentUser = queue[index];
        
        // Get all users in the same time slot
        const usersInSameTimeSlot = timeSlots[currentUserTime];
        
        // Sort users in this time slot by their position in the original queue
        usersInSameTimeSlot.sort((a, b) => a.queueIndex - b.queueIndex);
        
        // Find current user's position in this time slot
        const positionInTimeSlot = usersInSameTimeSlot.findIndex(b => b.queueIndex === index);
        
        // If user's position in their time slot is within charging point capacity, 
        // check if there are users already occupying the charging points
        if (positionInTimeSlot < numChargingPoints) {
            return "No waiting time - station available";
        }
        
        // If we need to wait, find the earliest available charging point
        // First, organize users into batches
        const batches = [];
        for (let i = 0; i < usersInSameTimeSlot.length; i += numChargingPoints) {
            batches.push(usersInSameTimeSlot.slice(i, i + numChargingPoints));
        }
        
        // Find which batch our user is in
        const userBatchIndex = Math.floor(positionInTimeSlot / numChargingPoints);
        
        // Calculate waiting time based on previous batches
        let totalWaitTime = 0;
        
        // For each previous batch, take the smallest charging time
        // (as the next batch can start once the first spot becomes available)
        for (let i = 0; i < userBatchIndex; i++) {
            if (batches[i] && batches[i].length > 0) {
                // Find the minimum charging time in this batch
                const minChargingTime = Math.min(...batches[i].map(b => b.estimatedChargeTime || 30));
                totalWaitTime += minChargingTime;
            }
        }
        
        if (totalWaitTime === 0) {
            return "No waiting time - station available";
        } else if (totalWaitTime < 60) {

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
                    <HomeIcon />
                </button>
                <h1>
                    <span className="queue-icon">📋</span>Charging Queue
                </h1>
                <p className="queue-subtitle">for {stationName} - {selectedDate}</p>
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
                        <button onClick={() => fetchQueue()}>
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
                        {queue.map((booking, index) => {
                            const urgency = getUrgencyInfo(booking.urgencyLevel);
                            const waitingTime = calculateWaitingTime(index, queue);

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