import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../designs/Charging.css';
import { FaBatteryHalf, FaBatteryFull, FaClock, FaBolt } from 'react-icons/fa';

// SVG Icons
const PlugIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.5 5.5l-7 7M18.5 5.5L16 3l2.5 2.5zm-13 13l7-7m2 4l3 3m-5-1l-1 1M8.5 8.5l-1 1-2-2 1-1M14 18l-1 1-2-2 1-1" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const CityIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="6" x2="12" y2="6.01"></line>
        <line x1="12" y1="10" x2="12" y2="10.01"></line>
        <line x1="12" y1="14" x2="12" y2="14.01"></line>
        <line x1="12" y1="18" x2="12" y2="18.01"></line>
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const BatteryIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
        <line x1="23" y1="13" x2="23" y2="11"></line>
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

const StopIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const MapIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
);

const HeartIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const Charging = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        station,
        date: incomingDate,
        time: incomingTime,
        estimatedChargeTime: incomingChargeTime,
        currentBattery: incomingBatteryLevel,
        targetBattery: incomingTargetLevel
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
    const [batteryLevel, setBatteryLevel] = useState(incomingBatteryLevel || 20); // Use user-provided level or default
    const [targetLevel, setTargetLevel] = useState(incomingTargetLevel || 80); // Use user-provided target or default
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
    }, [station, incomingDate, incomingTime, incomingChargeTime]);

    const startCharging = async () => {
        try {
            setLoading(true);
            console.log("Starting charging process...");

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
            setError('Error starting charging. Please try again.');
            setLoading(false);
        }
    };

    const stopCharging = async () => {
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
            
            // Simulate API call with token authentication (replace with actual API call)
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
            }, 2000); // Complete within 2 seconds for better UX

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error stopping charging. Please try again.');

            setLoading(false);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
            // Simulate battery increasing during charging
            if (batteryLevel < targetLevel) {
                setBatteryLevel(prevLevel => {
                    // Calculate rate based on target and estimated time
                    const rate = estimatedChargeTime ? (targetLevel - incomingBatteryLevel) / (estimatedChargeTime * 60) : 0.01;
                    const newLevel = Math.min(targetLevel, prevLevel + rate);
                    return newLevel;
                });
            }
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
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>
                            <span className="battery-status">{getBatteryStatus(batteryLevel)}</span>
                            {targetLevel && (
                                <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                                    Target: <strong>{targetLevel}%</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charging Status / Timer */}
                <div className="timer-section">
                    {isCharging ? (
                        <>
                            <div className="timer-display">{formatElapsedTime(elapsedTime)}</div>
                            <div className="charging-status">⚡ Charging in progress</div>
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