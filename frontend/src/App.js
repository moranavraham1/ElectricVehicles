import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './Dashboard';
import Home from './pages/Home'; // Home page
import MapPage from './pages/MapPage'; // Map page
import Favorites from './pages/Favorites'; // Favorites page
import PersonalArea from './pages/PersonalArea'; // Personal Area page
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';
import './index.css';




import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* ToastContainer to handle toast notifications globally */}
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
        <Routes>
          <Route path="/verify-email" element={<VerifyCode />} />
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/map" element={<MapPage />} /> {/* Route for the map page */}
          <Route path="/favorites" element={<Favorites />} /> {/* Route for favorites */}
          <Route path="/personal-area" element={<PersonalArea />} /> {/* Route for personal area */}
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
