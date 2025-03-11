import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChargeHistory from "./ChargeHistory";
import FutureBookings from "./FutureBookings";
import ChangePassword from "./ChangePassword";
import "../designs/PersonalArea.css";
import logo from "../assets/logo.jpg";

function PersonalArea() {
  const [userDetails, setUserDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/fetch-details`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user details");

        const data = await response.json();
        setUserDetails(data);
        setUpdatedDetails(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Error loading user details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  // Fetch appointments for the logged in user
  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/appointments`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments);
        } else {
          console.error('Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };

    fetchAppointments();
  }, []);

  // שמירת עדכון פרטי משתמש
  const handleUpdate = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/update-details`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedDetails),
        }
      );

      if (!response.ok) throw new Error("Failed to update details");

      setUserDetails(updatedDetails);
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
            onChange={(e) =>
              setUpdatedDetails({ ...updatedDetails, firstName: e.target.value })
            }
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={updatedDetails.lastName}
            onChange={(e) =>
              setUpdatedDetails({ ...updatedDetails, lastName: e.target.value })
            }
            placeholder="Last Name"
          />
          <input
            type="email"
            name="email"
            value={updatedDetails.email}
            onChange={(e) =>
              setUpdatedDetails({ ...updatedDetails, email: e.target.value })
            }
            placeholder="Email"
          />
          <input
            type="text"
            name="phone"
            value={updatedDetails.phone}
            onChange={(e) =>
              setUpdatedDetails({ ...updatedDetails, phone: e.target.value })
            }
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

      {/* New section for displaying booked appointments */}
      <div className="appointments-section">
        <h2>Your Appointments</h2>
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-item">
              <p>
                <strong>Station:</strong> {appointment.stationName}
              </p>
              <p>
                <strong>Date:</strong> {appointment.appointmentDate}
              </p>
              <p>
                <strong>Time:</strong> {appointment.appointmentTime}
              </p>
            </div>
          ))
        ) : (
          <p>You have no appointments booked.</p>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <Link to="/home" className="bottom-bar-button">Home</Link>
        <Link to="/personal-area" className="bottom-bar-button">Personal Area</Link>
        <Link to="/favorites" className="bottom-bar-button">Favorites</Link>
        <Link to="/map" className="bottom-bar-button">Search on Map</Link>
        <button className="bottom-bar-button logout-button" onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</button>
      </div>
    </div>
  );
}

export default PersonalArea;