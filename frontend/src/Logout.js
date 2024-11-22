import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  
import { logoutUser } from './api';

function Logout() {
  const navigate = useNavigate();  

  useEffect(() => {
    logoutUser();
    navigate('/login');  
  }, [navigate]); 

  return <div>Logging out...</div>;
}

export default Logout;
