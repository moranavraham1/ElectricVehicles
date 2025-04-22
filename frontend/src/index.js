import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './designs/index.css';  // אם הקובץ נמצא ב-`src/designs/`

// Add global CSS reset to ensure scrolling works
const globalStyle = document.createElement('style');
globalStyle.innerHTML = `
  html, body, #root {
    height: auto !important;
    min-height: 100% !important;
    overflow: visible !important;
    overflow-y: auto !important;
    margin: 0;
    padding: 0;
  }
  body {
    position: relative;
    overflow-x: hidden;
  }
`;
document.head.appendChild(globalStyle);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
