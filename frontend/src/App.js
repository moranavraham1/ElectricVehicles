import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './Dashboard';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import Favorites from './pages/Favorites';
import PersonalArea from './pages/PersonalArea';
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute'; // ייבוא ProtectedRoute
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
        <Routes>
          {/* נתיבים ציבוריים */}
          <Route path="/verify-email" element={<VerifyCode />} />
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* נתיבים מוגנים */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-area"
            element={
              <ProtectedRoute>
                <PersonalArea />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
