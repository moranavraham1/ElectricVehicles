import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import enUS from 'date-fns/locale/en-US';
import 'react-datepicker/dist/react-datepicker.css';
import '../designs/Appointment.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

registerLocale('en-US', enUS);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { station, batteryLevel } = location.state || {};

  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!station) {
    return <div>Station details not found.</div>;
  }

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentDate || !appointmentTime) {
      setErrorMessage('Please select a date and time.');
      return;
    }
    const formattedDate = appointmentDate.toISOString().split('T')[0];
    const appointmentDateTime = new Date(`${formattedDate}T${appointmentTime}`);
    const now = new Date();
    if (appointmentDateTime <= now) {
      setErrorMessage('The selected date and time have already passed. Please choose a future time.');
      return;
    }
    setErrorMessage('');

    setShowConfirmation(true);
  };

  const confirmAppointment = async () => {
    const formattedDate = appointmentDate.toISOString().split('T')[0];
    const userEmail = localStorage.getItem('loggedInUser');
    const payload = {
      email: userEmail,
      stationName: station['Station Name'],
      address: station.Address,
      city: station.City,
      chargingStations: station['Duplicate Count'],
      distance: station.distance,
      appointmentDate: formattedDate,
      appointmentTime: appointmentTime,
      currentBattery: batteryLevel
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert(`Appointment successfully scheduled for ${new Date(`${formattedDate}T${appointmentTime}`).toLocaleString()} and a confirmation email has been sent!`);
        navigate('/personal-area');
      } else {
        alert('Appointment was scheduled but there was an error sending the email.');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Error scheduling appointment.');
    }
  };

  const cancelAppointment = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="appointment-container">

      <div className="appointment-header">
        <h1>Schedule Charging Appointment</h1>
      </div>

      <div className="station-info">
        <h2>{station['Station Name']}</h2>
        <div className="station-details">
          <div className="info-row">
            <span className="info-label">Address:</span>
            <span className="info-value">{station.Address}</span>
          </div>
          <div className="info-row">
            <span className="info-label">City:</span>
            <span className="info-value">{station.City}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Charging Stations:</span>
            <span className="info-value">{station['Duplicate Count']}</span>
          </div>
          {station.distance && (
            <div className="info-row">
              <span className="info-label">Distance:</span>
              <span className="info-value">{station.distance} km</span>
            </div>
          )}
        </div>
      </div>

      <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
        <h3>Select Date and Time</h3>
        <div className="form-group">
          <label htmlFor="appointment-date">Date:</label>
          <DatePicker
            id="appointment-date"
            selected={appointmentDate}
            onChange={(date) => setAppointmentDate(date)}
            locale="en-US"
            dateFormat="yyyy-MM-dd"
            placeholderText="Select Date"
            minDate={new Date()}
            className="date-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="appointment-time">Time:</label>
          <input
            type="time"
            id="appointment-time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="time-input"
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className="submit-button">Confirm Appointment</button>
      </form>

      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Appointment</h3>
            <p>Schedule an appointment for {appointmentDate?.toLocaleDateString()} at {appointmentTime}?</p>
            <div className="confirmation-buttons">
              <button className="confirm-button" onClick={confirmAppointment}>
                Confirm
              </button>
              <button className="cancel-button" onClick={cancelAppointment}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;
