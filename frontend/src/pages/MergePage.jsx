import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';

function MergePage() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    setError('');
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      setError('Only PDF files are accepted.');
    }
    setFiles(prevFiles => [...prevFiles, ...pdfFiles].slice(0, 10)); // Limit to 10 files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    }
  });

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }
    setIsMerging(true);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Get API URL from environment variable
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/merge`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Something went wrong on the server.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setFiles([]); // Clear files after successful merge
    } catch (err) {
      setError('Failed to merge PDFs. Please try again.');
      console.error(err);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-700">Merge PDF Files</h1>
        <p className="text-center text-slate-500 mb-8">Combine multiple PDFs into one single document.</p>

        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          {isDragActive ? (
            <p className="mt-4 text-indigo-600">Drop the files here ...</p>
          ) : (
            <p className="mt-4 text-slate-500">Drag & drop some files here, or click to select files</p>
          )}
          <p className="text-xs text-slate-400 mt-2">Only PDF files are accepted</p>
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {files.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-600">Files to Merge:</h2>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-slate-100 p-3 rounded-md">
                  <div className="flex items-center">
                    <FileIcon className="h-5 w-5 mr-3 text-indigo-500" />
                    <span className="text-sm text-slate-700">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(file.name)} className="text-slate-400 hover:text-red-500">
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleMerge}
            disabled={isMerging || files.length < 2}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {isMerging ? 'Merging...' : 'Merge PDFs'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MergePage;

