import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Register.css';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateField = (field, value) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required.';
        } else {
          isValid = true;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required.';
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

      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required.';
        } else if (!/^\d{10}$/.test(value)) {
          error = 'Phone number must be 10 digits.';
        } else {
          isValid = true;
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required.';
        } else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
          error = 'Password must be at least 8 characters, include one uppercase letter, and one number.';
        } else {
          isValid = true;
        }
        break;

      case 'confirmPassword':
        if (value !== password) {
          error = 'Passwords do not match.';
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

    // Validate all fields
    validateField('firstName', firstName);
    validateField('lastName', lastName);
    validateField('email', email);
    validateField('phone', phone);
    validateField('password', password);
    validateField('confirmPassword', confirmPassword);

    // Check if all fields are valid
    const isValid = Object.values(validFields).every((value) => value);
    if (!isValid) return;

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      setSuccessMessage('Registration successful!');
      setTimeout(() => navigate('/home'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setErrors({ server: errorMessage });
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h1>Create an Account</h1>

        {/* First Name */}
        <div className="form-group">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              validateField('firstName', e.target.value);
            }}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        {/* Last Name */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              validateField('lastName', e.target.value);
            }}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
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
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              validateField('phone', e.target.value);
            }}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
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
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateField('confirmPassword', e.target.value);
            }}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        {errors.server && <span className="error-message">{errors.server}</span>}

        <button type="submit">Register</button>

        {successMessage && <p className="success-message">{successMessage}</p>}

        <p>
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
