import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import "../designs/FutureBookings.css";
import AppointmentStatus from "../components/AppointmentStatus";
import AppointmentAlternatives from "../components/AppointmentAlternatives";
import axios from "axios";
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';


// SVG Icons
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

const LocationIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ChargingIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const StopIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const CarIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
    <circle cx="6.5" cy="16.5" r="2.5"></circle>
    <circle cx="16.5" cy="16.5" r="2.5"></circle>
  </svg>
);

// New payment icon
const PaymentIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

// New completed icon
const CompletedIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

function FutureBookings() {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);


  const [activeCharging, setActiveCharging] = useState(null);
  const [currentTime, setCurrentTime] = useState({ date: "", hour: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentAlternatives, setAppointmentAlternatives] = useState([]);
  const [sortOrder, setSortOrder] = useState("upcoming"); // "upcoming" or "past"
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "approved", "rejected", "paid"
  const navigate = useNavigate();
  const location = useLocation();

  // Show success notification if redirected from payment page
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      showNotification("Payment completed successfully!");
    }
  }, [location.state]);


  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const hourStr = `${now.getHours()}:00`;
    setCurrentTime({ date: dateStr, hour: hourStr });
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchActiveCharging();

    fetchPayments();
    fetchAppointments();

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


  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payment history");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };


  const fetchActiveCharging = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setActiveCharging(data);
    } catch (error) {
      console.error("Error fetching active charging:", error);
    }
  };


  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("loggedInUser");
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:3001'}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email }
      });

      if (response.data && response.data.appointments) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchAppointmentAlternatives = async (appointmentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL || 'https://localhost:3001'}/api/appointments/alternatives/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAppointmentAlternatives(response.data.alternatives || []);
      setShowAlternatives(true);
    } catch (error) {
      console.error("Error fetching appointment alternatives:", error);
      setAppointmentAlternatives([]);
      setShowAlternatives(true);
    } finally {
      setLoading(false);
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
        fetchBookings();
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

    if (type === "error") {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getBookingStatus = (booking) => {

    // Check if the booking has been paid
    if (booking.paymentStatus === 'paid' || booking.status === 'paid') {
      return "completed";
    }

    const now = new Date();
    const bookingDate = new Date(`${booking.date}T${booking.time}`);
    const isPast = bookingDate < now;

    if (isPast) {
      return "past";
    }

    if (activeCharging && activeCharging.station === booking.station) {
      return "charging";
    }

    // Check if current time matches the booking's time
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const bookingHour = parseInt(booking.time.split(":")[0]);
    const isToday = booking.date === today;
    const isCurrentHour = isToday && bookingHour === currentHour;

    if (isCurrentHour) {
      return "now";
    }

    return "upcoming";
  };

  // Sort bookings by date and time
  const sortBookings = (bookingsToSort) => {
    return [...bookingsToSort].sort((a, b) => {
      const dateA = new Date(`${a.date || a.appointmentDate}T${a.time || a.appointmentTime}`);
      const dateB = new Date(`${b.date || b.appointmentDate}T${b.time || b.appointmentTime}`);

      // For "upcoming" sort (default) - closest date first
      if (sortOrder === "upcoming") {
        return dateA - dateB;
      }
      // For "past" sort - most recent past appointment first
      return dateB - dateA;
    });
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    // First apply the tab filters
    if (activeTab === "upcoming") {
      // Include both upcoming bookings and any bookings with 'approved' status
      filtered = filtered.filter((b) => 
        getBookingStatus(b) === "upcoming" || b.status === 'approved'
      );
    }
    else if (activeTab === "past") filtered = filtered.filter((b) => ["past", "completed"].includes(getBookingStatus(b)));
    else if (activeTab === "completed") filtered = filtered.filter((b) => getBookingStatus(b) === "completed");
    // By default (activeTab === "all"), show all bookings including approved ones

    // Then apply additional status filters if they're set
    if (filterStatus === "approved") {
      filtered = filtered.filter(b => b.status === 'approved');
    } else if (filterStatus === "rejected") {
      filtered = filtered.filter(b => b.status === 'rejected' || b.status === 'late_registration');
    } else if (filterStatus === "paid") {
      filtered = filtered.filter(b => {
        const payment = findPaymentForBooking(b);
        return payment !== undefined;
      });
    }

    // Finally sort the results
    return sortBookings(filtered);
  };

  const getBookingCountByStatus = (status) => {
    return bookings.filter((b) => {
      if (status === "past") return ["past", "completed"].includes(getBookingStatus(b));
      return getBookingStatus(b) === status;
    }).length;
  };

  const findPaymentForBooking = (booking) => {
    return payments.find(p =>
      p.bookingId === booking._id ||
      (p.station === booking.station && p.bookingDate === booking.date && p.bookingTime === booking.time)
    );

  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredBookings = getFilteredBookings();


  const handleViewAlternatives = (appointment) => {
    setSelectedAppointment(appointment);
    fetchAppointmentAlternatives(appointment._id);
  };

  const handleSelectAlternative = async (alternative) => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("loggedInUser");

      // Book the alternative slot
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL || 'https://localhost:3001'}/api/appointments`,
        {
          email,
          stationName: alternative.stationName,
          appointmentDate: alternative.appointmentDate,
          appointmentTime: alternative.appointmentTime,
          address: alternative.address,
          city: alternative.city
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh appointments
      fetchAppointments();
      setShowAlternatives(false);
      showNotification("New appointment booked successfully!");
    } catch (error) {
      console.error("Error booking alternative appointment:", error);
      showNotification("Failed to book alternative appointment", "error");
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setActiveTab('appointments'); // Reset to all appointments tab
    setFilterStatus('all'); // Reset status filter
    setSortOrder('upcoming'); // Reset sort order to default
  };

  // Get filtered appointments based on tab
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply tab filters first
    if (activeTab === 'pending') {
      filtered = filtered.filter(app => app.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(app => app.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(app => app.status === 'rejected' || app.status === 'late_registration');
    }

    // Apply status filters if set
    if (filterStatus === "paid") {
      filtered = filtered.filter(app => {
        // Check if this appointment has a payment associated
        return payments.some(p =>
          p.appointmentId === app._id ||
          (p.station === app.stationName && p.date === app.appointmentDate && p.time === app.appointmentTime)
        );
      });
    }

    // Sort the results
    return sortBookings(filtered);
  };

  const getAppointmentCountByStatus = (status) => {
    if (status === 'rejected') {
      return appointments.filter(app => app.status === 'rejected' || app.status === 'late_registration').length;
    }
    return appointments.filter(app => app.status === status).length;
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "upcoming" ? "past" : "upcoming");
  };

  if (loading && bookings.length === 0 && appointments.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your appointments...</p>

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


      {loading && bookings.length === 0 && appointments.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your appointments...</p>

        </div>
      ) : error ? (
        <div className="error-message">
          <WarningIcon />
          <p>{error}</p>
        </div>

      ) : bookings.length === 0 && appointments.length === 0 ? (
        <div className="no-bookings">
          <CalendarIcon />
          <p>You have no upcoming appointments</p>

          <button className="book-now-btn" onClick={() => navigate('/home')}>
            Book a charging station
          </button>
        </div>
      ) : (
        <div className="bookings-wrapper">

          {/* Sort and Filter Controls */}
          <div className="controls-container">
            <div className="sort-controls">
              <label>Sort by:</label>
              <button
                className={`sort-btn ${sortOrder === "upcoming" ? "active" : ""}`}
                onClick={toggleSortOrder}
              >
                {sortOrder === "upcoming" ? "Upcoming First" : "Recent First"}
              </button>
            </div>

            <div className="filter-controls">
              <label>Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Existing Bookings Categories */}
          {bookings.length > 0 && (
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
                  className={`category-tab ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => handleTabChange('completed')}
                >
                  Completed ({getBookingCountByStatus('completed')})
                </button>
              </div>
            </div>
          )}

          {/* Appointment Categories */}
          {appointments.length > 0 && (
            <div className="appointments-categories">
              <h4>Appointment Status</h4>
              <div className="category-tabs">
                <button
                  className={`category-tab ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  All Appointments ({appointments.length})
                </button>
                <button
                  className={`category-tab ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending ({getAppointmentCountByStatus('pending')})
                </button>
                <button
                  className={`category-tab ${activeTab === 'approved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('approved')}
                >
                  Approved ({getAppointmentCountByStatus('approved')})
                </button>
                <button
                  className={`category-tab ${activeTab === 'rejected' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rejected')}
                >
                  Rejected ({getAppointmentCountByStatus('rejected')})
                </button>
              </div>
            </div>
          )}

          {/* Display filtered bookings if not in appointment tabs */}
          {!['appointments', 'pending', 'approved', 'rejected'].includes(activeTab) && (
            <>
              {filteredBookings.length === 0 ? (
                <div className="no-bookings">
                  <p>No {activeTab !== 'all' ? activeTab : ''} bookings found with the current filters</p>
                  {(activeTab !== 'all' || filterStatus !== 'all') && (
                    <button className="view-all-btn" onClick={resetFilters}>
                      Reset all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="bookings-list">
                  {getFilteredBookings().map((booking, index) => {
                    const status = getBookingStatus(booking);
                    const payment = findPaymentForBooking(booking);

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
                                    status === 'ready' ? 'Ready to Start' :
                                      status === 'completed' ? 'Completed' : 'Past'}
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

                            {status === 'past' && !payment && (
                              <div className="status-message past">
                                <p>This booking has expired</p>
                              </div>
                            )}

                            {status === 'completed' && payment && (
                              <div className="payment-info">
                                <h5 className="payment-heading">Payment Details</h5>
                                <div className="payment-detail">
                                  <PaymentIcon />
                                  <span>Amount: ₪{payment.amount}</span>
                                </div>
                                {payment.chargingTime && (
                                  <div className="payment-detail">
                                    <ClockIcon />
                                    <span>Actual Charging: {payment.chargingTime} minutes</span>
                                  </div>
                                )}
                                {payment.initialBattery && payment.finalBattery && (
                                  <div className="payment-detail">
                                    <ChargingIcon />
                                    <span>Battery: {payment.initialBattery}% → {Math.round(payment.finalBattery)}%</span>
                                  </div>
                                )}
                                <div className="payment-detail">
                                  <CompletedIcon />
                                  <span>Payment: Completed</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Display appointments if in appointment tabs */}
          {['appointments', 'pending', 'approved', 'rejected'].includes(activeTab) && (
            <>
              {getFilteredAppointments().length === 0 ? (
                <div className="no-bookings">
                  <p>No {activeTab !== 'appointments' ? activeTab : ''} appointments found with the current filters</p>
                  {(activeTab !== 'appointments' || filterStatus !== 'all') && (
                    <button className="view-all-btn" onClick={resetFilters}>
                      Reset all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="appointments-list">
                  {getFilteredAppointments().map((appointment, index) => (
                    <div key={index} className="appointment-card">
                      <AppointmentStatus
                        status={appointment.status}
                        date={appointment.appointmentDate}
                        time={appointment.appointmentTime}
                        onViewAlternatives={() => handleViewAlternatives(appointment)}
                      />
                      <div className="appointment-location">
                        <div className="location-details">
                          <LocationIcon />
                          <div>
                            <h4>{appointment.stationName}</h4>
                            <p>{appointment.address}, {appointment.city}</p>
                          </div>
                        </div>

                        {appointment.status !== 'approved' && (
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelBooking(appointment._id)}
                          >
                            <CancelIcon /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Alternatives Modal */}
      {showAlternatives && (
        <div className="modal-overlay">
          <AppointmentAlternatives
            alternatives={appointmentAlternatives}
            onClose={() => setShowAlternatives(false)}
            onSelectAlternative={handleSelectAlternative}
          />
        </div>
      )}

    </div>
  );
}

export default FutureBookings;