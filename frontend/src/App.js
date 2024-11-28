import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './Dashboard';
import Home from './pages/Home';  // ייבוא דף הבית
import MapPage from './pages/MapPage'; // ייבוא דף המפה החדש

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
