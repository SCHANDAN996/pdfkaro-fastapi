import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage'; // We will show only the HomePage for now

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] text-[#333333] font-sans">
      <Header />
      <main className="flex-grow">
        {/* We are temporarily removing the router and showing only the HomePage */}
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}

export default App;

