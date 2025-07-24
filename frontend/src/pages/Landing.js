import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../designs/Landing.css';
import logo from '../assets/logo.jpg';
import { FaArrowUp } from 'react-icons/fa';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

// SVG Icons
const SearchIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const BoltIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

function Landing() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        title: '',
        content: ''
    });
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Check for existing authentication and redirect to home if logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedInUser = localStorage.getItem('loggedInUser');
        
        if (token && loggedInUser) {
            navigate('/home');
        }
    }, [navigate]);

    useEffect(() => {
        const checkScroll = () => {
            if (window.pageYOffset > 300) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        checkScroll();

        window.addEventListener('scroll', checkScroll);

        return () => window.removeEventListener('scroll', checkScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const openModal = (title, content) => {
        document.body.style.overflow = 'hidden';
        setModalContent({
            isOpen: true,
            title,
            content
        });
    };

    const closeModal = () => {
        document.body.style.overflow = 'auto';
        setModalContent({
            ...modalContent,
            isOpen: false
        });
    };

    return (
        <div className="landing-container">
            <nav className="nav-bar">
                <div className="nav-content">
                    <div className="nav-left">
                        <div className="nav-logo" style={{ position: 'static', transform: 'none' }}>
                            <img src={logo} alt="EV Charging Website Logo" className="logo-image" style={{ transform: 'none' }} />
                        </div>
                    </div>
                    <div className="nav-buttons">
                        <Link to="/login" className="nav-button login">Sign In</Link>
                        <Link to="/register" className="nav-button register">Register</Link>
                    </div>
                </div>
            </nav>

            <div className="hero-content">
                <h1>Empowering Your Electric Journey</h1>
                <h2>Smart Charging Solutions for Electric Vehicles</h2>
                <h3>Find, Book and Charge with Ease</h3>
                <Link to="/login" className="start-button" style={{ background: '#1E293B' }}>Start Charging →</Link>
            </div>

            <main className="main-content">
                <section className="welcome-section">
                    <div className="container">
                        <div className="welcome-title">Driving Electric Made Simple</div>
                        <div className="welcome-subtitle">
                            Innovative platform that helps you find charging stations, check real-time availability, and manage your charging sessions effortlessly
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <div className="section-title">How It Works</div>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <SearchIcon />
                            </div>
                            <h3>Find Stations</h3>
                            <p>Locate available charging stations in your area in real-time</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <CalendarIcon />
                            </div>
                            <h3>Book Appointments</h3>
                            <p>Schedule charging sessions at your convenience</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <BoltIcon />
                            </div>
                            <h3>Smart Charging</h3>
                            <p>Monitor and manage your charging in real-time</p>
                        </div>
                    </div>
                </section>

                <section className="benefits-section">
                    <div className="section-title">Why Choose Us</div>
                    <div className="benefits-container">
                        <div className="benefit-item">
                            <h4>Nationwide Coverage</h4>
                            <p>Over 1300+ charging stations across the country</p>
                        </div>
                        <div className="benefit-item">
                            <h4>Real-time Notifications</h4>
                            <p>Get updates about charging status and available stations</p>
                        </div>
                        <div className="benefit-item">
                            <h4>Quick Navigation</h4>
                            <p>Easily reach stations with integrated navigation apps</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Company</h4>
                        <button onClick={() => openModal('About Us',
                            `<p>EVISION is an innovative platform designed to simplify the electric vehicle charging experience. Our mission is to make EV charging more accessible and convenient for all users.</p>
                            <br/>
                            <p>Our service helps users locate charging stations, book appointments, and manage their charging experience efficiently.</p>`
                        )} className="footer-link">About</button>
                        <button onClick={() => openModal('Contact Us',
                            `<h5>Contact Information</h5>
                            <p>Contact details will be available when the site launches.</p>`
                        )} className="footer-link">Contact</button>
                    </div>
                    <div className="footer-section">
                        <h4>Resources</h4>
                        <button onClick={() => openModal('Locations',
                            `<p>Our service provides information about charging stations across Israel.</p>
                            <br/>
                            <p>Charging stations can be found at:</p>
                            <ul>
                                <li>Major urban centers</li>
                                <li>Shopping malls and commercial centers</li>
                                <li>Highway rest stops</li>
                                <li>Public parking areas</li>
                            </ul>
                            <br/>
                            <p>Use our app to find the nearest charging station to your location.</p>`
                        )} className="footer-link">Locations</button>
                        <button onClick={() => openModal('FAQ',
                            `<h5>Frequently Asked Questions</h5>
                            <p>FAQ information will be available when the site launches.</p>`
                        )} className="footer-link">FAQ</button>
                    </div>
                    <div className="footer-section">
                        <h4>Legal</h4>
                        <button onClick={() => openModal('Privacy Policy',
                            `<h5>Privacy Policy</h5>
                            <p>The complete Privacy Policy will be available when the site launches.</p>`
                        )} className="footer-link">Privacy Policy</button>
                        <button onClick={() => openModal('Terms of Use',
                            `<h5>Terms of Use</h5>
                            <p>The Terms of Use will be available when the site launches.</p>`
                        )} className="footer-link">Terms of Use</button>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 EVISION. All rights reserved.</p>
                </div>
            </footer>

            {showScrollButton && (
                <button className="scroll-top-button" onClick={scrollToTop} aria-label="Scroll to top">
                    <FaArrowUp />
                </button>
            )}

            {modalContent.isOpen && (
                <div className="info-modal" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalContent.title}</h3>
                            <button className="close-modal" onClick={closeModal}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body" dangerouslySetInnerHTML={{ __html: modalContent.content }}></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Landing;