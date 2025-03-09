import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChargeHistory from "./ChargeHistory";
import FutureBookings from "./FutureBookings";
import ChangePassword from "./ChangePassword";
import "../designs/PersonalArea.css";
import logo from "../assets/logo.jpg";

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
<<<<<<< HEAD
  }, []);
=======
>>>>>>> 0ac2f7e6 (.)
=======
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
>>>>>>> 419312ab (View appointments in your personal area and send an email about appointments, cancellations, and appointment updates.)

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
            "Content-Type": "application/json",
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
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="personal-area-page">
      <div className="top-bar">
        <img src={logo} alt="EVision Logo" className="logo" />
      </div>

      <div className="content-container">
        <h1>Personal Area</h1>

        <nav className="tab-navigation">
          <button className={view === "profile" ? "active" : ""} onClick={() => setView("profile")}>Profile</button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>Charge History</button>
          <button className={view === "bookings" ? "active" : ""} onClick={() => setView("bookings")}>Future Bookings</button>
          <button className={view === "password" ? "active" : ""} onClick={() => setView("password")}>Change Password</button>
        </nav>


        <div className="tab-content">
          {view === "profile" && (
            <>
              {editMode ? (
                <div className="editable-user-info">
                  <input type="text" value={updatedDetails.firstName || ""} onChange={(e) => setUpdatedDetails({ ...updatedDetails, firstName: e.target.value })} placeholder="First Name" />
                  <input type="text" value={updatedDetails.lastName || ""} onChange={(e) => setUpdatedDetails({ ...updatedDetails, lastName: e.target.value })} placeholder="Last Name" />
                  <input type="email" value={updatedDetails.email || ""} readOnly placeholder="Email (Cannot be changed)" />
                  <input type="text" value={updatedDetails.phone || ""} onChange={(e) => setUpdatedDetails({ ...updatedDetails, phone: e.target.value })} placeholder="Phone" />
                  <button className="save-btn" onClick={handleUpdate}>Save</button>
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              ) : (
                <div className="profile-info">
                  <p><span>First Name:</span> {userDetails?.firstName || "Not Available"}</p>
                  <p><span>Last Name:</span> {userDetails?.lastName || "Not Available"}</p>
                  <p><span>Email:</span> {userDetails?.email || "Not Available"}</p>
                  <p><span>Phone:</span> {userDetails?.phone || "Not Available"}</p>
                  <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Info</button>
                </div>
              )}
            </>
          )}
          {view === "history" && <ChargeHistory />}
          {view === "bookings" && <FutureBookings />}
          {view === "password" && <ChangePassword />}
        </div>
      </div>


=======
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
        <Link className="bottom-bar-button logout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </Link>
        <Link to="/personal-area" className="bottom-bar-button">
          <i className="fas fa-user"></i> Personal Area
        </Link>
        <Link to="/favorites" className="bottom-bar-button">
          <i className="fas fa-heart"></i> Favorites
        </Link>
        <Link to="/home" className="bottom-bar-button">
          <i className="fas fa-home"></i> Home
        </Link>
        <Link to="/map" className="bottom-bar-button">
          <i className="fas fa-map-marked-alt"></i> Search on Map
        </Link>
      </div>
    </div>
  );
}

export default PersonalArea;