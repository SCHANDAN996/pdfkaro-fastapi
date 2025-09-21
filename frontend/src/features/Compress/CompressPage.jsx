import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, LoaderCircle, Trash2, File as FileIcon, Zap, Shield, ArrowDown } from 'lucide-react';

const CompressPage = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [compressionLevel, setCompressionLevel] = useState('recommended');
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles) => {
        const pdfFiles = acceptedFiles
            .filter(file => file.type === 'application/pdf')
            .map(file => ({
                id: `${file.name}-${file.lastModified}-${file.size}`,
                file,
            }));
        setFiles(f => [...f, ...pdfFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
    });
    
    const handleRemoveFile = (id) => setFiles(files.filter(f => f.id !== id));

    const handleCompress = async () => {
        if (files.length === 0) return;
        setIsLoading(true);

        const formData = new FormData();
        files.forEach(item => formData.append('files', item.file));
        formData.append('level', compressionLevel);

        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/v1/compress`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Compression failed.');
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            navigate('/compress-complete', { state: { downloadUrl: url } });
        } catch (error) {
            alert('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">Compressing your PDFs...</h2>
                <p className="text-slate-500">This might take a moment for large files.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Compress PDF File</h1>
                <p className="text-slate-600 mt-2">Reduce the file size of your PDFs online for free while maintaining the best possible quality.</p>
            </div>

            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-slate-700 bg-slate-100' : 'border-slate-400'}`}>
                <input {...getInputProps()} />
                <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="font-semibold">Drag & drop PDF files here</p>
                <p className="text-sm text-slate-500 mt-1">(Or click to select files)</p>
            </div>

            {files.length > 0 && (
                <>
                    <div className="mt-8">
                        {files.map(item => (
                            <div key={item.id} className="flex items-center bg-white p-3 mb-2 rounded-md shadow-sm">
                                <FileIcon className="text-red-500 mr-3 flex-shrink-0" />
                                <span className="flex-grow text-slate-700 truncate">{item.file.name}</span>
                                <button onClick={() => handleRemoveFile(item.id)} className="p-2 hover:bg-slate-100 rounded-full text-red-500" title="Remove"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-white p-6 rounded-lg border">
                        <h3 className="text-lg font-bold text-center mb-4">Compression Level</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div onClick={() => setCompressionLevel('high')} className={`p-4 border rounded-lg cursor-pointer text-center ${compressionLevel === 'high' ? 'border-primary ring-2 ring-primary' : ''}`}>
                                <Zap className="mx-auto mb-2 text-red-500"/>
                                <h4 className="font-semibold">High Compression</h4>
                                <p className="text-xs text-slate-500">Smaller Size, Good Quality</p>
                            </div>
                            <div onClick={() => setCompressionLevel('recommended')} className={`p-4 border rounded-lg cursor-pointer text-center ${compressionLevel === 'recommended' ? 'border-primary ring-2 ring-primary' : ''}`}>
                                <Shield className="mx-auto mb-2 text-green-500"/>
                                <h4 className="font-semibold">Recommended</h4>
                                <p className="text-xs text-slate-500">Good Size, Best Quality</p>
                            </div>
                            <div onClick={() => setCompressionLevel('low')} className={`p-4 border rounded-lg cursor-pointer text-center ${compressionLevel === 'low' ? 'border-primary ring-2 ring-primary' : ''}`}>
                                <ArrowDown className="mx-auto mb-2 text-blue-500"/>
                                <h4 className="font-semibold">Low Compression</h4>
                                <p className="text-xs text-slate-500">Bigger Size, Highest Quality</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center mt-8">
                        <button onClick={handleCompress} className="bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800">
                            Compress {files.length} PDF(s)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CompressPage;
