import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import { 
  HomeIcon, 
  MapIcon, 
  UserIcon, 
  HeartIcon, 
  LogoutIcon 
} from './Icons';

/**
 * Navigation bar component used throughout the application
 */
const NavigationBar = ({ 
  userName = '', 
  activePage = 'home',
  onLogout
}) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      try {
        localStorage.clear();
        alert('You have been logged out successfully!');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <nav className="bottom-navigation">
      <Link to="/" className={`nav-item ${activePage === 'home' ? 'active' : ''}`}>
        <HomeIcon />
        <span>Home</span>
      </Link>
      
      <Link to="/map" className={`nav-item ${activePage === 'map' ? 'active' : ''}`}>
        <MapIcon />
        <span>Map</span>
      </Link>
      
      <Link to="/favorites" className={`nav-item ${activePage === 'favorites' ? 'active' : ''}`}>
        <HeartIcon filled={activePage === 'favorites'} />
        <span>Favorites</span>
      </Link>
      
      <Link to="/profile" className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}>
        <UserIcon />
        <span>{userName ? userName.split(' ')[0] : 'Profile'}</span>
      </Link>
      
      <button className="nav-item logout" onClick={handleLogout}>
        <LogoutIcon />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default NavigationBar; 