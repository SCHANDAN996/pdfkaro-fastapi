import React from 'react';
import { UploadCloud, Scissors } from 'lucide-react';

const SplitPage = ({ darkMode }) => {
  // अभी के लिए यह सिर्फ एक प्लेसहोल्डर है।
  // यहां फाइल अपलोड और स्प्लिटिंग का लॉजिक जोड़ा जाएगा।

  return (
    <div className={`py-12 px-6 container mx-auto transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold" style={{ color: '#6A5ACD' }}>Split PDF File</h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          एक PDF को कई अलग-अलग फाइलों में बांटें।
        </p>
      </div>

      <div className={`max-w-3xl mx-auto p-8 border-2 border-dashed rounded-2xl ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloud size={64} style={{ color: '#6A5ACD' }} />
          <p className="text-lg font-semibold">फ़ाइल यहां खींचें और छोड़ें</p>
           <p className="text-sm text-gray-500">या</p>
          <button className="px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: '#6A5ACD' }}>
            फाइल चुनें
          </button>
        </div>
      </div>

      <div className="text-center mt-12">
        <button className="px-10 py-4 text-white font-bold rounded-lg text-lg shadow-xl transition-transform transform hover:scale-105" style={{ backgroundColor: '#6A5ACD' }}>
            PDF स्प्लिट करें
        </button>
       </div>
    </div>
  );
};

export default SplitPage;

