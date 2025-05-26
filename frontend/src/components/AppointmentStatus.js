import React from 'react';
import PropTypes from 'prop-types';
import '../designs/AppointmentStatus.css';

// Status Icons
const PendingIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ApprovedIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const RejectedIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const LateIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
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

const AppointmentStatus = ({ status, date, time, onViewAlternatives }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time to be more readable
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:${minutes} ${period}`;
  };

  // Calculate time until appointment
  const getTimeUntilAppointment = () => {
    const now = new Date();
    const appointmentDate = new Date(`${date}T${time}`);

    if (isNaN(appointmentDate.getTime())) {
      return 'Invalid date';
    }

    // Calculate difference in milliseconds
    const diff = appointmentDate - now;

    // If appointment has passed
    if (diff < 0) return 'Appointment has passed';

    // Calculate days, hours, minutes
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  // Get approval status info
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <PendingIcon />,
          label: 'Pending Approval',
          description: 'Your appointment is waiting for approval. Results will be available 1 hour before the scheduled time.',
          class: 'pending-status'
        };
      case 'approved':
        return {
          icon: <ApprovedIcon />,
          label: 'Approved',
          description: 'Your appointment has been approved! Please arrive at the station on time.',
          class: 'approved-status'
        };
      case 'rejected':
        return {
          icon: <RejectedIcon />,
          label: 'Rejected',
          description: 'Your appointment was rejected due to high demand or priority system. You can view alternatives below.',
          class: 'rejected-status'
        };
      case 'late_registration':
        return {
          icon: <LateIcon />,
          label: 'Late Registration',
          description: 'You registered less than 1 hour before the scheduled time when all stations were already allocated.',
          class: 'late-status'
        };
      default:
        return {
          icon: <PendingIcon />,
          label: 'Unknown',
          description: 'Status is unknown.',
          class: 'unknown-status'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const timeUntil = getTimeUntilAppointment();
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(time);

  return (
    <div className={`appointment-status ${statusInfo.class}`}>
      <div className="status-header">
        <div className="status-icon">{statusInfo.icon}</div>
        <h3 className="status-label">{statusInfo.label}</h3>
      </div>

      <div className="status-content">
        <p className="status-description">{statusInfo.description}</p>

        <div className="time-details">
          <div className="time-detail">
            <CalendarIcon />
            <span>{formattedDate}</span>
          </div>
          <div className="time-detail">
            <ClockIcon />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="countdown">
          <div className="countdown-label">Time until appointment:</div>
          <div className="countdown-value">{timeUntil}</div>
        </div>

        {(status === 'rejected' || status === 'late_registration') && (
          <button className="view-alternatives-btn" onClick={onViewAlternatives}>
            View Alternative Appointments
          </button>
        )}
      </div>
    </div>
  );
};

AppointmentStatus.propTypes = {
  status: PropTypes.oneOf(['pending', 'approved', 'rejected', 'late_registration']).isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  onViewAlternatives: PropTypes.func
};

export default AppointmentStatus; 