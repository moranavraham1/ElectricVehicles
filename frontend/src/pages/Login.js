import React, { useState } from 'react';
import { loginUser } from '../api'; // Ensure the loginUser function is correctly imported
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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

    // If there are validation errors, do not proceed
    if (!validateForm()) return;

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token); // Store the token locally
      toast.success('Login successful!'); // Display a success message
      navigate('/home'); // Redirect to the home page after successful login
    } catch (error) {
      // Check if the error has a response object
      if (error.response) {
        toast.error(error.response.data?.message || 'An error occurred. Please try again.');
      } else if (error.request) {
        // If no response was received
        toast.error(error.request);
      } else {
        // If something else caused the error
        toast.error(error.message);
      }
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

        {/* Link to Registration Page */}
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

export default Login;
