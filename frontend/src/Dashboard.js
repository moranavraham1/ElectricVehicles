// Dashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <p>You are logged in.</p>
    </div>
  );
}

export default Dashboard;
