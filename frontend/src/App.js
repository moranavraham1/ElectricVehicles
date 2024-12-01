import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './Dashboard';
import Home from './pages/Home';  // ייבוא דף הבית
import MapPage from './pages/MapPage'; // ייבוא דף המפה החדש
import Favorites from './pages/Favorites'; // ייבוא דף מועדפים
import PersonalArea from './pages/PersonalArea'; // ייבוא דף אזור אישי

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/map" element={<MapPage />} /> {/* הנתיב החדש למפה */}
          <Route path="/favorites" element={<Favorites />} /> {/* נתיב למועדפים */}
          <Route path="/personal-area" element={<PersonalArea />} /> {/* נתיב לאזור אישי */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
