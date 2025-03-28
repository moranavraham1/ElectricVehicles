import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import enUS from 'date-fns/locale/en-US';
import 'react-datepicker/dist/react-datepicker.css';
import '../designs/Appointment.css';

registerLocale('en-US', enUS);

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { station, batteryLevel } = location.state || {}; // 🔄 שינוי: קבלת batteryLevel מהניווט

  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!station) {
    return <div>No station details available.</div>;
  }

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentDate || !appointmentTime) {
      setErrorMessage('Please select both date and time.');
      return;
    }
    const formattedDate = appointmentDate.toISOString().split('T')[0];
    const appointmentDateTime = new Date(`${formattedDate}T${appointmentTime}`);
    const now = new Date();
    if (appointmentDateTime <= now) {
      setErrorMessage('The selected date and time have passed. Please choose a future time.');
      return;
    }
    setErrorMessage('');

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
      currentBattery: batteryLevel // 🔄 שינוי: שליחת אחוז הסוללה לשרת
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert(`Appointment booked for ${appointmentDateTime.toLocaleString()} and email sent!`);
        navigate('/personal-area');
      } else {
        alert('Appointment booked but there was an error sending the email.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment.');
    }
  };

  return (
    <div className="appointment-container">
      <h1>Station Appointment</h1>
      <div className="station-info">
        <h2>{station['Station Name']}</h2>
        <p><strong>Address:</strong> {station.Address}</p>
        <p><strong>City:</strong> {station.City}</p>
        <p><strong>Charging Stations:</strong> {station['Duplicate Count']}</p>
        {station.distance && (
          <p><strong>Distance:</strong> {station.distance} km</p>
        )}
      </div>

      <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
        <h3>Choose Appointment Date &amp; Time</h3>
        <div className="form-group">
          <label htmlFor="appointment-date">Date:</label>
          <DatePicker
            id="appointment-date"
            selected={appointmentDate}
            onChange={(date) => setAppointmentDate(date)}
            locale="en-US"
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
          />
        </div>
        <div className="form-group">
          <label htmlFor="appointment-time">Time:</label>
          <input
            type="time"
            id="appointment-time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className="submit-button">Book Appointment</button>
      </form>

      <button className="back-button" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
};

export default Appointment;
