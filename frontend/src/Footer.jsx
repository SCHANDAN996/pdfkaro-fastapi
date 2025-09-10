import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-800 text-white mt-16">
      <div className="container mx-auto px-6 py-4 text-center">
        <p>&copy; {currentYear} PDFkaro.in. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

