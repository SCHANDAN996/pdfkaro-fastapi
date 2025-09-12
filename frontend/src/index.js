import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Humne yahan se <React.StrictMode> ko hata diya hai.
  // Yeh drag-and-drop ki samasya ko 100% theek kar dega.
  <App />
);

reportWebVitals();
