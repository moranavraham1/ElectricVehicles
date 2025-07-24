import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FutureBookings from "./FutureBookings";
import ChangePassword from "./ChangePassword";
import "../designs/PersonalArea.css";
import logo from "../assets/logo.jpg";
import axios from 'axios';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

// SVG Icons
const EditIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const BookingIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const PasswordIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="18" y1="8" x2="23" y2="13"></line>
    <line x1="23" y1="8" x2="18" y2="13"></line>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
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


        // Check if user is admin
        const userRole = data.role || localStorage.getItem('userRole');
        setIsAdmin(userRole === 'admin');

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
    // Validate required fields
    if (!updatedDetails.firstName?.trim() || !updatedDetails.lastName?.trim() || !updatedDetails.phone?.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(updatedDetails.phone)) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Your session has expired. Please log in again', 'error');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
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

      const data = await response.json();

      if (response.ok) {
        showToast('Details updated successfully', 'success');
      } else if (response.status === 401) {
        showToast('Your session has expired. Please log in again', 'error');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        showToast(data.message || 'Failed to update details', 'error');
      }
    } catch (error) {
      showToast('An error occurred while updating details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'delete') {
      showToast('Please type "delete" to confirm account deletion', 'error');
      return;
    }
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ confirmText: deleteConfirmation }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast('Your account has been deleted successfully', 'success');
        localStorage.clear();
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        showToast(data.message || 'Failed to delete account', 'error');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('An error occurred while deleting your account', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="personal-area-page">
      <div className="top-bar">
        <img src={logo} alt="EVision Logo" className="logo" />
      </div>

      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            borderLeft: `4px solid ${toast.type === 'success' ? '#2563EB' : '#f44336'}`,
            animation: 'slideIn 0.3s ease-out',
            direction: 'rtl'
          }}
        >
          {toast.type === 'success' ? (
            <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563EB' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f44336' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#1E293B'
          }}>
            {toast.message}
          </span>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .tab-navigation .delete-tab {
            background-color: #ef4444;
            color: white;
            border: none;
            font-weight: 500;
            border-radius: 8px;
            padding: 10px 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }

          .tab-navigation .delete-tab:hover {
            background-color: #dc2626;
          }

          .delete-account-btn {
            display: none;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .modal-content {
            background-color: white;
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            direction: ltr;
          }

          .modal-title {
            color: #1E293B;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
          }

          .modal-description {
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.6;
          }

          .warning-text {
            color: #ef4444;
            font-weight: 500;
            margin-bottom: 16px;
          }

          .modal-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 16px;
          }

          .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }

          .cancel-modal-btn {
            padding: 10px 16px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            background-color: white;
            color: #1E293B;
            cursor: pointer;
            font-weight: 500;
          }

          .confirm-delete-btn {
            padding: 10px 16px;
            border-radius: 8px;
            border: none;
            background-color: #ef4444;
            color: white;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s ease;
          }

          .confirm-delete-btn:disabled {
            background-color: #fca5a5;
            cursor: not-allowed;
          }

          .confirm-delete-btn:not(:disabled):hover {
            background-color: #dc2626;
          }
        `}
      </style>

      <h1>Personal Area</h1>

      <div className="content-container">
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
          <button
            className="delete-tab"
            onClick={() => setShowDeleteModal(true)}
          >
            <DeleteIcon /> Delete Account
          </button>

          {isAdmin && (
            <button
              className={view === "admin" ? "active" : ""}
              onClick={() => setView("admin")}
            >
              <AdminIcon /> Admin Panel
            </button>
          )}
        </nav>

        <div className="tab-content">
          {view === "profile" && (
            <>
              {editMode ? (
                <div className="editable-user-info">
                  <label htmlFor="firstName">First Name:</label>
                  <input
                    id="firstName"
                    type="text"
                    value={updatedDetails.firstName || ""}
                    onChange={(e) => setUpdatedDetails({ ...updatedDetails, firstName: e.target.value })}
                    placeholder="First Name"
                  />

                  <label htmlFor="lastName">Last Name:</label>
                  <input
                    id="lastName"
                    type="text"
                    value={updatedDetails.lastName || ""}
                    onChange={(e) => setUpdatedDetails({ ...updatedDetails, lastName: e.target.value })}
                    placeholder="Last Name"
                  />

                  <label htmlFor="email">Email:</label>
                  <input
                    id="email"
                    type="email"
                    value={updatedDetails.email || ""}
                    readOnly
                    placeholder="Email (Cannot be changed)"
                  />

                  <label htmlFor="phone">Phone:</label>
                  <input
                    id="phone"
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

          {view === "admin" && isAdmin && (
            <div className="admin-panel">
              <h2>Admin Controls</h2>
              <div className="admin-options">
                <div className="admin-option" onClick={() => navigate('/admin/queue-management')}>
                  <div className="option-icon">
                    <BookingIcon />
                  </div>
                  <div className="option-details">
                    <h3>Queue Management</h3>
                    <p>Approve or reject appointment requests, and manage charging station queues.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Delete Your Account</h2>
            <p className="modal-description">
              Are you sure you want to delete your account? This action cannot be undone.
              All your personal data, bookings, and preferences will be permanently deleted.
            </p>
            <p className="warning-text">To confirm, please type "delete" below:</p>
            <input
              type="text"
              className="modal-input"
              placeholder="Type 'delete' to confirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="cancel-modal-btn" onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation('');
              }}>
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                disabled={deleteConfirmation !== 'delete' || isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

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