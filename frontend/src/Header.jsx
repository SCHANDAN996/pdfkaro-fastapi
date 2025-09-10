import React from 'react';
import { FileStack } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileStack className="text-slate-600 h-8 w-8" />
          <a href="/" className="text-2xl font-bold text-slate-800">PDFkaro.in</a>
        </div>
        <nav>
          <a href="#tools" className="text-slate-600 hover:text-slate-800 transition-colors">Tools</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

