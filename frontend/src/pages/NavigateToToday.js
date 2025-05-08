import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
// import '../designs/NavigateToToday.css';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon, LocationIcon, CityIcon, CalendarIcon, ClockIcon, BatteryIcon } from '../components/common/Icons';
import NavigationBar from '../components/common/NavigationBar';
import Button from '../components/common/Button';

const NavigateToToday = () => {
  const { stationName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    navigate(`/charging-queue/${encodeURIComponent(stationName)}/${today}`, { replace: true });
  }, [stationName, navigate]);

  return null;
};

export default NavigateToToday;
