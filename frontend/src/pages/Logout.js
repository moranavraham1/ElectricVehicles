import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
