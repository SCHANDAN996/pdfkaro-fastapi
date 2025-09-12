import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, LoaderCircle, Scissors, FileDown } from 'lucide-react';

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
        if (!window.pdfjsLib) return [];
        setLoadingMessage('Generating page previews...');
        setIsLoading(true);
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(pdfFile);
        return new Promise((resolve) => {
            fileReader.onload = async () => {
                try {
                    const typedarray = new Uint8Array(fileReader.result);
                    const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
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

    const handlePageSelect = (pageIndex, event) => {
        const newSelectedPages = new Set(selectedPages);
        // Shift-click logic for range selection
        if (event.shiftKey && lastSelected !== null) {
            const start = Math.min(lastSelected, pageIndex);
            const end = Math.max(lastSelected, pageIndex);
            for (let i = start; i <= end; i++) {
                newSelectedPages.add(i);
            }
        } else {
            if (newSelectedPages.has(pageIndex)) {
                newSelectedPages.delete(pageIndex);
            } else {
                newSelectedPages.add(pageIndex);
            }
        }
        setSelectedPages(newSelectedPages);
        setLastSelected(pageIndex);
    };

    const handleAction = async (actionType) => {
        if (!file) return;
        setLoadingMessage(actionType === 'extract' ? 'Extracting selected pages...' : 'Splitting all pages...');
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        // Agar 'extract' hai to chune hue pages ki list bhejein
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
            const fileName = actionType === 'extract' 
                ? 'extracted_pages_by_PDFkaro.in.pdf' 
                : 'split_files_by_PDFkaro.in.zip';

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
                <h2 className="mt-6 text-2xl font-bold text-slate-800">{loadingMessage}</h2>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Extract PDF Pages</h1>
                <p className="text-slate-600 mt-2 max-w-2xl mx-auto">Select and extract specific pages from your PDF. Or split all pages into separate files.</p>
            </div>
            
            {!file && (
                <div {...getRootProps()} className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors border-slate-300 hover:border-slate-400">
                    <input {...getInputProps()} />
                    <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-semibold">Drag & drop a PDF file here, or click to select</p>
                </div>
            )}
            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
            
            {file && (
                <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-slate-100 rounded-lg">
                        {pages.map((page) => (
                            <div key={page.id} onClick={(e) => handlePageSelect(page.pageIndex, e)} className="relative w-full aspect-[2/3] bg-white rounded-lg shadow-md border-2 cursor-pointer transition-all" style={{borderColor: selectedPages.has(page.pageIndex) ? '#6A5ACD' : 'transparent'}}>
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
                    <p className="text-center text-sm text-slate-500 mt-2">Tip: Hold 'Shift' and click to select a range of pages.</p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => handleAction('extract')} disabled={selectedPages.size === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400">
                            <Scissors size={20}/> Extract {selectedPages.size > 0 ? `${selectedPages.size} Page(s)`: 'Pages'}
                        </button>
                         <button onClick={() => handleAction('split-all')} className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-slate-700 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-100 transition-colors">
                            <FileDown size={20} /> Split All Pages
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitPage;


