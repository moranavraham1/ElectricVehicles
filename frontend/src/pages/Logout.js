import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import '../designs/Logout.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
        alert('You have been logged out successfully!');

        navigate('/login', { replace: true });
    }, [navigate]);

    return <div>Logging out...</div>;
};

export default Logout;
