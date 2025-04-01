import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../designs/Register.css';

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
  const navigate = useNavigate();

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
        if (value !== formData.password) {
          error = 'Passwords do not match.';
        } else {
          isValid = true;
        }
        break;

      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const nextStep = () => {
    let fieldsToValidate = [];

    // Determine which fields to validate based on current step
    if (currentStep === 0) {
      fieldsToValidate = ['firstName', 'lastName'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['email', 'phone'];
    }

    const isStepValid = fieldsToValidate.every(field =>
      validateField(field, formData[field])
    );

    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please correct the errors before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate final step fields
    const finalFieldsValid = ['password', 'confirmPassword'].every(field =>
      validateField(field, formData[field])
    );

    if (!finalFieldsValid) {
      toast.error('Please correct the errors before submitting.');
      return;
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

      // Check if response status is ok
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed.');
      }

      const data = await response.json();
      toast.success(data.message || 'Registration successful!');
      navigate(`/verify-email?email=${formData.email}`);
    } catch (error) {
      toast.error(error.message || 'An error occurred during registration.');
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
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
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
              {errors.email && <span className="error-message">{errors.email}</span>}
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
              {errors.phone && <span className="error-message">{errors.phone}</span>}
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
              <div className="password-strength" style={{ opacity: formData.password ? 1 : 0 }}>
                <div className="password-strength-bar" style={{
                  width: `${passwordStrength}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}></div>
              </div>
              <div className="password-strength-text" style={{ color: getPasswordStrengthColor() }}>
                {passwordStrength === 0 && formData.password && "Very Weak"}
                {passwordStrength === 25 && "Weak"}
                {passwordStrength === 50 && "Fair"}
                {passwordStrength === 75 && "Good"}
                {passwordStrength === 100 && "Strong"}
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h1>Create an Account</h1>

        <div className="progress-indicator">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
          ))}
        </div>

        <h2 className="step-title">{steps[currentStep]}</h2>

        {renderForm()}

        <div className="button-group">
          {currentStep > 0 && (
            <button
              type="button"
              className="back-button"
              onClick={prevStep}
            >
              Back
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className="next-button"
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button type="submit" className="submit-button">
              Register
            </button>
          )}
        </div>

        <p>
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;