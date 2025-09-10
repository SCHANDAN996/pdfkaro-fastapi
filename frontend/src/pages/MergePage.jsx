import React, { useState } from 'react';
import axios from 'axios';

const MergePage = () => {
  const [files, setFiles] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (files.length < 2) {
      setMessage('Please select at least two PDF files to merge.');
      return;
    }

    setIsUploading(true);
    setMessage('Merging files...');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/api/v1/pdf/merge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // महत्वपूर्ण: सर्वर से बाइनरी डेटा प्राप्त करने के लिए
      });

      // डाउनलोड के लिए एक लिंक बनाएँ
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'merged.pdf');
      document.body.appendChild(link);
      link.click();
      
      setMessage('Merge successful! Your download should start automatically.');
      link.parentNode.removeChild(link);

    } catch (error) {
      console.error('Error uploading files:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center text-primary mb-8">Merge PDF Files</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="mb-6">
          <label htmlFor="file-upload" className="block text-lg font-medium text-text-dark mb-2">
            Select PDF Files
          </label>
          <input 
            id="file-upload"
            type="file" 
            multiple 
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
        
        <button 
          onClick={handleUpload}
          disabled={isUploading |

| files.length === 0}
          className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400"
        >
          {isUploading? 'Merging...' : 'Merge PDFs'}
        </button>

        {message && <p className="mt-4 text-center text-gray-600">{message}</p>}

        <div className="mt-6">
          <h3 className="text-lg font-semibold">Selected Files:</h3>
          <ul className="list-disc list-inside mt-2">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MergePage;
