import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../designs/Register.css';
import logo from '../assets/logo.jpg';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

function Register() {
  // Form steps
  const steps = ['Personal', 'Contact', 'Security'];
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldsTouched, setFieldsTouched] = useState({});
  const [isEmailValidating, setIsEmailValidating] = useState(false);
  const navigate = useNavigate();

  const emailCheckTimeoutRef = useRef(null);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (formData.password.length >= 8) strength += 25;
    // Uppercase check
    if (/[A-Z]/.test(formData.password)) strength += 25;
    // Number check
    if (/\d/.test(formData.password)) strength += 25;
    // Special character check
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;

    setPasswordStrength(strength);
  }, [formData.password]);

  // Effect to clear password errors/touched state when entering step 2
  useEffect(() => {
    if (currentStep === 2) {
      setErrors(prevErrors => ({
        ...prevErrors,
        password: '',
        confirmPassword: ''
      }));
      setFieldsTouched(prevTouched => ({
        ...prevTouched,
        password: false,
        confirmPassword: false
      }));
    }
  }, [currentStep]);

  const validateField = (field, value) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First name empty';
        } else if (value.trim().length < 2) {
          error = 'First name too short';
        } else if (/\d/.test(value)) {
          error = 'No numbers allowed';
        } else {
          isValid = true;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          error = 'Last name empty';
        } else if (value.trim().length < 2) {
          error = 'Last name too short';
        } else if (/\d/.test(value)) {
          error = 'No numbers allowed';
        } else {
          isValid = true;
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email empty';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Invalid email format';
        } else {
          isValid = true;
        }
        break;

      case 'phone':
        if (!value.trim()) {
          error = 'Phone empty';
        } else if (!/^\d+$/.test(value)) {
          error = 'Numbers only';
        } else if (value.length !== 10) {
          error = 'Must be 10 digits';
        } else {
          isValid = true;
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password empty';
        } else if (value.length < 8) {
          error = 'Min 8 characters';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Need uppercase letter';
        } else if (!/\d/.test(value)) {
          error = 'Need a number';
        } else {
          isValid = true;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Confirm password empty';
        } else if (value !== formData.password) {
          error = 'Passwords don\'t match';
        } else {
          isValid = true;
        }
        break;

      default:
        break;
    }

    // Only set the error if the field has been touched
    if (fieldsTouched[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldsTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'email') {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
      // Basic email format validation immediately
      const isFormatValid = validateField(name, value);

      if (isFormatValid) {
        setIsEmailValidating(true);
        emailCheckTimeoutRef.current = setTimeout(async () => {
          setIsEmailValidating(false); // Set to false when check is done
          // Only check existence if format is valid and email is not empty
          if (value.trim() && /\S+@\S+\.\S+/.test(value)) {
            try {
              const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/check-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: value }),
              });
              const data = await response.json();
              if (data.exists) {
                setErrors(prevErrors => ({ ...prevErrors, email: 'Email already registered' }));
              } else {
                setErrors(prevErrors => ({ ...prevErrors, email: '' }));
              }
            } catch (error) {
              console.error('Error checking email existence:', error);
              // Optionally handle network errors, but don't block user
              setErrors(prevErrors => ({ ...prevErrors, email: '' })); // Clear error on network issue
            }
          }
        }, 500); // Debounce for 500ms
      } else {
        setIsEmailValidating(false); // Clear loading if format is invalid
        setErrors(prevErrors => ({ ...prevErrors, email: validateField(name, value) ? '' : errors.email })); // Update format error immediately
      }
    } else {
      validateField(name, value);
    }
  };

  const nextStep = () => {
    let fieldsToValidate = [];

    // Determine which fields to validate based on current step
    if (currentStep === 0) {
      fieldsToValidate = ['firstName', 'lastName'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['email', 'phone'];
    }

    // Reset all touched fields, then mark only current step's fields as touched
    setFieldsTouched({}); // Clear all touched fields
    const newTouchedFields = {};
    fieldsToValidate.forEach(field => {
      newTouchedFields[field] = true;
    });
    setFieldsTouched(newTouchedFields); // Only set touched for current step

    const isStepValid = fieldsToValidate.every(field =>
      validateField(field, formData[field])
    );

    if (isStepValid) {
      setCurrentStep(currentStep + 1);
      setErrors({}); // Clear all errors for the new step
    }
    // No toast needed - field-specific errors are displayed
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark password fields as touched
    setFieldsTouched(prev => ({
      ...prev,
      password: true,
      confirmPassword: true
    }));

    // Validate final step fields
    const finalFieldsValid = ['password', 'confirmPassword'].every(field =>
      validateField(field, formData[field])
    );

    if (!finalFieldsValid) {
      return; // No toast needed, field-specific errors are shown
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      // Process specific error types from API response
      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.message ? errorData.message.toLowerCase() : '';

        // Email-related errors
        if (errorMsg.includes('email') && errorMsg.includes('exists')) {
          setCurrentStep(1); // Move back to email step
          setErrors(prev => ({ ...prev, email: 'Email already registered' }));
          return;
        }

        // Phone-related errors
        if (errorMsg.includes('phone')) {
          setCurrentStep(1); // Move back to contact step
          setErrors(prev => ({ ...prev, phone: 'Invalid phone number' }));
          return;
        }

        // Password-related errors
        if (errorMsg.includes('password')) {
          setErrors(prev => ({ ...prev, password: 'Password requirements not met' }));
          return;
        }

        // Generic validation error
        if (errorMsg.includes('validation')) {
          toast.error('Please check your information');
          return;
        }

        // Fallback for unexpected errors
        toast.error(errorData.message || 'Registration failed');
        return;
      }

      const data = await response.json();
      toast.success('Registration successful!');
      navigate(`/verify-email?email=${formData.email}`);
    } catch (error) {
      // Network or server error
      toast.error('Connection error');
    }
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#F87171'; // Weak - Red
    if (passwordStrength < 75) return '#FBBF24'; // Medium - Amber
    return '#34D399'; // Strong - Green
  };

  // Render form based on current step
  const renderForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                autoFocus
              />
              {fieldsTouched.firstName && errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {fieldsTouched.lastName && errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </>
        );

      case 1:
        return (
          <>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                autoFocus
              />
              {fieldsTouched.email && errors.email && !isEmailValidating && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
              />
              {fieldsTouched.phone && errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoFocus
              />
              <div className="password-hint">
                Required: 8+ chars, 1 uppercase, 1 number
              </div>
              <div className="password-strength" style={{ opacity: formData.password ? 1 : 0 }}>
                <div className="password-strength-bar" style={{
                  width: `${passwordStrength}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}></div>
              </div>
              <div className="password-strength-text" style={{ color: getPasswordStrengthColor() }}>
                {formData.password ? (
                  <>
                    {passwordStrength === 0 && "Very Weak"}
                    {passwordStrength === 25 && "Weak"}
                    {passwordStrength === 50 && "Fair"}
                    {passwordStrength === 75 && "Good"}
                    {passwordStrength === 100 && "Strong"}
                  </>
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
              {fieldsTouched.password && errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {fieldsTouched.confirmPassword && errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <img src={logo} alt="Logo" className="register-logo" />

      <h1 className="main-heading">Create Your Account</h1>
      <div className="register-wrapper">
        <form onSubmit={handleSubmit} className={`step-${currentStep}`}>
          <div className="progress-indicator">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`progress-step ${index === currentStep
                  ? 'active'
                  : index < currentStep
                    ? 'completed'
                    : ''
                  }`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          <div className="step-title">{steps[currentStep]}</div>

          <div className="form-content">
            {renderForm()}
          </div>

          <div className="button-group">
            {currentStep > 0 && (
              <button
                type="button"
                className="back-button"
                onClick={prevStep}
                style={{
                  height: '48px',
                  minHeight: '48px',
                  display: 'inline-block',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'none',
                  transform: 'none',
                  boxShadow: 'none',
                  position: 'relative',
                  width: '48%',
                  float: 'left'
                }}
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className="next-button"
                onClick={nextStep}
                style={{
                  height: '48px',
                  minHeight: '48px',
                  display: 'inline-block',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '48%',
                  float: 'right'
                }}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="submit-button"
                style={{
                  height: '48px',
                  minHeight: '48px',
                  display: 'inline-block',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '48%',
                  float: 'right'
                }}
              >
                Register
              </button>
            )}
          </div>

          <p>
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;