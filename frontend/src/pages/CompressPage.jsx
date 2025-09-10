import React from 'react';

const CompressPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Compress PDF</h1>
        <p className="text-gray-600 mt-2">Reduce PDF file size without losing quality (Coming Soon)</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Under Construction</h2>
        <p className="text-gray-600 mb-6">
          We're working hard to bring you PDF compression features. Check back soon!
        </p>
        <a 
          href="/" 
          className="btn-primary inline-block"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default CompressPage;
