import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../designs/Payment.css';

// Icons
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    
    const { 
        bookingId,
        station, 
        date, 
        time, 
        chargingTime, 
        initialBattery, 
        finalBattery,
        batteryGained
    } = location.state || {};
    
    // Calculate payment amount based on charging time
    const calculatePaymentAmount = () => {
        // Base rate: ₪2 per minute
        const baseRate = 2;
        const minutes = Math.ceil(chargingTime / 60); // Convert seconds to minutes
        return minutes * baseRate;
    };
    
    const amount = calculatePaymentAmount();
    
    const handleBack = () => {
        navigate(-1);
    };
    
    const formatCardNumber = (value) => {
        // Remove all non-digit characters
        const val = value.replace(/\D/g, '');
        // Add space after every 4 digits
        const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
        return formatted.slice(0, 19); // Limit to 16 digits (19 with spaces)
    };
    
    const formatExpiryDate = (value) => {
        // Remove all non-digit characters
        const val = value.replace(/\D/g, '');
        // Format as MM/YY
        if (val.length > 2) {
            return `${val.slice(0, 2)}/${val.slice(2, 4)}`;
        }
        return val;
    };
    
    const handleCardNumberChange = (e) => {
        setCardNumber(formatCardNumber(e.target.value));
    };
    
    const handleExpiryDateChange = (e) => {
        setExpiryDate(formatExpiryDate(e.target.value));
    };
    
    const handleCvvChange = (e) => {
        // Only allow digits and limit to 3-4 characters
        const val = e.target.value.replace(/\D/g, '');
        setCvv(val.slice(0, 4));
    };
    
    const handlePayment = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (paymentMethod === 'credit_card') {
            if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
                setError('Please enter a valid card number');
                return;
            }
            if (!expiryDate || expiryDate.length < 5) {
                setError('Please enter a valid expiry date');
                return;
            }
            if (!cvv || cvv.length < 3) {
                setError('Please enter a valid CVV');
                return;
            }
            if (!cardName) {
                setError('Please enter the cardholder name');
                return;
            }
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Process payment
            const paymentData = {
                bookingId,
                station: typeof station === 'object' ? station['Station Name'] : station,
                date,
                time,
                amount,
                paymentMethod,
                chargingTime: Math.ceil(chargingTime / 60), // Convert seconds to minutes
                initialBattery,
                finalBattery
            };
            
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/payments/process`,
                paymentData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            
            setSuccess(true);
            
            // Redirect to profile page after 2 seconds
            setTimeout(() => {
                navigate('/personal-area', { state: { paymentSuccess: true } });
            }, 2000);
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Redirect if no charging data is available
    useEffect(() => {
        if (!location.state || !station) {
            navigate('/home');
        }
    }, [location.state, station, navigate]);
    
    return (
        <div className="payment-container">
            <div className="payment-header">
                <button onClick={handleBack} className="back-button">
                    <BackIcon />
                </button>
                <h1>Payment</h1>
                <p className="payment-subtitle">Complete your charging session payment</p>
            </div>
            
            <div className="payment-content">
                {/* Charging Summary */}
                <div className="charging-summary-section">
                    <h2>Charging Summary</h2>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Station:</span>
                            <span>{typeof station === 'object' ? station['Station Name'] : station}</span>
                        </div>
                        <div className="summary-row">
                            <span>Date:</span>
                            <span>{date}</span>
                        </div>
                        <div className="summary-row">
                            <span>Time:</span>
                            <span>{time}</span>
                        </div>
                        <div className="summary-row">
                            <span>Charging Duration:</span>
                            <span>{Math.ceil(chargingTime / 60)} minutes</span>
                        </div>
                        <div className="summary-row">
                            <span>Battery Charged:</span>
                            <span>{batteryGained || Math.round(finalBattery - initialBattery)}%</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Amount:</span>
                            <span>₪{amount}</span>
                        </div>
                    </div>
                </div>
                
                {/* Payment Method Selection */}
                <div className="payment-method-section">
                    <h2>Payment Method</h2>
                    <div className="payment-methods">
                        <label className={`payment-method-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="credit_card"
                                checked={paymentMethod === 'credit_card'}
                                onChange={() => setPaymentMethod('credit_card')}
                            />
                            <span className="method-name">Credit Card</span>
                        </label>
                        <label className={`payment-method-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="paypal"
                                checked={paymentMethod === 'paypal'}
                                onChange={() => setPaymentMethod('paypal')}
                            />
                            <span className="method-name">PayPal</span>
                        </label>
                    </div>
                </div>
                
                {/* Payment Form */}
                {paymentMethod === 'credit_card' && (
                    <form className="payment-form" onSubmit={handlePayment}>
                        <div className="form-group">
                            <label htmlFor="cardName">Cardholder Name</label>
                            <input
                                type="text"
                                id="cardName"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="Name on card"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cardNumber">Card Number</label>
                            <input
                                type="text"
                                id="cardNumber"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="expiryDate">Expiry Date</label>
                                <input
                                    type="text"
                                    id="expiryDate"
                                    value={expiryDate}
                                    onChange={handleExpiryDateChange}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cvv">CVV</label>
                                <input
                                    type="text"
                                    id="cvv"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    placeholder="123"
                                    maxLength="4"
                                    required
                                />
                            </div>
                        </div>
                        
                        {error && <div className="error-message">{error}</div>}
                        
                        <button 
                            type="submit" 
                            className="pay-button"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : `Pay ₪${amount}`}
                        </button>
                    </form>
                )}
                
                {paymentMethod === 'paypal' && (
                    <div className="paypal-section">
                        <p>You'll be redirected to PayPal to complete your payment.</p>
                        <button 
                            className="pay-button paypal-button"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Continue to PayPal'}
                        </button>
                    </div>
                )}
                
                {/* Success Message */}
                {success && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Payment Successful!</h3>
                        <p>Your payment has been processed successfully.</p>
                        <p>Redirecting to your profile...</p>
                    </div>
                )}
            </div>
            
            {/* Bottom Navigation */}
            <div className="bottom-bar">
                <Link to="/home" className="bottom-bar-button">
                    <HomeIcon />
                    <span>Home</span>
                </Link>
                <Link to="/map" className="bottom-bar-button">
                    <MapIcon />
                    <span>Map</span>
                </Link>
                <Link to="/favorites" className="bottom-bar-button">
                    <HeartIcon />
                    <span>Favorites</span>
                </Link>
                <Link to="/personal-area" className="bottom-bar-button">
                    <UserIcon />
                    <span>Profile</span>
                </Link>
                <button 
                    className="bottom-bar-button" 
                    onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }}
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Payment; 