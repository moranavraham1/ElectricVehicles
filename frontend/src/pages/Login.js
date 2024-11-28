import React, { useState } from 'react';
import { loginUser } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import '../login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');  // State for login error message
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      alert('Login successful');
      // On successful login, navigate to home page
      navigate('/home');
    } catch (error) {
      // If error is due to wrong credentials, show 'Wrong email or password'
      if (error.response && error.response.status === 401) {
        setLoginError('Incorrect email or password');  // Changed message back to English
      } else {
        setLoginError('Incorrect email or password');  // Same message for all errors
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} noValidate>
        <h1>Welcome Back!</h1>

        {/* Display error message if it exists */}
        {loginError && <div style={{ color: 'red', marginBottom: '10px' }}>{loginError}</div>}

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <small style={{ color: 'red' }}>{errors.password}</small>}
        </div>
        <button type="submit">Login</button>
        <p>
          Not registered?{' '}
          <Link to="/register" className="register-link">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login