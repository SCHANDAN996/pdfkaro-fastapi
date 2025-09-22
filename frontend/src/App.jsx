import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import MergePage from './features/Merge/MergePage.jsx';
import SplitPage from './features/Split/SplitPage.jsx';
import ProjectExporterPage from './features/ProjectExporter/ProjectExporterPage.jsx';
import CompressPage from './features/Compress/CompressPage.jsx';
import MergeCompletePage from './features/Merge/MergeCompletePage.jsx';
import SplitCompletePage from './features/Split/SplitCompletePage.jsx';
import CompressCompletePage from './features/Compress/CompressCompletePage.jsx';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merge-pdf" element={<MergePage />} />
            <Route path="/split-pdf" element={<SplitPage />} />
            <Route path="/project-exporter" element={<ProjectExporterPage />} />
            <Route path="/compress-pdf" element={<CompressPage />} />
            <Route path="/merge-complete" element={<MergeCompletePage />} />
            <Route path="/split-complete" element={<SplitCompletePage />} />
            <Route path="/compress-complete" element={<CompressCompletePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
