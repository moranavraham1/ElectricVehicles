import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../designs/Charging.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon, LocationIcon, CityIcon, CalendarIcon, ClockIcon, BatteryIcon } from '../components/common/Icons';
import { FaClock, FaBatteryHalf, FaBatteryFull } from 'react-icons/fa';

const Charging = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        station,
        date: incomingDate,
        time: incomingTime,
        estimatedChargeTime: incomingChargeTime,
        currentBattery: incomingBatteryLevel,
        targetBattery: incomingTargetBattery,
        booking
    } = location.state || {};

    // Debug logging
    useEffect(() => {
        console.log('Location state:', location.state);
        console.log('Incoming battery level:', incomingBatteryLevel);
        console.log('Incoming booking:', booking);
    }, [location.state, incomingBatteryLevel, booking]);

    const [isCharging, setIsCharging] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [estimatedChargeTime, setEstimatedChargeTime] = useState(null);
    const [endTime, setEndTime] = useState('');
    const timerRef = useRef(null);
    
    // Waiting time modal state
    const [showWaitingModal, setShowWaitingModal] = useState(false);
    const [waitingTimeInfo, setWaitingTimeInfo] = useState({ time: 0, stationFull: false });
    
    // Initialize battery level with proper fallback
    const initialBatteryLevel = typeof incomingBatteryLevel === 'number' && !isNaN(incomingBatteryLevel) 
        ? incomingBatteryLevel 
        : 25; // Default to 25% if no valid value provided
    
    const [batteryLevel, setBatteryLevel] = useState(initialBatteryLevel);
    const [targetBatteryLevel, setTargetBatteryLevel] = useState(incomingTargetBattery || 80);
    const [showSummary, setShowSummary] = useState(false);
    const [chargingSummary, setChargingSummary] = useState({
        duration: 0,
        initialBattery: 0,
        finalBattery: 0,
        targetBattery: 0,
        batteryGained: 0
    });

    const [chargingStatus, setChargingStatus] = useState('');

    // Format date for display
    const formatDisplayDate = (dateStr) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    // Auto-start charging when component mounts if we have all required data
    useEffect(() => {
        // Check if we have all the required data to start charging
        if (station && date && time && !isCharging && !loading) {
            console.log("🔌 Auto-starting charging with data:", { station, date, time });
            // Small delay to ensure component is fully mounted
            const timer = setTimeout(() => {
                startCharging();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [station, date, time, isCharging, loading]);

    useEffect(() => {
        let batteryRef;        const monitorBattery = async () => {
            // If we have a valid battery level from the booking, don't use the device's battery
            if (typeof incomingBatteryLevel === 'number' && !isNaN(incomingBatteryLevel)) {
                console.log('Using battery level from booking:', incomingBatteryLevel);
                return;
            }

            try {
                if (navigator.getBattery) {
                    const battery = await navigator.getBattery();
                    batteryRef = battery;

                    const updateLevel = () => {
                        const deviceBatteryLevel = Math.round(battery.level * 100);
                        console.log('Using device battery level:', deviceBatteryLevel);
                        setBatteryLevel(deviceBatteryLevel);
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
            console.log("Station object:", station);
            console.log("Date:", date);
            console.log("Time:", time);

            // Get token for user authentication
            const token = localStorage.getItem('token');
            if (!token) {
                setError('User authentication required. Please log in again.');
                setLoading(false);
                return;
            }

            // Extract station name properly
            const stationName = (station['Station Name'] || station.name || station || '').trim();
            console.log("Station name extracted:", stationName);
            
            // CRITICAL FIX: Check for availability before starting charging
            // This ensures users can't start charging if there's an overlap with another booking
            try {
                const availabilityResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/bookings/waiting-time/${encodeURIComponent(stationName)}/${date}/${time}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                const { waitingTime, stationFull } = availabilityResponse.data;
                console.log("⏰ Waiting time check result:", { waitingTime, stationFull });
                
                // If there's a waiting time or the station is full, prevent charging
                if (waitingTime > 0 || stationFull) {
                    setError('');
                    // Clear any previous errors and show the waiting time message
                    setChargingStatus('');
                    setLoading(false);
                    
                    // Show waiting time UI instead of error
                    return showWaitingTimeModal(waitingTime, stationFull);
                }
                
                console.log("✅ Station is available for charging");
            } catch (availabilityError) {
                console.error("Error checking availability:", availabilityError);
                // Continue with charging attempt even if check fails
            }

            // Create active charging record in database
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/active-charging`, {
                station: stationName,
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
            stopTimer();              // Delete active charging record from database
            try {
                const stationName = (station['Station Name'] || station.name || station || '').trim();
                console.log("Stopping charging for station:", stationName);
                
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/active-charging`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: {
                        station: stationName,
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
                // Calculate battery gained using the initial battery level we calculated
                const batteryGained = batteryLevel - initialBatteryLevel;
                
                // Update summary with charging details
                setChargingSummary({
                    duration: elapsedTime,
                    initialBattery: initialBatteryLevel,
                    finalBattery: batteryLevel,
                    targetBattery: targetBatteryLevel,
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
            setElapsedTime((prev) => prev + 1);            // Simulate battery increasing during charging
            setBatteryLevel(prevLevel => {
                // Use the initial battery level we calculated
                const startLevel = initialBatteryLevel;
                // Calculate rate based on estimated time or use default rate
                const rate = estimatedChargeTime ? (targetBatteryLevel - startLevel) / (estimatedChargeTime * 60) : 0.02;
                const newLevel = Math.min(targetBatteryLevel, prevLevel + rate);
                
                // Auto-stop charging when battery reaches target level
                if (newLevel >= targetBatteryLevel && prevLevel < targetBatteryLevel) {
                    setTimeout(() => {
                        console.log(`Battery reached target level (${targetBatteryLevel}%), stopping charging automatically`);
                        setChargingStatus(`Battery reached target level (${targetBatteryLevel}%)! Stopping charging automatically...`);
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
        
        navigate('/payment', {            state: {
                bookingId,
                station,
                date,
                time,
                chargingTime: elapsedTime,
                initialBattery: initialBatteryLevel,
                finalBattery: batteryLevel,
                batteryGained: chargingSummary.batteryGained
            }
        });

    };

    const handleStartButtonClick = () => {
        console.log("Start button clicked");
        startCharging();
    };

    // Function to show waiting time modal instead of error
    const showWaitingTimeModal = (waitingTime, stationFull) => {
        setWaitingTimeInfo({ time: waitingTime, stationFull });
        setShowWaitingModal(true);
        return false; // Return false to prevent charging from continuing
    };
    
    // Function to view the full queue
    const viewFullQueue = () => {
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const stationName = (station['Station Name'] || station.name || station || '').trim();
        navigate(`/charging-queue/${encodeURIComponent(stationName)}/${today}`);
    };

    // Format waiting time for display
    const formatWaitingTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
        }
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
                            {targetBatteryLevel > batteryLevel && (
                                <div 
                                    className="target-battery-marker"
                                    style={{ 
                                        left: `${targetBatteryLevel}%`, 
                                        position: 'absolute',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        height: '120%',
                                        width: '2px',
                                        backgroundColor: '#4CAF50',
                                        zIndex: 2
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        left: '-12px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        fontSize: '12px'
                                    }}>
                                        {targetBatteryLevel}%
                                    </span>
                                </div>
                            )}
                        </div>                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginTop: 'var(--spacing-sm)' 
                        }}>
                            <span className="battery-status">{getBatteryStatus(batteryLevel)}</span>
                            {targetBatteryLevel > batteryLevel && (
                                <span style={{ fontSize: '14px', color: '#4CAF50' }}>
                                    Target: {targetBatteryLevel}%
                                </span>
                            )}
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
                        </>                    ) : chargingStatus ? (
                        <div className="charging-status">
                            {chargingStatus}
                        </div>

                    ) : null}
                </div>

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
                    </button>                ) : !showSummary ? (
                    <button
                        className="action-button start-charging-button"
                        onClick={handleStartButtonClick}
                        disabled={loading}
                    >
                        Start Charging
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

                            <div className="summary-item">
                                <FaBatteryFull className="summary-icon" />
                                <span className="summary-label">Target Battery</span>
                                <span className="summary-value">{chargingSummary.targetBattery}%</span>
                            </div>
                            
                            <div className="summary-item">
                                <span className="summary-label">Battery Gained</span>
                                <span className="summary-value">+{chargingSummary.batteryGained}%</span>
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

            {/* Waiting Time Modal */}
            {showWaitingModal && (
                <>
                    <div className="modal-overlay" onClick={() => setShowWaitingModal(false)}></div>
                    <div className="waiting-time-modal">
                        <div className="waiting-modal-header">
                            <h2>Charging Station Busy</h2>
                        </div>
                        <div className="waiting-modal-content">
                            {waitingTimeInfo.stationFull && (
                                <div className="station-status">
                                    <span className="status-icon">🔌</span>
                                    <p>All charging points at this station are currently in use.</p>
                                </div>
                            )}
                            
                            <div className="waiting-time-info">
                                <span className="waiting-icon">⏳</span>
                                <p>
                                    <strong>Estimated Waiting Time:</strong>
                                    <span className="waiting-time-value"> {formatWaitingTime(waitingTimeInfo.time)}</span>
                                </p>
                            </div>
                            
                            <div className="waiting-explanation">
                                <p>There {waitingTimeInfo.time === 1 ? 'is' : 'are'} currently other booking{waitingTimeInfo.time !== 1 ? 's' : ''} in progress that will finish before your scheduled time.</p>
                                <p>You can view the full queue to see your position.</p>
                            </div>
                        </div>
                        
                        <div className="waiting-modal-actions">
                            <button onClick={viewFullQueue} className="view-queue-button">
                                View Full Queue
                            </button>
                            <button onClick={() => setShowWaitingModal(false)} className="close-modal-button">
                                Close
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