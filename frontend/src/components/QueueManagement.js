import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../designs/QueueManagement.css';

// Admin icon
const AdminIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="18" y1="8" x2="23" y2="13"></line>
    <line x1="23" y1="8" x2="18" y2="13"></line>
  </svg>
);

// Status icons
const PendingIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ApprovedIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const RejectedIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const LateIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
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

const QueueManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStation, setFilterStation] = useState('');
  const [stations, setStations] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Fetch all appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:3000'}/api/appointments/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAppointments(response.data.appointments);
        
        // Extract unique stations for filtering
        const uniqueStations = [...new Set(response.data.appointments.map(app => app.stationName))];
        setStations(uniqueStations);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  // Filter appointments based on criteria
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by date
    const dateMatches = !filterDate || appointment.appointmentDate === filterDate;
    
    // Filter by status
    const statusMatches = filterStatus === 'all' || appointment.status === filterStatus;
    
    // Filter by station
    const stationMatches = !filterStation || appointment.stationName === filterStation;
    
    return dateMatches && statusMatches && stationMatches;
  });
  
  // Handle approval
  const handleApprove = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:3000'}/api/appointments/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setAppointments(appointments.map(app => 
        app._id === id ? { ...app, status: 'approved', approvalDate: new Date() } : app
      ));
      
      alert('Appointment approved successfully');
    } catch (err) {
      console.error('Error approving appointment:', err);
      alert('Failed to approve appointment');
    } finally {
      setLoading(false);
    }
  };
  
  // Show reject modal
  const showRejectModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRejectReason('');
    
    // Show the modal (implement with CSS display)
    document.getElementById('reject-modal').style.display = 'flex';
  };
  
  // Hide reject modal
  const hideRejectModal = () => {
    document.getElementById('reject-modal').style.display = 'none';
    setSelectedAppointment(null);
  };
  
  // Handle rejection
  const handleReject = async () => {
    if (!selectedAppointment) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:3000'}/api/appointments/reject/${selectedAppointment._id}`, 
        { reason: rejectReason || 'Rejected by administrator' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setAppointments(appointments.map(app => 
        app._id === selectedAppointment._id ? { ...app, status: 'rejected', rejectionReason: rejectReason } : app
      ));
      
      hideRejectModal();
      alert('Appointment rejected successfully');
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      alert('Failed to reject appointment');
    } finally {
      setLoading(false);
    }
  };
  
  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <PendingIcon />;
      case 'approved': return <ApprovedIcon />;
      case 'rejected': return <RejectedIcon />;
      case 'late_registration': return <LateIcon />;
      default: return <PendingIcon />;
    }
  };
  
  // Get status class based on status
  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'late_registration': return 'status-late';
      default: return 'status-pending';
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterDate('');
    setFilterStatus('all');
    setFilterStation('');
  };
  
  return (
    <div className="queue-management">
      <div className="queue-management-header">
        <div className="header-title">
          <AdminIcon />
          <h1>Queue Management</h1>
        </div>
        <p className="header-subtitle">Manage and approve charging station appointments</p>
      </div>
      
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="date-filter">Filter by Date:</label>
          <input
            type="date"
            id="date-filter"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="late_registration">Late Registration</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="station-filter">Filter by Station:</label>
          <select
            id="station-filter"
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
          >
            <option value="">All Stations</option>
            {stations.map((station, index) => (
              <option key={index} value={station}>{station}</option>
            ))}
          </select>
        </div>
        
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found matching the current filters.</p>
        </div>
      ) : (
        <div className="appointments-table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Station</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Registration Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className={getStatusClass(appointment.status)}>
                  <td>{appointment.email}</td>
                  <td>
                    <div className="station-info">
                      <span className="station-name">{appointment.stationName}</span>
                      <span className="station-location">{appointment.address}, {appointment.city}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-time-info">
                      <div className="appointment-date">
                        <CalendarIcon />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="appointment-time">
                        <span>{appointment.appointmentTime}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="status-badge">
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status}</span>
                    </div>
                    {appointment.rejectionReason && (
                      <div className="rejection-reason">
                        Reason: {appointment.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {new Date(appointment.registrationTime).toLocaleString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {appointment.status === 'pending' && (
                        <>
                          <button 
                            className="approve-btn" 
                            onClick={() => handleApprove(appointment._id)}
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-btn" 
                            onClick={() => showRejectModal(appointment)}
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(appointment.status === 'rejected' || appointment.status === 'late_registration') && (
                        <button 
                          className="approve-btn" 
                          onClick={() => handleApprove(appointment._id)}
                          disabled={loading}
                        >
                          Override & Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Reject Modal */}
      <div id="reject-modal" className="modal">
        <div className="modal-content">
          <h2>Reject Appointment</h2>
          <p>Are you sure you want to reject this appointment?</p>
          
          {selectedAppointment && (
            <div className="appointment-details">
              <p><strong>User:</strong> {selectedAppointment.email}</p>
              <p><strong>Station:</strong> {selectedAppointment.stationName}</p>
              <p><strong>Date & Time:</strong> {formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.appointmentTime}</p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="reject-reason">Reason for rejection:</label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection (optional)"
              rows="3"
            ></textarea>
          </div>
          
          <div className="modal-buttons">
            <button className="cancel-btn" onClick={hideRejectModal}>Cancel</button>
            <button className="confirm-reject-btn" onClick={handleReject}>Confirm Rejection</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueManagement; 