import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChargeHistory from "./ChargeHistory";
import FutureBookings from "./FutureBookings";
import ChangePassword from "./ChangePassword";
import "../designs/PersonalArea.css";
import logo from "../assets/logo.jpg";

function PersonalArea() {
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const [view, setView] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
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
        console.error(err);
      }
    };

    fetchDetails();
  }, [navigate]);

  const handleUpdate = async () => {
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
      alert("Details updated successfully!");
    } catch (err) {
      alert(`Error updating details: ${err.message}`);
    }
  };

  return (
    <div className="personal-area-page">
      {/* סרגל עליון עם לוגו */}
      <div className="top-bar">
        <img src={logo} alt="EVision Logo" className="logo" />
      </div>

      {/* תוכן ראשי */}
      <div className="content-container">
        <h1>Personal Area</h1>

        {/* כפתורי ניווט */}
        <nav className="tab-navigation">
          <button className={view === "profile" ? "active" : ""} onClick={() => setView("profile")}>Profile</button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>Charge History</button>
          <button className={view === "bookings" ? "active" : ""} onClick={() => setView("bookings")}>Future Bookings</button>
          <button className={view === "password" ? "active" : ""} onClick={() => setView("password")}>Change Password</button>
        </nav>

        {/* תצוגת הטאב הנבחר */}
        <div className="tab-content">
          {view === "profile" && (
            <>
              {editMode ? (
                <div className="editable-user-info">
                  <input type="text" value={updatedDetails.firstName} onChange={(e) => setUpdatedDetails({ ...updatedDetails, firstName: e.target.value })} placeholder="First Name" />
                  <input type="text" value={updatedDetails.lastName} onChange={(e) => setUpdatedDetails({ ...updatedDetails, lastName: e.target.value })} placeholder="Last Name" />
                  <button className="save-btn" onClick={handleUpdate}>Save</button>
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              ) : (
                <div className="profile-info">
                  <p><span>First Name:</span> {userDetails?.firstName}</p>
                  <p><span>Last Name:</span> {userDetails?.lastName}</p>
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

      {/* סרגל תחתון */}
      <div className="bottom-bar">
        <Link to="/home" className="bottom-bar-button"><i className="fas fa-home"></i> Home</Link>
        <Link to="/personal-area" className="bottom-bar-button"><i className="fas fa-user"></i> Personal Area</Link>
        <Link to="/favorites" className="bottom-bar-button"><i className="fas fa-heart"></i> Favorites</Link>
        <Link to="/map" className="bottom-bar-button"><i className="fas fa-map-marked-alt"></i> Search on Map</Link>
        <button className="bottom-bar-button logout-button" onClick={() => { localStorage.clear(); navigate("/login"); }}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
  );
}

export default PersonalArea;
