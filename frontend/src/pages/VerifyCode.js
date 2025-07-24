import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../designs/VerifyCode.css';
import logo from '../assets/logo.jpg';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

function VerifyCode() {
  const [code, setCode] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const intervalRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) return prev - 1;
        clearInterval(intervalRef.current);
        return 0;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-code`, { email: email.toLowerCase(), code });
      toast.success('Email verification successful! Redirecting to login page...');
      window.location.href = '/login';
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.message || 'Verification failed.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setTimer(60);
    startTimer();

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/resend-verification-code`, { email: email.toLowerCase() });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="verify-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <h1 className="verify-title">Email Verification</h1>
      <div className="verify-card">
        <h1>Verify Your Email</h1>
        <p>We sent a verification code to <strong>{email}</strong></p>
        <form onSubmit={handleSubmit} className="verify-form">
          <input
            type="text"
            placeholder="Enter Verification Code"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="verify-input"
            required
          />
          <button type="submit" className="verify-button">Verify</button>
        </form>
        <p className="timer">Time remaining: {formatTime()}</p>
        <p className="verify-footer">
          Didn't receive the code?{' '}
          <button
            className="resend-link"
            onClick={handleResend}
            disabled={isResending || timer > 0}
          >
            {isResending ? 'Resending...' : timer > 0 ? `Wait ${formatTime()}` : 'Resend'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyCode;
