import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../designs/login.css';
import logo from '../assets/logo.jpg';
import axios from 'axios';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  console.log(BACKEND_URL);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email field cannot be empty';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password field cannot be empty';
    } else if (password.length < 6) {
      newErrors.password = 'Password too short (min. 6 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

        if (response.status === 401) {
          setErrors({
            password: 'Wrong password',
            email: null
          });
        } else if (response.status === 404) {
          setErrors({
            email: 'User not found',
            password: null
          });
        } else if (errorData.message) {
          const errorMsg = errorData.message.toLowerCase();

          if (errorMsg.includes('password') || errorMsg.includes('credentials')) {
            setErrors({
              password: 'Wrong password',
              email: null
            });
          } else if (errorMsg.includes('email') || errorMsg.includes('user') || errorMsg.includes('not found')) {
            setErrors({
              email: 'User not found',
              password: null
            });
          } else {
            toast.error(errorData.message || 'Login failed');
          }
        } else {
          toast.error('Login failed');
        }
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('loggedInUser', email);
      toast.success('Login successful!');
      navigate('/home');
    } catch (error) {
      toast.error('Connection error');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Email field is empty');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Reset link failed');
      }

      toast.success(`Reset link sent to ${email}`);
      setShowForgotPassword(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />

      <h1 className="main-heading">Welcome Back</h1>

      <div className="login-wrapper">
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <small>{errors.email}</small>}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <small>{errors.password}</small>}
          </div>

          <button type="submit">Login</button>

          <button
            type="button"
            className="forgot-password-btn"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>

          <p>
            Not registered?{' '}
            <Link to="/register" className="register-link">
              Create an account
            </Link>
          </p>
        </form>
      </div>

      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowForgotPassword(false)}
            >
              &times;
            </button>
            <h3>Reset Password</h3>
            <p>Send reset link to: <strong>{email}</strong></p>
            {!email || !/\S+@\S+\.\S+/.test(email) ? (
              <div className="warning-message">
                <p>Enter valid email first</p>
              </div>
            ) : (
              <div className="modal-buttons">
                <button onClick={handleForgotPassword}>Send Link</button>
                <button onClick={() => setShowForgotPassword(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
