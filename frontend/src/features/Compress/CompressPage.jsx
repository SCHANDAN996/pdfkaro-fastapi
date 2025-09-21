import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, LoaderCircle, Trash2, Zap, Shield, ArrowDown, File as FileIcon } from 'lucide-react';

const CompressPage = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [compressionLevel, setCompressionLevel] = useState('recommended');
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFiles = acceptedFiles
            .filter(file => file.type === 'application/pdf')
            .map(async (file) => {
                const pdfjsLib = await window.pdfjsLib;
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 0.2 });
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                await page.render({ canvasContext: context, viewport: viewport }).promise;

                return {
                    id: `${file.name}-${file.lastModified}`,
                    file,
                    thumbnail: canvas.toDataURL(),
                };
            });
        
        const resolvedFiles = await Promise.all(pdfFiles);
        setFiles(f => [...f, ...resolvedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });
    
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

    if (isLoading) { /* ... Loading UI ... */ }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Compress PDF File</h1>
                <p className="text-slate-600 mt-2">Reduce file size while maintaining the best possible quality.</p>
            </div>

            {files.length === 0 ? (
                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-slate-700 bg-slate-100' : 'border-slate-400'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="font-semibold">Drag & drop PDF files here</p>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {files.map(item => (
                            <div key={item.id} className="relative aspect-[2/3] border rounded-lg shadow-sm p-1">
                                <img src={item.thumbnail} alt={item.file.name} className="w-full h-full object-contain rounded-md"/>
                                <button onClick={() => handleRemoveFile(item.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><Trash2 size={12} /></button>
                                <p className="text-xs text-center truncate absolute bottom-0 left-0 right-0 bg-white/70 p-1">{item.file.name}</p>
                            </div>
                        ))}
                    </div>
                     <div {...getRootProps()} className="mt-4 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer text-sm text-slate-500 hover:bg-slate-50">
                        <input {...getInputProps()} />
                        Add more files...
                    </div>
                </div>
            )}
            
            {files.length > 0 && (
                 <div className="mt-8">
                     {/* ... Compression Level UI ... */}
                     <div className="text-center mt-8">
                        <button onClick={handleCompress} className="bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800">
                            Compress {files.length} PDF(s)
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default CompressPage;
