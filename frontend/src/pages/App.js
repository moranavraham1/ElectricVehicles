import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import MapPage from './MapPage';
import Favorites from './Favorites';
import PersonalArea from './PersonalArea';
import VerifyCode from './VerifyCode';
import ChangePassword from './ChangePassword';
import ProtectedRoute from '../components/ProtectedRoute'; 
import Logout from './Logout'; 
import '../designs/index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
<<<<<<< HEAD
=======
import Charging from './Charging'; // ודאי שהנתיב נכון
import ChargingQueue from './ChargingQueue';
import MyBookings from './MyBookings';
>>>>>>> 510cb047 (LLLP algorithm for prioritizing vehicle charging)


function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
        
        <Routes>
         
          <Route path="/verify-email" element={<VerifyCode />} />
          <Route path="/login" element={<Login />} /> {/* ✅ תיקון הוספת נתיב התחברות */}
          <Route path="/register" element={<Register />} />
          <Route path="/Change-Password/:token" element={<ChangePassword />} />
          <Route path="/charging" element={<Charging />} />


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
          <Route
            path="/queue/:stationName/:selectedDate"
            element={
              <ProtectedRoute>
                <ChargingQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route path="/logout" element={<Logout />} />
<<<<<<< HEAD
          
=======

          <Route path="/charging-queue/:stationName/:selectedDate" element={<ChargingQueue />} />

>>>>>>> 510cb047 (LLLP algorithm for prioritizing vehicle charging)

          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;