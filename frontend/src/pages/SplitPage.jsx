import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, File as FileIcon, Scissors, LoaderCircle, Info } from 'lucide-react';

const SplitPage = () => {
    const [file, setFile] = useState(null);
    const [pageRanges, setPageRanges] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        
        const pdfFile = acceptedFiles[0];
        if (pdfFile.type !== "application/pdf") {
            setError("Only PDF files are accepted.");
            return;
        }
        
        setError('');
        setFile(pdfFile);
        
        // Get total page count
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const typedArray = new Uint8Array(arrayBuffer);
            
            // Use PDF.js to get page count
            const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
            setTotalPages(pdf.numPages);
        } catch (err) {
            console.error("Error reading PDF:", err);
            setError("Could not read the PDF file.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false 
    });

    const removeFile = () => {
        setFile(null);
        setTotalPages(0);
        setPageRanges('');
    };

    const handleSplit = async () => {
        if (!file) {
            setError("Please select a PDF file first.");
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pages', pageRanges || 'all');
        
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/v1/split`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Server error: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            navigate('/download', { 
                state: { 
                    downloadUrl: url, 
                    fileName: 'split_pdf_files.zip', 
                    sourceTool: 'split' 
                } 
            });
        } catch (err) {
            setError(`Failed to split PDF: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const examples = [
        "1-5 (pages 1 through 5)",
        "1,3,5 (pages 1, 3, and 5)",
        "1-3,5,7-9 (pages 1-3, 5, and 7-9)",
        "all (all pages as separate files)"
    ];

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <Scissors className="h-10 w-10 text-primary mr-3" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Split PDF</h1>
                </div>
                <p className="text-slate-600 mt-2">
                    Extract specific pages or split your PDF into individual pages
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Upload PDF</h2>
                    
                    {!file ? (
                        <div 
                            {...getRootProps()} 
                            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${
                                isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-slate-400'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center text-slate-500">
                                <UploadCloud size={48} className="mb-4 text-slate-400" />
                                <p className="text-lg font-semibold">
                                    {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file, or click to select'}
                                </p>
                                <p className="text-sm mt-2">Only PDF files are accepted</p>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <FileIcon className="h-6 w-6 text-slate-500 mr-2" />
                                    <span className="font-medium truncate">{file.name}</span>
                                </div>
                                <button 
                                    onClick={removeFile}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="text-sm text-slate-500">
                                {totalPages} page{totalPages !== 1 ? 's' : ''}
                            </div>
                        </div>
                    )}
                </div>

                {/* Page Selection Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Page Selection</h2>
                    
                    <div className="mb-4">
                        <label htmlFor="pageRanges" className="block text-sm font-medium text-slate-700 mb-2">
                            Enter page ranges (leave empty for all pages)
                        </label>
                        <input
                            type="text"
                            id="pageRanges"
                            value={pageRanges}
                            onChange={(e) => setPageRanges(e.target.value)}
                            placeholder="e.g., 1-3,5,7-9 or leave empty for all pages"
                            className="input-field"
                            disabled={!file}
                        />
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 text-sm">
                        <div className="flex items-start mb-2">
                            <Info className="h-4 w-4 text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 font-medium">Format examples:</span>
                        </div>
                        <ul className="text-slate-600 space-y-1">
                            {examples.map((example, index) => (
                                <li key={index} className="text-sm">• {example}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <button 
                        onClick={handleSplit}
                        disabled={isLoading || !file}
                        className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <LoaderCircle className="animate-spin mr-2" size={20} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Scissors className="mr-2" size={20} />
                                Split PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* How It Works Section */}
            <div className="mt-12 bg-slate-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">How to Split a PDF</h2>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                    <li>Upload your PDF file using the drag and drop area</li>
                    <li>Optionally specify which pages to extract (or leave empty for all pages)</li>
                    <li>Click the "Split PDF" button to process your file</li>
                    <li>Download your split PDF files as a ZIP archive</li>
                </ol>
            </div>
        </div>
    );
};

export default SplitPage;
