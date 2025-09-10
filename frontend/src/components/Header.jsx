import React from 'react';
import { Moon, Sun } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode, setCurrentPage }) => (
  <header className={`py-4 px-6 md:px-12 shadow-md sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
    <div className="container mx-auto flex justify-between items-center">
      <h1 
        className="text-2xl font-bold cursor-pointer text-primary"
        onClick={() => setCurrentPage('home')}
      >
        PDFkaro.in
      </h1>
      <button onClick={toggleDarkMode} className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 text-primary ${darkMode ? 'bg-gray-700' : 'bg-secondary'}`}>
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  </header>
);

export default Header;


