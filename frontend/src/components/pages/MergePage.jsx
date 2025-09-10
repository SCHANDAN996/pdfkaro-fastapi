
import React, { useState } from 'react';
import { UploadCloud, File, Trash2 } from 'lucide-react';

const MergePage = ({ darkMode }) => {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(event.target.files)]);
    }
  };
  
  const handleMerge = async () => {
    if (files.length < 2) {
      alert("कृपया मर्ज करने के लिए कम से कम 2 फाइलें चुनें।");
      return;
    }
    setIsMerging(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

    try {
      const response = await fetch(`${apiUrl}/api/v1/merge`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Yahan par merged file download karne ka logic aayega
        setFiles([]); // Clear files after merge
      } else {
        alert("कुछ गड़बड़ हुई, कृपया फिर से प्रयास करें।");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("सर्वर से कनेक्ट नहीं हो पा रहा है।");
    } finally {
        setIsMerging(false);
    }
  };

  return (
    <div className={`py-12 px-6 container mx-auto transition-colors duration-300 ${darkMode ? 'text-white' : 'text-dark-charcoal'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary">Merge PDF Files</h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          कई PDF फाइलों को एक ही डॉक्यूमेंट में मिलाएं।
        </p>
      </div>
      
      <div className={`max-w-3xl mx-auto p-8 border-2 border-dashed rounded-2xl ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
         <input type="file" multiple accept=".pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
          <UploadCloud size={64} className="text-primary" />
          <p className="text-lg font-semibold">फ़ाइलें यहां खींचें और छोड़ें</p>
          <p className="text-sm text-gray-500">या</p>
          <span className="px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-primary">
            फाइलें चुनें
          </span>
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8">
          <h3 className="text-xl font-semibold mb-4">आपकी फाइलें: ({files.length})</h3>
          {files.map((file, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg mb-2 ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <div className="flex items-center space-x-3">
                    <File className="text-red-500" />
                    <span>{file.name}</span>
                </div>
                <button onClick={() => setFiles(files.filter((_, i) => i !== index))}>
                  <Trash2 className="text-gray-500 hover:text-red-500" />
                </button>
            </div>
          ))}
        </div>
      )}

       <div className="text-center mt-12">
        <button 
          onClick={handleMerge}
          disabled={files.length < 2 || isMerging}
          className="px-10 py-4 text-white font-bold rounded-lg text-lg shadow-xl bg-primary transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isMerging ? "Merging..." : "PDF मर्ज करें"}
        </button>
       </div>
    </div>
  );
};

export default MergePage;

