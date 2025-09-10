import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X } from 'lucide-react';

const MergePage = () => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  const removeFile = (fileToRemove) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800">Merge PDF Files</h1>
        <p className="mt-2 text-slate-600">Combine multiple PDFs into a single, unified document.</p>
      </div>

      <div {...getRootProps()} className={`border-4 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-slate-600 bg-slate-100' : 'border-slate-300 hover:border-slate-400'}`}>
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-16 w-16 text-slate-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg text-slate-700">Drop the files here ...</p>
        ) : (
          <p className="text-lg text-slate-700">Drag & drop some files here, or click to select files</p>
        )}
        <p className="text-sm text-slate-500 mt-2">Only PDF files are accepted</p>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-700">Files to Merge:</h2>
          <ul className="space-y-3">
            {files.map((file, index) => (
              <li key={index} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-6 w-6 text-slate-500" />
                  <span className="font-medium text-slate-800">{file.name}</span>
                </div>
                <button onClick={() => removeFile(file)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
           <button className="mt-8 w-full bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-all text-lg">
            Merge PDFs
          </button>
        </div>
      )}
    </div>
  );
};

export default MergePage;

