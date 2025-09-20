import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App.jsx'; 
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode has been removed to fix react-beautiful-dnd issues
  <App />
);

reportWebVitals();
