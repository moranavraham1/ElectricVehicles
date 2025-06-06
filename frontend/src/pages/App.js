import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './Landing';
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
import Charging from './Charging';
import ChargingQueue from './ChargingQueue';
import NavigateToToday from './NavigateToToday';

import Payment from './Payment';
import Appointment from './Appointment';
import FutureBookings from './FutureBookings';
import AdminQueueManagement from './AdminQueueManagement';


function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/verify-email" element={<VerifyCode />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Change-Password/:token" element={<ChangePassword />} />
          <Route path="/reset-password/:token" element={<ChangePassword />} />
          <Route path="/charging" element={<Charging />} />

          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/charging-queue/:stationName" element={<NavigateToToday />} />
          <Route path="/navigate-to-today/:stationName" element={<NavigateToToday />} />
          <Route path="/appointment" element={
            <ProtectedRoute>
              <Appointment />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <FutureBookings />
            </ProtectedRoute>
          } />


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
            path="/admin/queue-management"
            element={
              <ProtectedRoute>
                <AdminQueueManagement />
              </ProtectedRoute>
            }
          />


          <Route path="/logout" element={<Logout />} />
          <Route path="/charging-queue/:stationName/:selectedDate" element={<ChargingQueue />} />

          <Route path="*" element={<Landing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;