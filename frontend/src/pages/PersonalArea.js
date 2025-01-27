import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../designs/PersonalArea.css';

function PersonalArea() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('loggedInUser');

      if (!token || !username) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/fetch-details?username=${username}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch user details');
        }

        const data = await response.json();
        setUserDetails(data);
        setUpdatedDetails(data);
      } catch (err) {
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/update-details`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDetails),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update details');
      }

      const data = await response.json();
      setUserDetails(data);
      setEditMode(false);
    } catch (err) {
      alert(`Error updating details: ${err.message}`);
    }
  };

  const handleResetPassword = async () => {
    const email = userDetails.email;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to send password reset email');
      }

      alert('Password reset email sent successfully');
    } catch (err) {
      alert(`Error resetting password: ${err.message}`);
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

  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="personal-area-container">
      <h1>Personal Area</h1>
      {editMode ? (
        <div className="editable-user-info">
          <h2>Edit Personal Information</h2>
          <input
            type="text"
            name="firstName"
            value={updatedDetails.firstName}
            onChange={(e) => setUpdatedDetails({ ...updatedDetails, firstName: e.target.value })}
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={updatedDetails.lastName}
            onChange={(e) => setUpdatedDetails({ ...updatedDetails, lastName: e.target.value })}
            placeholder="Last Name"
          />
          <input
            type="email"
            name="email"
            value={updatedDetails.email}
            onChange={(e) => setUpdatedDetails({ ...updatedDetails, email: e.target.value })}
            placeholder="Email"
          />
          <input
            type="text"
            name="phone"
            value={updatedDetails.phone}
            onChange={(e) => setUpdatedDetails({ ...updatedDetails, phone: e.target.value })}
            placeholder="Phone"
          />
          <button onClick={handleUpdate}>
            <i className="fas fa-save"></i> Save
          </button>
          <button onClick={() => setEditMode(false)}>
            <i className="fas fa-times"></i> Cancel
          </button>
        </div>
      ) : (
        <>
          <p>
            <span>First Name:</span> {userDetails.firstName}
          </p>
          <p>
            <span>Last Name:</span> {userDetails.lastName}
          </p>
          <p>
            <span>Email:</span> {userDetails.email}
          </p>
          <p>
            <span>Phone:</span> {userDetails.phone}
          </p>
          <button onClick={() => setEditMode(true)}>
            <i className="fas fa-edit"></i> Edit Info
          </button>
          <button onClick={handleResetPassword}>
            <i className="fas fa-lock"></i> Reset Password
          </button>
        </>
      )}

      {/* סרגל תחתון נשאר ללא שינוי */}
      <div className="bottom-bar">
        <button className="bottom-bar-button logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
        <Link to="/personal-area" className="bottom-bar-button personal">
          <i className="fas fa-user"></i> Personal Area
        </Link>
        <Link to="/favorites" className="bottom-bar-button favorites">
          <i className="fas fa-heart"></i> Favorites
        </Link>
        <Link to="/home" className="bottom-bar-button home">
          <i className="fas fa-home"></i> Home
        </Link>
        <Link to="/map" className="bottom-bar-button map">
          <i className="fas fa-map-marked-alt"></i> Search on Map
        </Link>
      </div>
    </div>
  );
}

export default PersonalArea;
