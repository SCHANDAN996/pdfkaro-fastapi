import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MergePage from './pages/MergePage';
// अन्य टूल पेजों को यहाँ आयात करें

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/merge-pdf" element={<MergePage />} />
          {/* अन्य टूल्स के लिए रूट यहाँ जोड़ें */}
          {/* <Route path="/compress-pdf" element={<CompressPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

