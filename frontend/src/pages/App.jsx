import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import HomePage from './HomePage.jsx';
import MergePage from './MergePage.jsx';
import DownloadPage from './DownloadPage.jsx';
import SplitPage from './SplitPage.jsx';
import ProjectExporterPage from './ProjectExporterPage.jsx'; // नया पेज इम्पोर्ट करें

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merge" element={<MergePage />} />
            <Route path="/split" element={<SplitPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/project-exporter" element={<ProjectExporterPage />} /> {/* नया रूट जोड़ें */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
