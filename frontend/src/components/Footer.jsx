import React from 'react';

const Footer = ({ darkMode }) => (
  <footer className={`pt-12 pb-8 px-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
    <div className="container mx-auto text-center">
      <h2 className="text-xl font-bold mb-4 text-primary">PDFkaro.in</h2>
      <p className="mb-6">Copyright © 2024 PDFkaro.in. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;


