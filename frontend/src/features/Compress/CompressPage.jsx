import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, LoaderCircle, Trash2, Settings, SlidersHorizontal, Target } from 'lucide-react';

const CompressPage = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [compressionMode, setCompressionMode] = useState('quality');
    const [qualityValue, setQualityValue] = useState(50);
    const [targetSize, setTargetSize] = useState('1024');
    const [sizeUnit, setSizeUnit] = useState('KB');
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 'application/pdf': ['.pdf'] } 
    });

    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleCompress = async () => {
        if (files.length === 0) return;
        
        setIsLoading(true);
        const formData = new FormData();
        
        // Add all files
        files.forEach(file => {
            formData.append('files', file);
        });

        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        let endpoint = '/api/v1/compress';
        
        try {
            const response = await fetch(`${apiUrl}${endpoint}`, { 
                method: 'POST', 
                body: formData 
            });
            
            if (!response.ok) throw new Error('Compression failed.');
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            navigate('/compress-complete', { state: { downloadUrl: url } });
        } catch (error) {
            console.error('Compression error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">Compressing your PDF...</h2>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Compress PDF Files</h1>
                <p className="text-slate-600 mt-2">Reduce file size while maintaining quality</p>
            </div>

            {files.length === 0 ? (
                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-slate-700 bg-slate-100' : 'border-slate-400'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="font-semibold">Drag & drop PDF files here</p>
                    <p className="text-sm text-slate-500 mt-2">or click to select files</p>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3">Selected Files ({files.length})</h3>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                                    <span className="truncate">{file.name}</span>
                                    <button 
                                        onClick={() => handleRemoveFile(index)}
                                        className="p-1 bg-red-500 text-white rounded-full"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div {...getRootProps()} className="mt-4 p-3 border-2 border-dashed rounded-lg text-center cursor-pointer text-sm text-slate-600 hover:bg-slate-50">
                        <input {...getInputProps()} />
                        Add more files...
                    </div>

                    <div className="mt-8 bg-white p-6 rounded-lg border w-full max-w-lg mx-auto">
                        <h3 className="text-lg font-bold text-center mb-4 flex items-center justify-center gap-2">
                            <Settings size={20}/>Compression Options
                        </h3>
                        
                        <div className="flex justify-center mb-4 border border-slate-200 rounded-lg p-1">
                            <button 
                                onClick={() => setCompressionMode('quality')} 
                                className={`w-1/2 p-2 rounded-md flex items-center justify-center gap-2 ${compressionMode === 'quality' ? 'bg-slate-700 text-white' : ''}`}
                            >
                                <SlidersHorizontal size={16}/> By Quality
                            </button>
                            <button 
                                onClick={() => setCompressionMode('size')} 
                                className={`w-1/2 p-2 rounded-md flex items-center justify-center gap-2 ${compressionMode === 'size' ? 'bg-slate-700 text-white' : ''}`}
                            >
                                <Target size={16}/> By Target Size
                            </button>
                        </div>

                        {compressionMode === 'quality' ? (
                            <div>
                                <label htmlFor="quality-slider" className="font-medium block mb-2">
                                    Quality Level: {qualityValue}%
                                </label>
                                <input 
                                    id="quality-slider" 
                                    type="range" 
                                    min="1" 
                                    max="100" 
                                    value={qualityValue} 
                                    onChange={(e) => setQualityValue(parseInt(e.target.value))} 
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Smaller File</span>
                                    <span>Better Quality</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="target-size" className="font-medium block mb-2">
                                    Target Size (approx.)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        id="target-size" 
                                        type="number" 
                                        value={targetSize} 
                                        onChange={e => setTargetSize(e.target.value)} 
                                        className="border rounded-md p-2 w-full"
                                        min="1"
                                    />
                                    <select 
                                        value={sizeUnit} 
                                        onChange={e => setSizeUnit(e.target.value)} 
                                        className="border rounded-md p-2"
                                    >
                                        <option>KB</option>
                                        <option>MB</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-8">
                        <button 
                            onClick={handleCompress} 
                            className="bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800 disabled:bg-slate-400"
                            disabled={files.length === 0}
                        >
                            Compress {files.length} PDF(s)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CompressPage;
