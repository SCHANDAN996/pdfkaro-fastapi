import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const MergePage = lazy(() => import('./pages/MergePage'));
const SplitPage = lazy(() => import('./pages/SplitPage'));  // Add this import
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const CompressPage = lazy(() => import('./pages/CompressPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
        <Header />
        
        <main className="flex-grow">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/merge" element={<MergePage />} />
                <Route path="/split" element={<SplitPage />} />  {/* Add this route */}
                <Route path="/compress" element={<CompressPage />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
