
import React from 'react';
import { UploadCloud } from 'lucide-react';

const SplitPage = ({ darkMode }) => {
  return (
    <div className={`py-12 px-6 container mx-auto transition-colors duration-300 ${darkMode ? 'text-white' : 'text-dark-charcoal'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary">Split PDF File</h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          एक PDF को कई अलग-अलग फाइलों में बांटें। (यह फीचर जल्द आ रहा है)
        </p>
      </div>

      <div className={`max-w-3xl mx-auto p-8 border-2 border-dashed rounded-2xl ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloud size={64} className="text-primary" />
          <p className="text-lg font-semibold">फ़ाइल यहां खींचें और छोड़ें</p>
           <p className="text-sm text-gray-500">या</p>
          <button className="px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-primary">
            फाइल चुनें
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitPage;

