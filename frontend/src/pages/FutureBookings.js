import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../designs/FutureBookings.css";

// SVG Icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ChargingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
    <circle cx="6.5" cy="16.5" r="2.5"></circle>
    <circle cx="16.5" cy="16.5" r="2.5"></circle>
  </svg>
);

function FutureBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeCharging, setActiveCharging] = useState(null);
  const [currentTime, setCurrentTime] = useState({ date: "", hour: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // New state for tracking active tab
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const hourStr = `${now.getHours()}:00`;
    setCurrentTime({ date: dateStr, hour: hourStr });
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchActiveCharging();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Could not load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCharging = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return; // No active charging or error, which is fine
      }

      const data = await res.json();
      setActiveCharging(data);
    } catch (error) {
      console.error("Error fetching active charging:", error);
      // Not setting error state here as it's not critical
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      setBookings(bookings.filter((booking) => booking._id !== id));
      showNotification("Booking cancelled successfully");
    } catch (error) {
      console.error("Error canceling booking:", error);
      showNotification("Failed to cancel booking", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCharging = async (station, date, time) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/start-charging`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ station, date, time }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        fetchActiveCharging();
        navigate("/charging", {
          state: {
            station,
            date,
            time
          }
        });
      } else {
        showNotification(data.message || "Error starting charging", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error starting charging", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStopCharging = async (station) => {
    if (!window.confirm("Are you sure you want to stop charging?")) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/stop-charging`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ station }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        setActiveCharging(null);
        fetchBookings(); // Refresh bookings after stopping
      } else {
        showNotification(data.message || "Error stopping charging", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error stopping charging", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    // In a real app, this would be a toast notification
    // For simplicity, we're using alert but would be replaced with a proper notification system
    if (type === "error") {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  // Helper function to format date to be more readable
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determine if a booking is upcoming, active, or past
  const getBookingStatus = (booking) => {
    const now = new Date();
    const bookingTime = new Date(`${booking.date}T${booking.time}`);
    const diffMinutes = (bookingTime - now) / 60000;

    const isActive = activeCharging &&
      activeCharging.station === booking.station &&
      activeCharging.date === booking.date &&
      activeCharging.time === booking.time;

    if (isActive) {
      return "active";
    } else if (diffMinutes > 5) {
      return "upcoming";
    } else if (diffMinutes >= -5 && diffMinutes <= 60) {
      return "ready";
    } else {
      return "past";
    }
  };

  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    if (activeTab === "all") {
      return bookings;
    }

    return bookings.filter(booking => getBookingStatus(booking) === activeTab);
  };

  // Get count of bookings by status
  const getBookingCountByStatus = (status) => {
    return bookings.filter(booking => getBookingStatus(booking) === status).length;
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredBookings = getFilteredBookings();

  if (loading && bookings.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <WarningIcon />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="future-bookings">
      <div className="section-header">
        <h3>Your Charging Appointments</h3>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <WarningIcon />
          <p>{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="no-bookings">
          <CalendarIcon />
          <p>You have no upcoming bookings</p>
          <button className="book-now-btn" onClick={() => navigate('/home')}>
            Book a charging station
          </button>
        </div>
      ) : (
        <div className="bookings-wrapper">
          <div className="bookings-categories">
            <div className="category-tabs">
              <button
                className={`category-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                All Bookings ({bookings.length})
              </button>
              <button
                className={`category-tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => handleTabChange('active')}
              >
                Active ({getBookingCountByStatus('active')})
              </button>
              <button
                className={`category-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => handleTabChange('upcoming')}
              >
                Upcoming ({getBookingCountByStatus('upcoming')})
              </button>
              <button
                className={`category-tab ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => handleTabChange('past')}
              >
                Past ({getBookingCountByStatus('past')})
              </button>
              <button
                className={`category-tab ${activeTab === 'ready' ? 'active' : ''}`}
                onClick={() => handleTabChange('ready')}
              >
                Ready ({getBookingCountByStatus('ready')})
              </button>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>No {activeTab !== 'all' ? activeTab : ''} bookings found</p>
              {activeTab !== 'all' && (
                <button className="view-all-btn" onClick={() => handleTabChange('all')}>
                  View all bookings
                </button>
              )}
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map((booking, index) => {
                const status = getBookingStatus(booking);

                return (
                  <div key={index} className={`booking-card ${status}`}>
                    <div className="booking-details">
                      <div className="booking-station-name">
                        <LocationIcon />
                        <h4>{booking.station}</h4>
                        <div className="status-container">
                          <span className={`status-badge ${status}`}>
                            {status === 'active' ? 'Active' :
                              status === 'upcoming' ? 'Upcoming' :
                                status === 'ready' ? 'Ready to Start' : 'Past'}
                          </span>
                          {status === 'active' && (
                            <span className="pulse-indicator"></span>
                          )}
                        </div>
                      </div>

                      <div className="booking-info-grid">
                        <div className="info-item">
                          <CalendarIcon />
                          <div>
                            <label>Date</label>
                            <p>{formatDate(booking.date)}</p>
                          </div>
                        </div>

                        <div className="info-item">
                          <ClockIcon />
                          <div>
                            <label>Time</label>
                            <p>{booking.time}</p>
                          </div>
                        </div>

                        {booking.estimatedChargeTime && (
                          <div className="info-item charging-time">
                            <ChargingIcon />
                            <div>
                              <label>Duration</label>
                              <p>{booking.estimatedChargeTime} minutes</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="booking-actions">
                        {status === 'ready' && (
                          <button
                            className="action-btn start-btn"
                            onClick={() => navigate('/charging', {
                              state: {
                                station: booking.station,
                                date: booking.date,
                                time: booking.time,
                                estimatedChargeTime: booking.estimatedChargeTime
                              }
                            })}
                          >
                            <CarIcon /> Go to Charging
                          </button>
                        )}

                        {status === 'active' && (
                          <button
                            className="action-btn stop-btn"
                            onClick={() => handleStopCharging(booking.station)}
                          >
                            <StopIcon /> Stop Charging
                          </button>
                        )}

                        {status === 'upcoming' && (
                          <button
                            className="action-btn cancel-btn"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            <CancelIcon /> Cancel Booking
                          </button>
                        )}

                        {status === 'upcoming' && (
                          <div className="status-message upcoming">
                            <p>You can start charging 5 minutes before your scheduled time</p>
                          </div>
                        )}

                        {status === 'past' && (
                          <div className="status-message past">
                            <p>This booking has expired</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FutureBookings;