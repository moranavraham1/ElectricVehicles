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
        // Get current time in minutes since midnight
        const now = new Date();
        const currentHourInMinutes = now.getHours() * 60 + now.getMinutes();
        const currentDateStr = now.toISOString().split('T')[0];
        
        // קבל את כמות עמדות הטעינה בתחנה
        const numChargingPoints = stationDetails?.["Duplicate Count"] || 1;
        
        // Get the booking we're calculating wait time for
        const targetBooking = sortedQueue[index];
        const [targetHours, targetMinutes] = targetBooking.time.split(":").map(Number);
        const targetTimeInMinutes = targetHours * 60 + targetMinutes;
        const targetDuration = targetBooking.estimatedChargeTime || 30;
        
        // Skip calculation if booking is in the past
        if (targetBooking.date < currentDateStr || 
            (targetBooking.date === currentDateStr && targetTimeInMinutes < currentHourInMinutes)) {
            return "Booking time has passed";
        }
        
        // אם הזמן של ההזמנה טרם הגיע (השעה הנוכחית מוקדמת יותר)
        if (targetBooking.date === currentDateStr && targetTimeInMinutes > currentHourInMinutes) {
            // בדוק אם יש זמן קצר עד התור (פחות מ-10 דקות)
            const minutesToAppointment = targetTimeInMinutes - currentHourInMinutes;
            if (minutesToAppointment <= 10) {
                return `Your booking in ${minutesToAppointment} minutes`;
            }
        }
        
        // מערך שמייצג מתי כל עמדה פנויה (בדקות מאז חצות)
        // Initialize with current time for today's bookings, or 0 for future dates
        const isToday = targetBooking.date === currentDateStr;
        const chargingPoints = Array(numChargingPoints).fill(isToday ? currentHourInMinutes : 0);
        
        // Filter to only include bookings that could affect our target booking
        const relevantBookings = sortedQueue.filter((booking, i) => {
            // Don't include our target booking
            if (i === index) return false;
            
            // Convert booking time to minutes
            const [bookingHours, bookingMinutes] = booking.time.split(":").map(Number);
            const bookingTimeInMinutes = bookingHours * 60 + bookingMinutes;
            const bookingDuration = booking.estimatedChargeTime || 30;
            
            // אם ההזמנה היא למועד מוקדם יותר מהתור שלנו, 
            // בדוק אם היא תסתיים לפני שהתור שלנו מתחיל
            if (bookingTimeInMinutes < targetTimeInMinutes) {
                // חשב את זמן הסיום של ההזמנה האחרת
                const bookingEndTime = bookingTimeInMinutes + bookingDuration;
                
                // אם ההזמנה האחרת מסתיימת לאחר תחילת התור שלנו, היא רלוונטית
                return bookingEndTime > targetTimeInMinutes;
            }
            
            // אם ההזמנה היא לאותו זמן בדיוק כמו שלנו, היא רלוונטית רק אם היא לפנינו בתור
            // (בהתאם למיקום בתור המסודר)
            if (bookingTimeInMinutes === targetTimeInMinutes) {
                return i < index;
            }
            
            // אם ההזמנה היא למועד מאוחר יותר, היא לא רלוונטית
            return false;
        });
        
        // Process all relevant bookings to update charging point availability
        for (const booking of relevantBookings) {
            const [hours, minutes] = booking.time.split(":").map(Number);
            const startTimeInMinutes = hours * 60 + minutes;
            const duration = booking.estimatedChargeTime || 30;
            
            // Find the charging point that will be available first
            let earliestAvailable = Math.min(...chargingPoints);
            let earliestPointIndex = chargingPoints.indexOf(earliestAvailable);
            
            // When this booking will actually start charging
            const actualStart = Math.max(startTimeInMinutes, chargingPoints[earliestPointIndex]);
            
            // Update when this charging point will be free
            chargingPoints[earliestPointIndex] = actualStart + duration;
        }
        
        // Now calculate when our target booking can start
        let earliestAvailable = Math.min(...chargingPoints);
        let earliestPointIndex = chargingPoints.indexOf(earliestAvailable);
        
        // Our actual start time is the later of our booking time or when a point becomes available
        const actualStart = Math.max(targetTimeInMinutes, chargingPoints[earliestPointIndex]);
        const waitTime = actualStart - targetTimeInMinutes;
          // Format the wait time message
        if (waitTime <= 0) {
            return 0; // No waiting time
        } else if (waitTime < 60) {
            return waitTime; // Return wait time in minutes
        } else {
            const hours = Math.floor(waitTime / 60);
            const mins = waitTime % 60;
            return waitTime; // Return total minutes, let the UI format it
        }
    };

    // Format the wait time message
    const formatWaitingTime = (minutes) => {
        if (minutes === 0) {
            return "No waiting time";
        } else if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours} hour${hours !== 1 ? 's' : ''}${mins > 0 ? ` ${mins} minute${mins !== 1 ? 's' : ''}` : ''}`;
        }
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

            {/* האם יש תור למשתמש הנוכחי? */}
            {queue.length > 0 && (() => {
                const sortedQueue = [...queue].sort((a, b) => {
                    if (a.time !== b.time) {
                        return a.time.localeCompare(b.time);
                    }
                    if (a.priorityScore !== b.priorityScore) {
                        return a.priorityScore - b.priorityScore;
                    }
                    return (a.currentBattery ?? 100) - (b.currentBattery ?? 100);
                });

                const userBookingIndex = sortedQueue.findIndex(booking => 
                    booking.user.toLowerCase() === currentUserEmail
                );

                if (userBookingIndex !== -1) {
                    const userBooking = sortedQueue[userBookingIndex];
                    const waitingTime = calculateWaitingTime(userBookingIndex, sortedQueue);
                    const formattedWaitingTime = formatWaitingTime(waitingTime);
                    
                    return (
                        <div className="user-booking-summary">
                            <h3>Your Position in Queue</h3>
                            <div className="user-booking-details">
                                <div className="user-booking-position">
                                    <span className="position-number">{userBookingIndex + 1}</span>
                                    <span className="position-total">of {sortedQueue.length}</span>
                                </div>
                                <div className="user-booking-info">
                                    <div className="user-booking-time">
                                        <span className="time-label">⏰ Time:</span>
                                        <span className="time-value">{userBooking.time}</span>
                                    </div>
                                    <div className="user-waiting-time">
                                        <span className="waiting-time-label">⏳ Estimated Wait:</span>
                                        <span className="waiting-time-value">
                                            {waitingTime === 0 
                                                ? "No waiting - Ready to charge" 
                                                : formattedWaitingTime
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                
                return null;
            })()}

            <div className="queue-actions">
                <button 
                    className="refresh-button" 
                    onClick={refreshQueue} 
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Queue'}
                </button>
                
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
                            // קודם כל למיין את התור לפי זמן, מהמוקדם למאוחר
                            const sortedQueue = [...queue].sort((a, b) => {
                                // המיון הראשי הוא לפי זמן
                                if (a.time !== b.time) {
                                    return a.time.localeCompare(b.time);
                                }
                                
                                // רק אם שני תורים באותה שעה, השתמש באלגוריתם העדיפויות
                                if (a.priorityScore !== b.priorityScore) {
                                    return a.priorityScore - b.priorityScore;
                                }
                                
                                // אם גם העדיפויות שוות, העדף רמת סוללה נמוכה יותר
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
                                            </div>                                            <div className="queue-item-row">
                                                <span className="waiting-icon">⏳</span> 
                                                <strong>
                                                    {waitingTime === 0 
                                                        ? "No waiting time - ready to charge" 
                                                        : `Estimated wait: ${formatWaitingTime(waitingTime)}`
                                                    }
                                                </strong>
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