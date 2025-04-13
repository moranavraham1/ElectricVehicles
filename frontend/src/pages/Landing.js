import React from 'react';
import { Link } from 'react-router-dom';
import '../designs/Landing.css';
import logo from '../assets/logo.jpg';

function Landing() {
    return (
        <div className="landing-container">
            <nav className="nav-bar">
                <div className="nav-content">
                    <div className="nav-left">
                        <div className="nav-logo">
                            <img src={logo} alt="GSFI Logo" className="logo-image" />
                        </div>
                    </div>
                    <div className="nav-buttons">
                        <Link to="/login" className="nav-button login">Sign In</Link>
                        <Link to="/register" className="nav-button register">Register</Link>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                <div className="hero-content">
                    <h1>Empowering Your Electric Journey</h1>
                    <h2>Smart Charging Solutions</h2>
                    <Link to="/login" className="start-button">Start Charging →</Link>
                </div>

                <section className="quick-stats">
                    <div className="stat-box">
                        <span className="stat-number">2,000+</span>
                        <span className="stat-label">תחנות טעינה</span>
                    </div>
                    <div className="stat-box highlight">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">זמינות</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">98%</span>
                        <span className="stat-label">אמינות</span>
                    </div>
                </section>

                <section className="features-section">
                    <div className="features-grid">
                        <div className="feature-item">
                            <h3>2,000+ Stations</h3>
                            <p>Nationwide Coverage</p>
                        </div>
                        <div className="feature-item">
                            <h3>24/7 Available</h3>
                            <p>Always Ready to Charge</p>
                        </div>
                        <div className="feature-item">
                            <h3>Real-Time Updates</h3>
                            <p>Live Station Status</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Company</h4>
                        <Link to="/about">About</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                    <div className="footer-section">
                        <h4>Resources</h4>
                        <Link to="/locations">Locations</Link>
                        <Link to="/faq">FAQ</Link>
                    </div>
                    <div className="footer-section">
                        <h4>Legal</h4>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Use</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 GSFI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;