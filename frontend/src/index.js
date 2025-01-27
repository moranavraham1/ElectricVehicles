import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './designs/index.css';  // אם הקובץ נמצא ב-`src/designs/`

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
