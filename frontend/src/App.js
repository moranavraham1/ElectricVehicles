import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import Favorites from './pages/Favorites';
import PersonalArea from './pages/PersonalArea';
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute'; 
import Logout from './pages/Logout'; 
import './index.css';
<<<<<<< HEAD
=======




>>>>>>> 95979c7d (Adding stations to favorites)
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
        
        <Routes>
         
          <Route path="/verify-email" element={<VerifyCode />} />
          <Route path="/login" element={<Login />} /> {/* ✅ תיקון הוספת נתיב התחברות */}
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
<<<<<<< HEAD


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

          <Route path="/logout" element={<Logout />} />
          

          <Route path="*" element={<Login />} />
=======
          <Route path="/map" element={<MapPage />} /> {/* Route for the map page */}
          <Route path="/favorites" element={<Favorites />} /> {/* Route for favorites */}
          <Route path="/personal-area" element={<PersonalArea />} /> {/* Route for personal area */}
          <Route path="/favorites" element={<Favorites />} />
>>>>>>> 95979c7d (Adding stations to favorites)
        </Routes>
      </div>
    </Router>
  );
}

export default App;
