import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../designs/Charging.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon, LocationIcon, CityIcon, CalendarIcon, ClockIcon, BatteryIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';
import ChargingStatus from '../components/charging/ChargingStatus';
import { FaClock, FaBatteryHalf, FaBatteryFull } from 'react-icons/fa';

const Charging = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        station,
        date: incomingDate,
        time: incomingTime,        estimatedChargeTime: incomingChargeTime,
        currentBattery: incomingBatteryLevel
    } = location.state || {};

    const [isCharging, setIsCharging] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [estimatedChargeTime, setEstimatedChargeTime] = useState(null);
    const [endTime, setEndTime] = useState('');
    const timerRef = useRef(null);    const [batteryLevel, setBatteryLevel] = useState(incomingBatteryLevel || 20); // Use user-provided level or default
    const [showSummary, setShowSummary] = useState(false);
    const [chargingSummary, setChargingSummary] = useState({
        duration: 0,
        initialBattery: 0,
        finalBattery: 0,
        batteryGained: 0
    });

    const [chargingStatus, setChargingStatus] = useState('');


    // Format date for display
    const formatDisplayDate = (dateStr) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    useEffect(() => {
        let batteryRef;

        const monitorBattery = async () => {
            // If we have a battery level from the booking, don't use the device's battery
            if (incomingBatteryLevel !== undefined) {
                console.log('Using battery level from booking:', incomingBatteryLevel);
                return;
            }

            try {
                if (navigator.getBattery) {
                    const battery = await navigator.getBattery();
                    batteryRef = battery;

                    const updateLevel = () => {
                        setBatteryLevel(Math.round(battery.level * 100));
                    };

                    updateLevel();
                    battery.addEventListener('levelchange', updateLevel);
                } else {
                    console.log('Battery API not supported, using default value');
                }
            } catch (error) {
                console.error('Battery API error:', error);
            }
        };

        monitorBattery();

        return () => {
            if (batteryRef) {
                batteryRef.removeEventListener('levelchange', () => { });
            }
        };
    }, [incomingBatteryLevel]);

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
    }, [station, incomingDate, incomingTime, incomingChargeTime]);    const startCharging = async () => {
        try {
            setLoading(true);
            console.log("Starting charging process...");

            // Get token for user authentication
            const token = localStorage.getItem('token');
            if (!token) {
                setError('User authentication required. Please log in again.');
                setLoading(false);
                return;
            }            // Create active charging record in database
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/active-charging`, {
                station: station['Station Name'] || station.name,
                date: date,
                time: time
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Active charging record created:", response.data);

            setTimeout(() => {
                setIsCharging(true);
                setError('');
                setElapsedTime(0);
                startTimer();
                setLoading(false);
                console.log("Charging started successfully");
            }, 500);

        } catch (err) {
            console.error("Error in startCharging:", err);
            setError(err.response?.data?.message || 'Error starting charging. Please try again.');
            setLoading(false);
        }
    };    const stopCharging = async () => {
        try {
            setLoading(true);
            
            // Get token for user authentication
            const token = localStorage.getItem('token');
            if (!token) {
                setError('User authentication required. Please log in again.');
                setLoading(false);
                return;
            }
            
            // Display a brief confirmation message
            setError('');
            setChargingStatus('Ending charging session...');
            
            // Stop the charging timer
            stopTimer();
              // Delete active charging record from database
            try {
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/active-charging`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: {
                        station: station['Station Name'] || station.name,
                        date: date,
                        time: time
                    }
                });
                console.log("Active charging record deleted");
            } catch (deleteErr) {
                console.error("Error deleting active charging record:", deleteErr);
                // Continue with charging completion even if delete fails
            }
            
            // Complete charging process
            setTimeout(() => {
                // Calculate battery gained
                const batteryGained = batteryLevel - incomingBatteryLevel;
                
                // Update summary with charging details
                setChargingSummary({
                    duration: elapsedTime,
                    initialBattery: incomingBatteryLevel,
                    finalBattery: batteryLevel,
                    batteryGained: batteryGained.toFixed(1)
                });
                
                // Set charging as complete
                setIsCharging(false);
                setShowSummary(true);
                setLoading(false);
                
                // Clear status message
                setChargingStatus('');
                
                // Display success toast or message if needed
                console.log('Charging completed successfully. Please proceed to payment.');
            }, 2000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error stopping charging. Please try again.');
            setLoading(false);
        }
    };    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
            // Simulate battery increasing during charging
            setBatteryLevel(prevLevel => {
                // Calculate rate based on estimated time or use default rate
                const rate = estimatedChargeTime ? (100 - incomingBatteryLevel) / (estimatedChargeTime * 60) : 0.02;
                const newLevel = Math.min(100, prevLevel + rate);
                
                // Auto-stop charging when battery reaches 100%
                if (newLevel >= 100 && prevLevel < 100) {
                    setTimeout(() => {
                        console.log("Battery reached 100%, stopping charging automatically");
                        setChargingStatus('Battery full! Stopping charging automatically...');
                        stopCharging();
                    }, 1000);
                }
                
                return newLevel;
            });
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
    };

    useEffect(() => {
        return () => stopTimer();
    }, []);

    const formatElapsedTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getBatteryStatus = (level) => {
        if (level < 20) return "Low";
        if (level < 50) return "Charging";
        if (level < 80) return "Good";
        return "Excellent";
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${remainingSeconds}s`;
    };

    const goToPayment = () => {

        // Get the booking ID from the URL or session storage if available
        const bookingId = location.state?.bookingId || '';
        
        navigate('/payment', {
            state: {
                bookingId,
                station,
                date,
                time,
                chargingTime: elapsedTime,
                initialBattery: incomingBatteryLevel || 0,
                finalBattery: batteryLevel,
                batteryGained: chargingSummary.batteryGained
            }
        });

    };

    const handleStartButtonClick = () => {
        console.log("Start button clicked");
        startCharging();
    };

    if (!station) {
        return (
            <div className="charging-container">
                <div className="error-message">
                    Station not selected. Please go back and select a charging station.
                </div>
                <Link to="/map" className="action-button">
                    Close
                </Link>
            </div>
        );
    }

    return (
        <div className="charging-container">
            <div className="content-area">
                {/* Header */}
                <div className="charging-header">
                    <h2>Charging Session</h2>
                    <div className="station-name">{station['Station Name']}</div>
                </div>

                {/* Station Details */}
                <div className="station-details">
                    <div className="detail-item">
                        <LocationIcon />
                        <span className="label">Address:</span>
                        <span className="value">{station.Address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <CityIcon />
                        <span className="label">City:</span>
                        <span className="value">{station.City || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <CalendarIcon />
                        <span className="label">Date:</span>
                        <span className="value rtl-text">{date.includes('-') ? formatDisplayDate(date) : date}</span>
                    </div>
                    <div className="detail-item">
                        <ClockIcon />
                        <span className="label">Start Time:</span>
                        <span className="value">{time}</span>
                    </div>
                </div>

                {/* Battery Level */}
                <div className="battery-section">
                    <div className="battery-label">
                        <BatteryIcon />
                        <span>Battery Level:</span>
                    </div>
                    <div className="battery-container">
                        <div className="battery-bar">
                            <div
                                className={`battery-level ${isCharging ? 'charging' : ''}`}
                                style={{ width: `${batteryLevel}%` }}>
                                <span className="battery-percentage">{Math.round(batteryLevel)}%</span>
                            </div>
                        </div>                        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>
                            <span className="battery-status">{getBatteryStatus(batteryLevel)}</span>
                        </div>
                    </div>
                </div>                {/* Charging Status / Timer */}
                <div className="timer-section">
                    {isCharging ? (
                        <>
                            <div className="timer-display">{formatElapsedTime(elapsedTime)}</div>
                            <div className="charging-status">⚡ Charging in progress</div>
                            {batteryLevel >= 99.5 && (
                                <div className="battery-full-warning">
                                    🔋 Almost full! Charging will stop automatically at 100%
                                </div>
                            )}
                            {estimatedChargeTime && endTime && (
                                <div className="estimated-end">
                                    Estimated completion at <strong>{endTime}</strong>
                                </div>
                            )}
                        </>

                    ) : chargingStatus ? (
                        <div className="charging-status">
                            {chargingStatus}
                        </div>

                    ) : (
                        <div className="charging-status">
                            Ready to start charging
                        </div>
                    )}
                </div>

                {/* Instructions */}
                {!isCharging && !showSummary && (
                    <div className="charging-instructions">
                        Connect and press start to begin charging
                    </div>
                )}

                {/* Error Message */}
                {error && <div className="error-message">{error}</div>}

                {/* Action Button */}
                {isCharging ? (
                    <button
                        className="action-button stop-button"
                        onClick={stopCharging}
                        disabled={loading}
                    >
                        Stop Charging
                    </button>
                ) : !showSummary ? (
                    <button
                        className="action-button start-button"
                        onClick={handleStartButtonClick}
                        disabled={loading}
                    >
                        Confirm Booking
                    </button>
                ) : null}
            </div>

            {/* Charging Summary Modal with Overlay */}
            {showSummary && (
                <>
                    <div className="modal-overlay" onClick={goToPayment}></div>
                    <div className="charging-summary">
                        <div className="summary-header">
                            <h2 className="summary-title">Charging Complete</h2>
                            <p className="summary-subtitle">Charging Session Summary</p>
                        </div>

                        <div className="summary-content">
                            <div className="summary-item">
                                <FaClock className="summary-icon" />
                                <span className="summary-label">Total Charging Time</span>
                                <span className="summary-value">{formatTime(chargingSummary.duration)}</span>
                            </div>

                            <div className="summary-item">
                                <FaBatteryHalf className="summary-icon" />
                                <span className="summary-label">Initial Battery</span>
                                <span className="summary-value">{chargingSummary.initialBattery}%</span>
                            </div>

                            <div className="summary-item">
                                <FaBatteryFull className="summary-icon" />
                                <span className="summary-label">Final Battery</span>
                                <span className="summary-value">{Math.round(chargingSummary.finalBattery)}%</span>
                            </div>

                            
                            <div className="summary-message">
                                Your charging session has been completed successfully.
                                Please proceed to payment to complete your transaction.
                            </div>

                        </div>

                        <div className="summary-actions">
                            <button onClick={goToPayment} className="action-button primary-button">
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                </>
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
                <Link to="/favorites" className="bottom-bar-button">
                    <HeartIcon />
                    <span>Favorites</span>
                </Link>
                <Link to="/personal-area" className="bottom-bar-button">
                    <UserIcon />
                    <span>Profile</span>
                </Link>
                <button
                    className="bottom-bar-button"
                    onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }}
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Charging;