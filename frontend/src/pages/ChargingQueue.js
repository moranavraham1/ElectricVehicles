// ChargingQueue.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../designs/ChargingQueue.css";

const ChargingQueue = () => {
    const { stationName, selectedDate } = useParams();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
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
    }, [stationName, selectedDate]);

    const handleBack = () => {
        navigate(-1);
    };

    // Function to determine urgency level label
    const getUrgencyInfo = (level) => {
        switch(Number(level)) {
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

    return (
        <div className="queue-container">
            <div className="logo-container">
                <img src="/logo.png" alt="Logo" className="logo" />
            </div>
            <div className="queue-content">
                <div className="queue-header">
                    <h1>
                        <span className="queue-icon">📋</span>Charging Queue
                    </h1>
                    <p className="queue-subtitle">for {stationName} - {selectedDate}</p>
                </div>
                
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <button onClick={handleBack} className="back-button">
                    ← Back to Station
                </button>
            </div>
        </div>
    );
};

export default ChargingQueue;