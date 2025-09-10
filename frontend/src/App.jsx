import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MergePage from './pages/MergePage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merge" element={<MergePage />} />
            {/* Add other routes like /split here later */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

