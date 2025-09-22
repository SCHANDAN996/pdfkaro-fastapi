import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, LoaderCircle, Trash2, Settings, SlidersHorizontal, Target } from 'lucide-react';

const CompressPage = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [compressionMode, setCompressionMode] = useState('quality');
    const [qualityValue, setQualityValue] = useState(50);
    const [targetSize, setTargetSize] = useState('500');
    const [sizeUnit, setSizeUnit] = useState('KB');
    const navigate = useNavigate();

    // File drop handler
    const onDrop = useCallback((acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 'application/pdf': ['.pdf'] },
        multiple: true
    });

    // Remove file
    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    // Compression handler - SIMPLIFIED
    const handleCompress = async () => {
        if (files.length === 0) return;
        
        setIsLoading(true);

        try {
            const formData = new FormData();
            
            // Add files
            files.forEach(file => {
                formData.append('files', file);
            });

            const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
            let endpoint = '';
            let success = false;

            // Try quality-based compression first
            if (compressionMode === 'quality') {
                endpoint = '/api/v1/compress/quality';
                formData.append('quality', qualityValue);
                
                const response = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    success = true;
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    navigate('/compress-complete', { 
                        state: { 
                            downloadUrl: url,
                            fileName: files.length === 1 
                                ? `compressed_${files[0].name}` 
                                : 'compressed_pdfs.zip'
                        } 
                    });
                }
            } 
            // Try size-based compression
            else {
                endpoint = '/api/v1/compress/size';
                formData.append('target_size', parseInt(targetSize));
                formData.append('size_unit', sizeUnit);
                
                const response = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    success = true;
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    navigate('/compress-complete', { 
                        state: { 
                            downloadUrl: url,
                            fileName: files.length === 1 
                                ? `compressed_${files[0].name}` 
                                : 'compressed_pdfs.zip'
                        } 
                    });
                }
            }

            if (!success) {
                // Fallback to basic compression
                endpoint = '/api/v1/compress';
                formData.append('level', 'medium');
                
                const response = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    navigate('/compress-complete', { 
                        state: { 
                            downloadUrl: url,
                            fileName: files.length === 1 
                                ? `compressed_${files[0].name}` 
                                : 'compressed_pdfs.zip'
                        } 
                    });
                } else {
                    throw new Error('All compression methods failed');
                }
            }

        } catch (error) {
            console.error('Compression error:', error);
            alert('Compression failed. Please try with different files or settings.');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96">
                <LoaderCircle className="animate-spin text-blue-600" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-gray-800">Compressing your PDF...</h2>
                <p className="text-gray-600 mt-2">Please wait, this may take a moment.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Compress PDF Files</h1>
                <p className="text-gray-600 mt-2">Reduce file size while maintaining quality</p>
            </div>

            {/* File Drop Zone */}
            {files.length === 0 ? (
                <div {...getRootProps()} className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={64} className="mx-auto mb-4 text-gray-400" />
                    <p className="font-semibold text-lg text-gray-700">Drag & drop PDF files here</p>
                    <p className="text-gray-500 mt-2">or click to select files</p>
                    <p className="text-sm text-gray-400 mt-4">Supports multiple PDF files</p>
                </div>
            ) : (
                <>
                    {/* File List */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">
                            Selected Files ({files.length})
                        </h3>
                        <div className="space-y-3">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-10 bg-red-100 rounded flex items-center justify-center">
                                            <span className="text-red-600 font-bold text-sm">PDF</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 truncate max-w-xs">
                                                {file.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveFile(index)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        title="Remove file"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        {/* Add More Files */}
                        <div {...getRootProps()} className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <input {...getInputProps()} />
                            <p className="text-gray-600">+ Add more PDF files</p>
                        </div>
                    </div>

                    {/* Compression Options */}
                    <div className="bg-white p-8 rounded-xl border shadow-sm mb-8">
                        <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
                            <Settings size={24} /> Compression Settings
                        </h3>
                        
                        {/* Mode Selection */}
                        <div className="flex justify-center mb-8">
                            <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
                                <button 
                                    onClick={() => setCompressionMode('quality')} 
                                    className={`px-6 py-3 rounded-md flex items-center gap-3 transition-all ${
                                        compressionMode === 'quality' 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-white'
                                    }`}
                                >
                                    <SlidersHorizontal size={18} /> Quality Based
                                </button>
                                <button 
                                    onClick={() => setCompressionMode('size')} 
                                    className={`px-6 py-3 rounded-md flex items-center gap-3 transition-all ${
                                        compressionMode === 'size' 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-white'
                                    }`}
                                >
                                    <Target size={18} /> Size Based
                                </button>
                            </div>
                        </div>

                        {/* Quality Based Options */}
                        {compressionMode === 'quality' ? (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="font-semibold text-lg text-gray-800">
                                            Quality Level
                                        </label>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {qualityValue}%
                                        </span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="100" 
                                        value={qualityValue} 
                                        onChange={(e) => setQualityValue(parseInt(e.target.value))} 
                                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                                    />
                                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                                        <span>Small File Size</span>
                                        <span>Best Quality</span>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Recommendation:</strong> {
                                            qualityValue >= 80 ? 'High Quality (Large File)' :
                                            qualityValue >= 60 ? 'Good Quality (Balanced)' :
                                            qualityValue >= 40 ? 'Medium Compression' :
                                            qualityValue >= 20 ? 'High Compression' : 'Maximum Compression'
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Size Based Options */
                            <div className="space-y-6">
                                <div>
                                    <label className="font-semibold text-lg text-gray-800 block mb-3">
                                        Target File Size
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <input 
                                            type="number" 
                                            value={targetSize} 
                                            onChange={e => setTargetSize(e.target.value)} 
                                            className="border border-gray-300 rounded-lg p-3 text-lg w-32 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            min="1"
                                            placeholder="500"
                                        />
                                        <select 
                                            value={sizeUnit} 
                                            onChange={e => setSizeUnit(e.target.value)} 
                                            className="border border-gray-300 rounded-lg p-3 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        >
                                            <option value="KB">KB</option>
                                            <option value="MB">MB</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-green-800 text-sm">
                                        <strong>Target Range:</strong> We'll compress your files to approximately {
                                            sizeUnit === 'MB' 
                                            ? `${(parseInt(targetSize) * 0.8).toFixed(0)}-${targetSize} MB`
                                            : `${(parseInt(targetSize) * 0.8).toFixed(0)}-${targetSize} KB`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Compress Button */}
                        <div className="text-center mt-8">
                            <button 
                                onClick={handleCompress}
                                disabled={files.length === 0}
                                className="bg-blue-600 text-white font-bold py-4 px-16 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg shadow-lg transform hover:scale-105 transition-transform"
                            >
                                Compress {files.length} PDF File{files.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CompressPage;
