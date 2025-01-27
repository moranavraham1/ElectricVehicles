import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../designs/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  console.log(BACKEND_URL);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred. Please try again.');
      }
  
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('loggedInUser', email); // שמירת המייל של המשתמש המחובר
      toast.success('Login successful!');
      navigate('/home');
    } catch (error) {
      toast.error(error.message);
    }
  };
  

  // Handle forgot password submission
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      toast.error('Please enter a valid email address for password reset.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send password reset link.');
      }

      toast.success(`Password reset link sent to ${forgotPasswordEmail}`);
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} noValidate>
        <h1>Welcome Back!</h1>

        {/* Email Input */}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
        </div>

        {/* Password Input */}
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <small style={{ color: 'red' }}>{errors.password}</small>}
        </div>

        {/* Login Button */}
        <button type="submit">Login</button>

        {/* Forgot Password Button */}
        <button
          type="button"
          className="forgot-password-btn"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </button>

        {/* Link to Registration Page */}
        <p>
          Not registered?{' '}
          <Link to="/register" className="register-link">
            Create an account
          </Link>
        </p>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="modal-content">
            {/* Close Button */}
            <button
              className="close-modal"
              onClick={() => setShowForgotPassword(false)}
            >
              &times;
            </button>
            <h3>Reset Your Password</h3>
            <p>Enter your email address below, and we'll send you a link to reset your password.</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
            />
            {forgotPasswordEmail && !/\S+@\S+\.\S+/.test(forgotPasswordEmail) && (
              <small style={{ color: 'red' }}>Please enter a valid email address.</small>
            )}
            <div className="modal-buttons">
              <button onClick={handleForgotPassword}>Send Reset Link</button>
              <button onClick={() => setShowForgotPassword(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
