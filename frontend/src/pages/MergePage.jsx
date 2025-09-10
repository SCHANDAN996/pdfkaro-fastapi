import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';

const MergePage = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        const pdfFiles = acceptedFiles.filter(file => file.type === "application/pdf");
        if (pdfFiles.length !== acceptedFiles.length) {
            setError("Only PDF files are accepted. Please try again.");
        } else {
            setError('');
            setFiles(prevFiles => [...prevFiles, ...pdfFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }))]);
        }
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
            setError("Please select at least two PDF files to merge.");
            return;
        }
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        // --- YEH HAMARA FINAL FIX HAI ---
        // Hum yahan seedhe HTTPS wala URL istemal kar rahe hain
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        console.log(`Sending secure request to: ${apiUrl}/api/v1/merge`);

        try {
            const response = await fetch(`${apiUrl}/api/v1/merge`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'merged_document.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setFiles([]);

        } catch (e) {
            console.error("Merge request failed:", e);
            setError(`Failed to merge PDFs. Please try again. Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Merge PDF Files</h1>
                <p className="text-slate-600 mt-2">Combine multiple PDFs into one single document.</p>
            </div>

            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-slate-500 bg-slate-100' : 'border-slate-300 hover:border-slate-400'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-slate-500">
                    <UploadCloud size={48} className="mb-4 text-slate-400" />
                    {isDragActive ?
                        <p className="text-lg font-semibold">Drop the files here ...</p> :
                        <p className="text-lg font-semibold">Drag & drop some files here, or click to select files</p>
                    }
                    <p className="text-sm mt-1">Only PDF files are accepted</p>
                </div>
            </div>

            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

            {files.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Files to Merge:</h2>
                    <ul className="space-y-3">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                                <div className="flex items-center space-x-3">
                                    <FileIcon className="text-slate-500" />
                                    <span className="text-slate-800 font-medium">{file.name}</span>
                                </div>
                                <button onClick={() => removeFile(file.name)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleMerge}
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800 transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {isLoading ? 'Merging...' : 'Merge PDFs'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MergePage;

