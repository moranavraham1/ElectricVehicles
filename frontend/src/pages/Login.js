import React, { useState } from 'react';
import { loginUser } from '../api';  // הנחה שאתה מייבא את הפונקציה הזו כראוי
import { Link, useNavigate } from 'react-router-dom';
import '../login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');  // State for login error message
  const navigate = useNavigate();

  // פונקציה לבדוק אם כל השדות תקינים
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

  // פונקציה להשלמת התחברות
  const handleSubmit = async (e) => {
    e.preventDefault();

    // אם יש שגיאות בכניסה, לא שולחים את הטופס
    if (!validateForm()) return;

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      alert('Login successful');
      navigate('/home');  // פנייה לדף הבית לאחר התחברות
    } catch (error) {
      // טיפול בשגיאות מה-API
      if (error.response) {
        if (error.response.status === 401) {
          setLoginError('Incorrect email or password');
        } else {
          setLoginError('An error occurred. Please try again.');
        }
      } else {
        // אם ה-API לא זמין או שיש שגיאה אחרת
        setLoginError('Network error. Please check your connection.');
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

export default Login;
