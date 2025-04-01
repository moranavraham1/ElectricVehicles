import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../designs/VerifyCode.css';

function VerifyCode() {
  const [code, setCode] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60); 
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    startTimer();

    return () => clearInterval(intervalId); 
  }, []);

  const startTimer = () => {
    if (intervalId) clearInterval(intervalId); 
    const newIntervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) return prev - 1;
        clearInterval(newIntervalId); 
        return 0;
      });
    }, 1000);
    setIntervalId(newIntervalId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/auth/verify-code', { email, code });
      toast.success(response.data.message);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setTimer(60); 
    startTimer(); 

    try {
      const response = await axios.post('http://localhost:3001/api/auth/resend-verification-code', { email });
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
          Didn’t receive the code?{' '}
          <button
            className="resend-link"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Resending...' : 'Resend'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyCode;
