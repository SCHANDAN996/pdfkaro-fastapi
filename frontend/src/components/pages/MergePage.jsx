import React from 'react';
import { Merge } from 'lucide-react';

const MergePage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Merge size={40} className="text-[#6A5ACD]" />
            <h1 className="text-3xl font-bold text-[#333333] ml-3">Merge PDF Files</h1>
          </div>
          <p className="text-gray-600">Combine multiple PDFs into a single, unified document.</p>
        </div>
        
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-16 text-center">
            <h2 className="text-2xl font-semibold text-gray-700">File upload is temporarily disabled.</h2>
            <p className="text-gray-500 mt-2">We are working on fixing the build issue.</p>
        </div>

      </div>
    </div>
  );
};

export default MergePage;

