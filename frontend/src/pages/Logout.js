import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // ניקוי כל הנתונים מה-localStorage
        localStorage.clear();
        alert('You have been logged out successfully!');
        
        // ✅ בדיקה אם הנתיב /login קיים
        navigate('/login', { replace: true }); 
    }, [navigate]);

    return <div>Logging out...</div>;
};

export default Logout;
