import React from 'react';
import { useNavigate } from 'react-router-dom';
import QueueManagement from '../components/QueueManagement';
import '../designs/AdminQueueManagement.css';

const BackIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const AdminQueueManagement = () => {
  const navigate = useNavigate();
  
  // Check if user is admin
  const checkAdmin = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/personal-area');
      return false;
    }
    return true;
  };
  
  // Call checkAdmin when component mounts
  React.useEffect(() => {
    const isAdmin = checkAdmin();
    if (!isAdmin) {
      // Show unauthorized message
      alert('Unauthorized access. You must be an admin to view this page.');
    }
  }, []);
  
  return (
    <div className="admin-queue-page">
      <div className="admin-nav-bar">
        <button className="back-button" onClick={() => navigate('/personal-area')}>
          <BackIcon />
          <span>Back to Personal Area</span>
        </button>
      </div>
      
      <div className="admin-content">
        <QueueManagement />
      </div>
    </div>
  );
};

export default AdminQueueManagement; 