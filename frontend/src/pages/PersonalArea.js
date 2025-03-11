import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChargeHistory from "./ChargeHistory";
import FutureBookings from "./FutureBookings";
import ChangePassword from "./ChangePassword";
import "../designs/PersonalArea.css";
import logo from "../assets/logo.jpg";

function PersonalArea() {
  const [userDetails, setUserDetails] = useState(null);
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
>>>>>>> 8d42dfa9 (Summoning queues)
=======
>>>>>>> 0ac2f7e6 (.)
  const [editMode, setEditMode] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const [view, setView] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.clear();
      alert("You have been logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

    fetchUserDetails();
  }, [navigate]);
<<<<<<< HEAD

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
=======
>>>>>>> 0ac2f7e6 (.)

  const handleUpdate = async () => {
    if (!updatedDetails.firstName.trim() || !updatedDetails.lastName.trim() || !updatedDetails.phone.trim()) {
      alert("All fields must be filled before saving.");
      return;
    }
    if (!/^\d{10}$/.test(updatedDetails.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    const token = localStorage.getItem("token");

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
      alert("Details updated successfully! A confirmation email has been sent.");
    } catch (err) {
      alert(`Error updating details: ${err.message}`);
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
>>>>>>> 8d42dfa9 (Summoning queues)
=======
    <div className="personal-area-page">
      {/* 🔹 סרגל עליון עם לוגו */}
      <div className="top-bar">
        <img src={logo} alt="EVision Logo" className="logo" />
      </div>

      {/* 🔹 תוכן ראשי */}
      <div className="content-container">
        <h1>Personal Area</h1>

        {/* 🔹 כפתורי ניווט */}
        <nav className="tab-navigation">
          <button className={view === "profile" ? "active" : ""} onClick={() => setView("profile")}>Profile</button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>Charge History</button>
          <button className={view === "bookings" ? "active" : ""} onClick={() => setView("bookings")}>Future Bookings</button>
          <button className={view === "password" ? "active" : ""} onClick={() => setView("password")}>Change Password</button>
        </nav>

        {/* 🔹 תצוגת הפרופיל עם נתוני המשתמש */}
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

      {/* 🔹 סרגל תחתון */}
>>>>>>> 0ac2f7e6 (.)
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