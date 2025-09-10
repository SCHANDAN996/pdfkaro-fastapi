import React from 'react';

const LoadingSpinner = ({ size = 'large', text = 'Loading...' }) => {
  const sizeClass = size === 'small' ? 'w-5 h-5' : 'w-12 h-12';
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`spinner ${sizeClass} mb-4`}></div>
      <p className="text-gray-600 animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
