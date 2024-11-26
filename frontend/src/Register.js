import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateField = (field, value) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required.';
        } else {
          isValid = true;
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Invalid email address.';
        } else {
          isValid = true;
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required.';
        } else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
          error =
            'Password must be at least 8 characters, include one uppercase letter, and one number.';
        } else {
          isValid = true;
        }
        break;

      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    setValidFields((prevValid) => ({ ...prevValid, [field]: isValid }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    validateField('fullName', fullName);
    validateField('email', email);
    validateField('password', password);

    // Check if all fields are valid
    const isValid = Object.values(validFields).every((value) => value);
    if (!isValid) return;

    try {
      // Updated to use localhost:3001
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        fullName,
        email,
        password
      });

      setSuccessMessage('Registration successful!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      // Improved error handling
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Registration failed';
      
      setErrors({ 
        server: errorMessage 
      });
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h1>Create an Account</h1>

        {/* Full Name */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              validateField('fullName', e.target.value);
            }}
            className={errors.fullName ? 'error' : ''}
          />
          {validFields.fullName ? (
            <span className="valid-feedback">✔️</span>
          ) : (
            errors.fullName && (
              <span className="invalid-feedback">❌ {errors.fullName}</span>
            )
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateField('email', e.target.value);
            }}
            className={errors.email ? 'error' : ''}
          />
          {validFields.email ? (
            <span className="valid-feedback">✔️</span>
          ) : (
            errors.email && (
              <span className="invalid-feedback">❌ {errors.email}</span>
            )
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validateField('password', e.target.value);
            }}
            className={errors.password ? 'error' : ''}
          />
          {validFields.password ? (
            <span className="valid-feedback">✔️</span>
          ) : (
            errors.password && (
              <span className="invalid-feedback">❌ {errors.password}</span>
            )
          )}
        </div>

        {errors.server && (
          <div className="form-group">
            <span className="invalid-feedback">❌ {errors.server}</span>
          </div>
        )}

        <button type="submit">Register</button>

        {successMessage && (
          <p className="success-message">✅ {successMessage}</p>
        )}

        <p>
          Already have an account?{' '}
          <Link to="/" className="login-link">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;