import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft, LoaderCircle } from 'lucide-react';

// Helper function to wait for pdf.js to be ready
const ensurePdfJsLib = () => {
    return new Promise((resolve) => {
        const check = () => {
            if (window.pdfjsLib) resolve(window.pdfjsLib);
            else setTimeout(check, 100);
        };
        check();
    });
};

const base64ToBlob = (base64, type) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
};

const DownloadPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { sourceTool, downloadUrl, zipUrl, originalFile, fileName } = location.state || {};
    
    const [pagePreviews, setPagePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(sourceTool === 'split');

    const generateThumbnails = useCallback(async () => {
        if (!originalFile) return;
        const pdfjsLib = await ensurePdfJsLib();
        const blob = base64ToBlob(originalFile.data, 'application/pdf');
        const arrayBuffer = await blob.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);

        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const thumbnails = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const context = canvas.getContext('2d');
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            thumbnails.push({ id: `page-${i}`, pageIndex: i - 1, thumbnail: canvas.toDataURL() });
        }
        setPagePreviews(thumbnails);
        setIsLoading(false);
    }, [originalFile]);

    useEffect(() => {
        if (sourceTool === 'split') {
            generateThumbnails();
        }
    }, [sourceTool, generateThumbnails]);

    // ... (rest of component remains the same)
    useEffect(() => {
        if (!downloadUrl && !zipUrl) navigate('/');
        return () => {
            if(downloadUrl) URL.revokeObjectURL(downloadUrl);
            if(zipUrl) URL.revokeObjectURL(zipUrl);
        }
    }, [downloadUrl, zipUrl, navigate]);
    
    const handleSinglePageDownload = async (pageIndex) => {
        const blob = base64ToBlob(originalFile.data, 'application/pdf');
        const formData = new FormData();
        formData.append('file', blob, originalFile.name);
        formData.append('page_number', pageIndex);
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        const response = await fetch(`${apiUrl}/api/v1/extract-single-page`, { method: 'POST', body: formData });
        if(response.ok) {
            const newBlob = await response.blob();
            const url = URL.createObjectURL(newBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `page_${pageIndex+1}_by_PDFkaro.in.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    if (isLoading) {
         return <div className="text-center h-96 flex flex-col justify-center items-center"><LoaderCircle className="animate-spin" size={48} /><p className="mt-4">Generating page previews...</p></div>
    }

    if (sourceTool === 'merge') {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 text-center">
                 <h1 className="text-3xl sm:text-4xl font-bold">Your PDFs have been merged!</h1>
                 <p className="mt-2 mb-8 text-slate-600">Your file is ready to download.</p>
                 <a href={downloadUrl} download={fileName} className="inline-flex items-center justify-center bg-slate-700 text-white font-bold py-4 px-16 rounded-lg hover:bg-slate-800">
                    <Download className="mr-3" /> Download Merged PDF
                </a>
                 <div className="mt-12">
                     <Link to="/merge" className="inline-flex items-center font-semibold"><ArrowLeft className="mr-2" size={20} />Back to Merge</Link>
                </div>
            </div>
        );
    }

    if (sourceTool === 'split') {
        return (
            <div className="w-full max-w-6xl mx-auto p-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold">Your PDF has been split!</h1>
                    <p className="mt-2 text-slate-600">Download all pages in a ZIP file, or download individual pages below.</p>
                    <a href={zipUrl} download="split_pages_by_PDFkaro.in.zip" className="mt-4 inline-flex items-center justify-center bg-slate-700 text-white font-bold py-3 px-10 rounded-lg hover:bg-slate-800">
                        <Download className="mr-3" /> Download All Pages (ZIP)
                    </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-slate-100 rounded-lg">
                    {pagePreviews.map(page => (
                        <div key={page.id} className="relative w-full aspect-[2/3] bg-white rounded-lg shadow-md border group">
                            <img src={page.thumbnail} alt={`Page ${page.pageIndex + 1}`} className="w-full h-full object-contain rounded-lg"/>
                             <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center rounded-lg">
                                <button onClick={() => handleSinglePageDownload(page.pageIndex)} className="p-2 bg-white rounded-full text-slate-700 opacity-0 group-hover:opacity-100" title="Download this page">
                                    <Download size={20} />
                                </button>
                            </div>
                            <span className="absolute bottom-1 right-1 px-2 py-0.5 text-xs bg-slate-800 text-white rounded">{page.pageIndex + 1}</span>
                        </div>
                    ))}
                </div>
                 <div className="mt-12 text-center">
                     <Link to="/split" className="inline-flex items-center font-semibold"><ArrowLeft className="mr-2" size={20} />Back to Split</Link>
                </div>
            </div>
        )
    }

    return <div>Something went wrong. <Link to="/">Go Home</Link></div>;
};

export default DownloadPage;


