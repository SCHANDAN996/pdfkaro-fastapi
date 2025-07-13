// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to PDFkaro.in</h1>
      <button>
        <Link to="/tool/merge">Merge PDF</Link>
      </button>
      <button>
        <Link to="/tool/compress">Compress PDF</Link>
      </button>
    </div>
  );
};

export default HomePage;
