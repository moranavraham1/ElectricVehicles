import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../designs/AppointmentAlternatives.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

// Icons
const LocationIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const AppointmentAlternatives = ({ alternatives, onClose, onSelectAlternative }) => {
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle booking an alternative
  const handleBookAlternative = (alternative) => {
    if (onSelectAlternative) {
      onSelectAlternative(alternative);
    } else {
      // If no callback, navigate to appointment booking with this station
      navigate('/appointment', {
        state: {
          station: {
            'Station Name': alternative.stationName,
            Address: alternative.address,
            City: alternative.city
          }
        }
      });
    }
  };

  return (
    <div className="alternatives-container">
      <div className="alternatives-header">
        <h2>Alternative Appointments</h2>
        <button className="close-button" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      {alternatives && alternatives.length > 0 ? (
        <div className="alternatives-list">
          {alternatives.map((alternative, index) => (
            <div key={index} className="alternative-item">
              <div className="alternative-info">
                <h3>{alternative.stationName}</h3>

                <div className="detail-row">
                  <LocationIcon />
                  <span>{alternative.address}, {alternative.city}</span>
                </div>

                <div className="detail-row">
                  <CalendarIcon />
                  <span>{formatDate(alternative.appointmentDate)}</span>
                </div>

                <div className="detail-row">
                  <ClockIcon />
                  <span>{alternative.appointmentTime}</span>
                </div>
              </div>

              <button
                className="book-btn"
                onClick={() => handleBookAlternative(alternative)}
              >
                Book This Slot
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-alternatives">
          <p>No alternative appointments available at this time.</p>
          <p>Please try again later or check for different dates.</p>
          <button
            className="search-new-btn"
            onClick={() => navigate('/home')}
          >
            Search for New Station
          </button>
        </div>
      )}
    </div>
  );
};

AppointmentAlternatives.propTypes = {
  alternatives: PropTypes.arrayOf(
    PropTypes.shape({
      stationName: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      appointmentDate: PropTypes.string.isRequired,
      appointmentTime: PropTypes.string.isRequired
    })
  ),
  onClose: PropTypes.func.isRequired,
  onSelectAlternative: PropTypes.func
};

export default AppointmentAlternatives; 