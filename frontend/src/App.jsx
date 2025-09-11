import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import MergePage from './pages/MergePage.jsx';
import DownloadPage from './pages/DownloadPage.jsx'; // Naya page import karein

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merge" element={<MergePage />} />
            <Route path="/download" element={<DownloadPage />} /> {/* Naya route jodein */}
            {/* Yahan future me aur routes (split, compress, etc.) aayenge */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

