import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-slate-800">
          PDFkaro.in
        </a>
        <nav>
          <a href="/#tools" className="text-slate-600 hover:text-slate-800">
            Tools
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

