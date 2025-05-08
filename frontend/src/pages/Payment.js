import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../designs/Payment.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon, BackIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

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
            
            if (response.data.success) {
                setSuccess(true);
            } else {
                setError('Payment processing failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };
    
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
            <NavigationBar />
        </div>
    );
};

export default Payment;