import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FutureBookings from "./FutureBookings";
import ChangePassword from "./ChangePassword";
import "../designs/PersonalArea.css";
import logo from "../assets/logo.jpg";

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const BookingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const PasswordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

function PersonalArea() {
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const [view, setView] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
<<<<<<< HEAD
=======

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      showToast('You have been logged out successfully!');
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Logout error:", error);
      showToast('Logout failed. Please try again.', 'error');
    }
  };
>>>>>>> 8d5d0857 (designs)

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

  const handleUpdate = async () => {
    if (!updatedDetails.firstName.trim() || !updatedDetails.lastName.trim() || !updatedDetails.phone.trim()) {
      showToast("All fields must be filled before saving.", "error");
      return;
    }
    if (!/^\d{10}$/.test(updatedDetails.phone)) {
      showToast("Phone number must be exactly 10 digits.", "error");
      return;
    }
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
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
      showToast("Details updated successfully! A confirmation email has been sent.");
    } catch (err) {
      showToast(`Error updating details: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="personal-area-page">
<<<<<<< HEAD
      {/* 🔹 סרגל עליון עם לוגו */}
      <div className="top-bar">
        <img src={logo} alt="EVision Logo" className="logo" />
      </div>

      {/* 🔹 תוכן ראשי */}
=======
      {/* Toast Notification */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.type === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )}
        <span className="toast-message">{toast.message}</span>
      </div>


>>>>>>> 8d5d0857 (designs)
      <div className="content-container">
        <h1>Personal Area</h1>

        {/* 🔹 כפתורי ניווט */}
        <nav className="tab-navigation">
          <button
            className={view === "profile" ? "active" : ""}
            onClick={() => setView("profile")}
          >
            <ProfileIcon /> Profile
          </button>
          <button
            className={view === "bookings" ? "active" : ""}
            onClick={() => setView("bookings")}
          >
            <BookingIcon /> Bookings
          </button>
          <button
            className={view === "password" ? "active" : ""}
            onClick={() => setView("password")}
          >
            <PasswordIcon /> Password
          </button>
        </nav>

<<<<<<< HEAD
        {/* 🔹 תצוגת הפרופיל עם נתוני המשתמש */}
=======
>>>>>>> 8d5d0857 (designs)
        <div className="tab-content">
          {view === "profile" && (
            <>
              {editMode ? (
                <div className="editable-user-info">
                  <input
                    type="text"
                    value={updatedDetails.firstName || ""}
                    onChange={(e) => setUpdatedDetails({ ...updatedDetails, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={updatedDetails.lastName || ""}
                    onChange={(e) => setUpdatedDetails({ ...updatedDetails, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                  <input
                    type="email"
                    value={updatedDetails.email || ""}
                    readOnly
                    placeholder="Email (Cannot be changed)"
                  />
                  <input
                    type="text"
                    value={updatedDetails.phone || ""}
                    onChange={(e) => setUpdatedDetails({ ...updatedDetails, phone: e.target.value })}
                    placeholder="Phone"
                  />
                  <div className="button-container">
                    <button className="save-btn" onClick={handleUpdate}>
                      <SaveIcon /> Save
                    </button>
                    <button className="cancel-btn" onClick={() => setEditMode(false)}>
                      <CancelIcon /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <p><span>First Name:</span> {userDetails?.firstName || "Not Available"}</p>
                  <p><span>Last Name:</span> {userDetails?.lastName || "Not Available"}</p>
                  <p><span>Email:</span> {userDetails?.email || "Not Available"}</p>
                  <p><span>Phone:</span> {userDetails?.phone || "Not Available"}</p>
                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    <EditIcon /> Edit Information
                  </button>
                </div>
              )}
            </>
          )}

          {view === "bookings" && <FutureBookings />}
          {view === "password" && <ChangePassword />}
        </div>
      </div>

<<<<<<< HEAD
      {/* 🔹 סרגל תחתון */}
=======
>>>>>>> 8d5d0857 (designs)
      <div className="bottom-bar">
        <Link to="/home" className="bottom-bar-button">
          <HomeIcon />
          <span>Home</span>
        </Link>
        <Link to="/map" className="bottom-bar-button">
          <MapIcon />
          <span>Map</span>
        </Link>
        <Link to="/favorites" className="bottom-bar-button">
          <HeartIcon />
          <span>Favorites</span>
        </Link>
        <Link to="/personal-area" className="bottom-bar-button active">
          <UserIcon />
          <span>Profile</span>
        </Link>
        <button className="bottom-bar-button" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default PersonalArea;