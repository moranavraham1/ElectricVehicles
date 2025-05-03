import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../designs/ChangePassword.css";

// SVG Icons
const LockIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

function ChangePassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const isResetMode = !!token;

  useEffect(() => {
    if (isResetMode) {
      document.body.classList.add('reset-password-mode');
    } else {
      document.body.classList.remove('reset-password-mode');
    }

    return () => {
      document.body.classList.remove('reset-password-mode');
    };
  }, [isResetMode]);

  useEffect(() => {
    if (isResetMode) {
      const verifyToken = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-reset-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            }
          );

          if (!response.ok) {
            setTokenValid(false);
            setError("Invalid or expired password reset link. Please request a new one.");
          }
        } catch (err) {
          setTokenValid(false);
          setError("Error verifying reset token. Please try again later.");
        }
      };

      verifyToken();
    }
  }, [token, isResetMode]);

  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field]
    });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = async () => {
    setError("");
    setSuccess("");

    if ((!isResetMode && !currentPassword) || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    try {
      setLoading(true);

      let url, method, headers, body;

      if (isResetMode) {
        url = `${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-password`;
        method = "POST";
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({ token, newPassword });
      } else {
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          setError("User not authenticated. Please log in again");
          setLoading(false);
          return;
        }

        url = `${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password`;
        method = "POST";
        headers = {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        };
        body = JSON.stringify({ currentPassword, newPassword });
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Server response is not JSON:", text);
        setError("Server error: Invalid response format");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSuccess(isResetMode ?
        "Password reset successfully! You can now log in with your new password." :
        "Password changed successfully! A confirmation email has been sent"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (isResetMode) {
        navigate('/login');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode && !tokenValid) {
    return (
      <div className="reset-password-card">
        <img
          src={require('../assets/logo.jpg')}
          alt="EVISION"
          className="reset-password-logo"
        />
        <div className="reset-password-header">
          <h2>Password Reset</h2>
        </div>
        <div className="reset-password-body">
          <div className="message error">
            <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
          <p className="reset-instructions">
            The password reset link has expired or is invalid. Please request a new password reset link from the login page.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="return-login-btn"
          >
            <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (isResetMode) {
    return (
      <div className="reset-password-card">
        <img
          src={require('../assets/logo.jpg')}
          alt="EVISION"
          className="reset-password-logo"
        />
        <div className="reset-password-header">
          <h2>Reset Your Password</h2>
        </div>
        <div className="reset-password-body">
          {error && (
            <div className="message error">
              <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="message success">
              <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {success}
            </div>
          )}

          <div className="input-group">
            <div className="input-wrapper">
              <KeyIcon />
              <input
                type={passwordVisible.new ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="visibility-toggle"
                onClick={() => togglePasswordVisibility('new')}
                aria-label="Toggle password visibility"
              >
                {passwordVisible.new ? (
                  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {newPassword && (
              <div className="password-requirements">
                <div className={`requirement ${newPassword.length >= 8 ? 'met' : 'not-met'}`}>
                  <span className="dot"></span>
                  At least 8 characters
                </div>
                <div className={`requirement ${/[A-Z]/.test(newPassword) ? 'met' : 'not-met'}`}>
                  <span className="dot"></span>
                  At least one uppercase letter
                </div>
                <div className={`requirement ${/[a-z]/.test(newPassword) ? 'met' : 'not-met'}`}>
                  <span className="dot"></span>
                  At least one lowercase letter
                </div>
                <div className={`requirement ${/\d/.test(newPassword) ? 'met' : 'not-met'}`}>
                  <span className="dot"></span>
                  At least one number
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <CheckIcon />
              <input
                type={passwordVisible.confirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="visibility-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
                aria-label="Toggle password visibility"
              >
                {passwordVisible.confirm ? (
                  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && newPassword && (
              <div className={`match-indicator ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                {newPassword === confirmPassword ? (
                  <>
                    <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Passwords match
                  </>
                ) : (
                  <>
                    <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="change-password-btn"
            onClick={handlePasswordChange}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Processing...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="change-password-container">
      <h2>Change Your Password</h2>

      {error && (
        <div className="message error">
          <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="message success">
          <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {success}
        </div>
      )}

      {!isResetMode && (
        <div className="input-group">
          <div className="input-wrapper">
            <LockIcon />
            <input
              type={passwordVisible.current ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              className="visibility-toggle"
              onClick={() => togglePasswordVisibility('current')}
              aria-label="Toggle password visibility"
            >
              {passwordVisible.current ? (
                <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="input-group">
        <div className="input-wrapper">
          <KeyIcon />
          <input
            type={passwordVisible.new ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            className="visibility-toggle"
            onClick={() => togglePasswordVisibility('new')}
            aria-label="Toggle password visibility"
          >
            {passwordVisible.new ? (
              <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
        {newPassword && (
          <div className="password-requirements">
            <div className={`requirement ${newPassword.length >= 8 ? 'met' : 'not-met'}`}>
              <span className="dot"></span>
              At least 8 characters
            </div>
            <div className={`requirement ${/[A-Z]/.test(newPassword) ? 'met' : 'not-met'}`}>
              <span className="dot"></span>
              At least one uppercase letter
            </div>
            <div className={`requirement ${/[a-z]/.test(newPassword) ? 'met' : 'not-met'}`}>
              <span className="dot"></span>
              At least one lowercase letter
            </div>
            <div className={`requirement ${/\d/.test(newPassword) ? 'met' : 'not-met'}`}>
              <span className="dot"></span>
              At least one number
            </div>
          </div>
        )}
      </div>

      <div className="input-group">
        <div className="input-wrapper">
          <CheckIcon />
          <input
            type={passwordVisible.confirm ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="visibility-toggle"
            onClick={() => togglePasswordVisibility('confirm')}
            aria-label="Toggle password visibility"
          >
            {passwordVisible.confirm ? (
              <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
        {confirmPassword && newPassword && (
          <div className={`match-indicator ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
            {newPassword === confirmPassword ? (
              <>
                <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Passwords match
              </>
            ) : (
              <>
                <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Passwords do not match
              </>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="change-password-btn"
        onClick={handlePasswordChange}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="spinner" xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Processing...
          </>
        ) : (
          "Change Password"
        )}
      </button>
    </div>
  );
}

export default ChangePassword;