import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const MergePage = lazy(() => import('./pages/MergePage'));
const SplitPage = lazy(() => import('./pages/SplitPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Remove CompressPage import since it's not ready yet
// const CompressPage = lazy(() => import('./pages/CompressPage'));

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Header />
        
        <main className="flex-grow">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/merge" element={<MergePage />} />
                <Route path="/split" element={<SplitPage />} />
                <Route path="/download" element={<DownloadPage />} />
                {/* Remove CompressPage route for now */}
                {/* <Route path="/compress" element={<CompressPage />} /> */}
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
