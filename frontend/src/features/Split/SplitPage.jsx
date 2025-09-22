import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, LoaderCircle, CheckSquare, Square, RotateCw } from 'lucide-react';

const SplitPage = () => {
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]);
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFile = acceptedFiles[0];
        if (!pdfFile) return;

        setIsProcessing(true);
        setFile(pdfFile);
        setPages([]);
        setSelectedPages(new Set());
        
        const pdfjsLib = await window.pdfjsLib;
        const reader = new FileReader();

        reader.onload = async (e) => {
            const typedarray = new Uint8Array(e.target.result);
            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const pageThumbnails = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const context = canvas.getContext('2d');
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    pageThumbnails.push({ pageNum: i, thumbnail: canvas.toDataURL(), rotation: 0 });
                }
                setPages(pageThumbnails);
            } catch (error) {
                alert("Could not process the PDF. It might be corrupted or protected.");
                setFile(null);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsArrayBuffer(pdfFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

    const togglePageSelection = (pageNum) => {
        setSelectedPages(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(pageNum)) newSelection.delete(pageNum);
            else newSelection.add(pageNum);
            return newSelection;
        });
    };

    const handleRotatePage = (pageNum) => {
        setPages(pages.map(p => p.pageNum === pageNum ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };

    const handleSplit = async () => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        
        let pagesToExtractInstructions = [];
        if (selectedPages.size > 0) {
            const sortedSelectedPages = Array.from(selectedPages).sort((a, b) => a - b);
            pagesToExtractInstructions = sortedSelectedPages.map(pageNum => {
                const pageData = pages.find(p => p.pageNum === pageNum);
                return { pageIndex: pageData.pageNum - 1, rotation: pageData.rotation };
            });
        }
        
        formData.append('pages_to_extract', JSON.stringify(pagesToExtractInstructions));
        
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/v1/split`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Split failed on the server.');
            
            const newPdfBlob = await response.blob();
            const downloadUrl = URL.createObjectURL(newPdfBlob);
            
            const reader = new FileReader();
            reader.readAsDataURL(newPdfBlob);
            reader.onloadend = () => {
                const base64File = reader.result;
                navigate('/split-complete', { 
                    state: { 
                        downloadUrl: downloadUrl,
                        processedFile: { data: base64File, name: selectedPages.size > 0 ? "extracted_pages.pdf" : "split_pages.zip" }
                    } 
                });
            };
        } catch (error) {
            alert('An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Split & Extract PDF Pages</h1>
                <p className="text-slate-600 mt-2">Select and rotate the pages you want to extract from your PDF file.</p>
            </div>
            {isProcessing && pages.length === 0 ? (
                <div className="text-center h-96 flex flex-col justify-center items-center">
                    <LoaderCircle className="animate-spin text-slate-700" size={48} />
                    <p className="mt-4 text-slate-500">Processing your PDF...</p>
                </div>
            ) : !file ? (
                 <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary bg-slate-50' : 'border-slate-400'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="font-semibold">Drag & drop a PDF file here, or click to select</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-slate-100 rounded-lg">
                        {pages.map(({ pageNum, thumbnail, rotation }) => (
                            <div key={pageNum} className="relative group">
                                <div onClick={() => togglePageSelection(pageNum)} className="w-full aspect-[2/3] bg-white rounded-lg shadow-md border-2 cursor-pointer transition-all" style={{borderColor: selectedPages.has(pageNum) ? '#6A5ACD' : 'transparent'}}>
                                    <img src={thumbnail} alt={`Page ${pageNum}`} className="w-full h-full object-contain rounded-lg transition-transform duration-300" style={{ transform: `rotate(${rotation}deg)` }}/>
                                    <div className="absolute top-2 left-2">
                                        {selectedPages.has(pageNum) ? <CheckSquare className="text-white bg-slate-700 rounded" /> : <Square className="text-slate-400 bg-white/70 rounded"/>}
                                    </div>
                                    <span className="absolute bottom-1 right-1 px-2 py-0.5 text-xs bg-slate-800 text-white rounded">{pageNum}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleRotatePage(pageNum); }} className="absolute top-2 right-2 p-1.5 bg-slate-700/50 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" title="Rotate 90°"><RotateCw size={14}/></button>
                            </div>
                        ))}
                    </div>
                     <div className="text-center mt-8">
                        <button onClick={handleSplit} disabled={isProcessing} className="bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800 disabled:bg-slate-400">
                            {selectedPages.size > 0 ? `Extract ${selectedPages.size} Page(s)` : 'Split All Pages into ZIP'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SplitPage;
