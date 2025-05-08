import React from 'react';

/**
 * Reusable button component with customizable styles
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, success, danger)
 * @param {function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button text or content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
const Button = ({ 
  variant = 'primary', 
  onClick, 
  children, 
  className = '', 
  style = {},
  disabled = false,
  ...props 
}) => {
  // Base button styles
  const baseStyle = {
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    padding: '10px 15px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s, transform 0.1s',
    opacity: disabled ? 0.7 : 1,
  };
  
  // Variant-specific styles
  const variantStyles = {
    primary: {
      backgroundColor: '#3498db',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#f0f0f0',
      color: '#333',
    },
    success: {
      backgroundColor: '#4CAF50',
      color: 'white',
    },
    danger: {
      backgroundColor: '#e74c3c',
      color: 'white',
    },
    warning: {
      backgroundColor: '#f39c12',
      color: 'white',
    },
    link: {
      backgroundColor: 'transparent',
      color: '#3498db',
      boxShadow: 'none',
      padding: '5px',
    }
  };
  
  // Combine all styles
  const buttonStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style
  };
  
  return (
    <button
      className={`custom-button ${variant} ${className}`}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 