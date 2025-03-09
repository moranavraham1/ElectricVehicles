import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../designs/PersonalArea.css';

function PersonalArea() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // עריכת פרטים אישיים
  const [editMode, setEditMode] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});

  // תורים וגלגלת
  const [appointments, setAppointments] = useState([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // עריכת תור
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [editedAppointment, setEditedAppointment] = useState({});

  const navigate = useNavigate();

  // טעינת פרטי המשתמש
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
  }, [navigate]);

  // טעינת התורים
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userDetails || !userDetails.email) return;

      const token = localStorage.getItem('token');
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/appointments?email=${userDetails.email}`,
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
  }, [userDetails]);

  // שמירת עדכון פרטי משתמש
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
      alert('Details updated successfully!');
    } catch (err) {
      alert(`Error updating details: ${err.message}`);
    }
  };

  // איפוס סיסמה
  const handleResetPassword = async () => {
    const email = userDetails.email;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) throw new Error('Failed to send password reset email');
      alert('Password reset email sent successfully');
    } catch (err) {
      alert(`Error resetting password: ${err.message}`);
    }
  };

  // יציאה
  const handleLogout = () => {
    try {
      localStorage.clear();
      alert('You have been logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // גלגלת תורים
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % appointments.length);
  };
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + appointments.length) % appointments.length);
  };

  // עריכת תור
  const handleEditAppointment = (appointment) => {
    setEditingAppointmentId(appointment._id);
    setEditedAppointment({
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
    });
  };

  // שמירת תור מעודכן
  const handleSaveAppointment = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${editingAppointmentId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedAppointment),
        }
      );
      if (response.ok) {
        const updatedAppointments = appointments.map((app) => {
          if (app._id === editingAppointmentId) {
            return {
              ...app,
              appointmentDate: editedAppointment.appointmentDate,
              appointmentTime: editedAppointment.appointmentTime,
            };
          }
          return app;
        });
        setAppointments(updatedAppointments);
        setEditingAppointmentId(null);
        setEditedAppointment({});
      } else {
        console.error('Failed to update appointment');
        alert('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error updating appointment');
    }
  };

  // ביטול תור
  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        setAppointments(appointments.filter((app) => app._id !== appointmentId));
      } else {
        console.error('Failed to cancel appointment');
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment');
    }
  };

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="personal-area-container">
      <h1>Personal Area</h1>

      {/* פרטי המשתמש */}
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

      {/* כפתור הצגת התורים */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <button onClick={() => setShowCarousel(!showCarousel)}>
          {showCarousel ? "Hide Appointments" : "Show Appointments"}
        </button>
      </div>

      {/* גלגלת תורים */}
      {showCarousel && appointments.length > 0 && (
        <div className="appointment-carousel">
          <button onClick={handlePrev} className="carousel-nav">Previous</button>
          <div className="appointment-card">
            {/* תור נוכחי */}
            <p><strong>Station:</strong> {appointments[currentIndex].stationName}</p>
            <p><strong>Date:</strong> {appointments[currentIndex].appointmentDate}</p>
            <p><strong>Time:</strong> {appointments[currentIndex].appointmentTime}</p>

            {editingAppointmentId === appointments[currentIndex]._id ? (
              <div className="edit-appointment-form">
                <label>
                  Date:
                  <input
                    type="date"
                    value={editedAppointment.appointmentDate}
                    onChange={(e) =>
                      setEditedAppointment({ ...editedAppointment, appointmentDate: e.target.value })
                    }
                  />
                </label>
                <label>
                  Time:
                  <input
                    type="time"
                    value={editedAppointment.appointmentTime}
                    onChange={(e) =>
                      setEditedAppointment({ ...editedAppointment, appointmentTime: e.target.value })
                    }
                  />
                </label>
                <button onClick={handleSaveAppointment}>Save</button>
                <button onClick={() => setEditingAppointmentId(null)}>Cancel</button>
              </div>
            ) : (
              <div className="display-appointment">
                <button onClick={() => handleEditAppointment(appointments[currentIndex])}>
                  Edit Appointment
                </button>
                <button onClick={() => handleCancelAppointment(appointments[currentIndex]._id)}>
                  Cancel Appointment
                </button>
              </div>
            )}
          </div>
          <button onClick={handleNext} className="carousel-nav">Next</button>
        </div>
      )}

      {/* סרגל תחתון */}
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
