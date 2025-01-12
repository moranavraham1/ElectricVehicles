import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // ייבוא נכון לגרסה 4.0.0

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // קבלת הטוקן מהמקומי

  if (!token) {
    console.log('No token found. Redirecting to login.');
    return <Navigate to="/" />;
  }

  try {
    const decodedToken = jwtDecode(token); // פענוח הטוקן
    const currentTime = Date.now() / 1000; // זמן נוכחי בשניות
    if (decodedToken.exp < currentTime) {
      console.log('Token expired. Redirecting to login.');
      localStorage.removeItem('token'); // מחיקת הטוקן שפג תוקף
      return <Navigate to="/" />;
    }
  } catch (error) {
    console.log('Invalid token. Redirecting to login.');
    localStorage.removeItem('token'); // אם הטוקן לא חוקי
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
