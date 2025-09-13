import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, LoaderCircle, Scissors, FileDown } from 'lucide-react';

// Helper function to wait for pdf.js to be ready
const ensurePdfJsLib = () => {
    return new Promise((resolve) => {
        const check = () => {
            if (window.pdfjsLib) {
                resolve(window.pdfjsLib);
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
};

const SplitPage = () => {
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]);
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [lastSelected, setLastSelected] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    const generatePageThumbnails = useCallback(async (pdfFile) => {
        const pdfjsLib = await ensurePdfJsLib();
        setLoadingMessage('Generating page previews...');
        setIsLoading(true);
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(pdfFile);
        return new Promise((resolve) => {
            fileReader.onload = async () => {
                try {
                    const typedarray = new Uint8Array(fileReader.result);
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
                        pageThumbnails.push({ id: `page-${i}`, pageIndex: i - 1, thumbnail: canvas.toDataURL() });
                    }
                    resolve(pageThumbnails);
                } catch (err) { resolve([]); }
            };
        });
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFile = acceptedFiles[0];
        if (pdfFile && pdfFile.type === "application/pdf") {
            setFile(pdfFile);
            setPages([]);
            setSelectedPages(new Set());
            const thumbnails = await generatePageThumbnails(pdfFile);
            setPages(thumbnails);
            setIsLoading(false);
        } else {
            setError("Please upload a single PDF file.");
        }
    }, [generatePageThumbnails]);

    // ... (rest of the component remains the same)
    const handlePageSelect = (pageIndex, event) => {
        const newSelectedPages = new Set(selectedPages);
        if (event.shiftKey && lastSelected !== null) {
            const start = Math.min(lastSelected, pageIndex);
            const end = Math.max(lastSelected, pageIndex);
            for (let i = start; i <= end; i++) newSelectedPages.add(i);
        } else {
            if (newSelectedPages.has(pageIndex)) newSelectedPages.delete(pageIndex);
            else newSelectedPages.add(pageIndex);
        }
        setSelectedPages(newSelectedPages);
        setLastSelected(pageIndex);
    };

    const handleAction = async (actionType) => {
        if (!file) return;
        setLoadingMessage(actionType === 'extract' ? 'Extracting pages...' : 'Splitting all pages...');
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const pagesToExtract = actionType === 'extract' ? Array.from(selectedPages) : [];
        formData.append('pages_to_extract', JSON.stringify(pagesToExtract));
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        try {
            const response = await fetch(`${apiUrl}/api/v1/split`, { method: 'POST', body: formData });
            if (!response.ok) {
                 const err = await response.json();
                 throw new Error(err.detail || 'Server error');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const fileName = actionType === 'extract' ? 'extracted_by_PDFkaro.in.pdf' : 'split_by_PDFkaro.in.zip';
            navigate('/download', { state: { downloadUrl: url, fileName, sourceTool: 'split' } });
        } catch (e) {
            setError(`Failed to process PDF. Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold">{loadingMessage}</h2>
            </div>
        );
    }

    return (
         <div className="w-full max-w-6xl mx-auto p-4">
             {/* ... UI remains the same ... */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Extract PDF Pages</h1>
                <p className="text-slate-600 mt-2">Select and extract pages from your PDF.</p>
            </div>
            {!file && (
                <div {...getRootProps()} className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer">
                    <input {...getInputProps()} />
                    <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="font-semibold">Drag & drop a PDF file here</p>
                </div>
            )}
            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
            {file && (
                <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-slate-100 rounded-lg">
                        {pages.map((page) => (
                            <div key={page.id} onClick={(e) => handlePageSelect(page.pageIndex, e)} className={`relative w-full aspect-[2/3] bg-white rounded-lg shadow-md border-2 cursor-pointer transition-all ${selectedPages.has(page.pageIndex) ? 'border-slate-700' : 'border-transparent'}`}>
                                <img src={page.thumbnail} alt={`Page ${page.pageIndex + 1}`} className="w-full h-full object-contain rounded-lg" />
                                {selectedPages.has(page.pageIndex) && (
                                    <div className="absolute top-2 right-2 bg-slate-700 text-white rounded-full p-1">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                                <span className="absolute bottom-1 left-1 px-2 py-0.5 text-xs bg-slate-800 text-white rounded">{page.pageIndex + 1}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-2">Tip: Hold 'Shift' to select a range of pages.</p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => handleAction('extract')} disabled={selectedPages.size === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-800 disabled:bg-slate-400">
                            <Scissors size={20}/> Extract {selectedPages.size > 0 ? `${selectedPages.size} Page(s)`: 'Pages'}
                        </button>
                         <button onClick={() => handleAction('split-all')} className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-slate-700 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-100">
                            <FileDown size={20} /> Split All Pages
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitPage;


