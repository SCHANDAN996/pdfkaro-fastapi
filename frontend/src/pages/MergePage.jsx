import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, File as FileIcon, LoaderCircle, RotateCw } from 'lucide-react'; // RotateCw ko yahan import kiya gaya hai
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function to wait for pdf.js to be ready
const ensurePdfJsLib = () => {
    return new Promise((resolve) => {
        const check = () => {
            if (window.pdfjsLib) {
                resolve(window.pdfjsLib);
            } else {
                setTimeout(check, 100); // Har 100ms me check karein
            }
        };
        check();
    });
};

const MergePage = () => {
    const [pages, setPages] = useState([]);
    const [files, setFiles] = useState({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    const generatePageThumbnails = useCallback(async (file) => {
        const pdfjsLib = await ensurePdfJsLib();
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
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
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        pageThumbnails.push({
                            id: `page-${file.name}-${i}-${Date.now()}`,
                            sourceFile: file.name,
                            pageIndex: i - 1,
                            thumbnail: canvas.toDataURL(),
                            rotation: 0,
                        });
                    }
                    resolve(pageThumbnails);
                } catch (err) { resolve([]); }
            };
        });
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        setLoadingMessage('Generating page previews...');
        setIsLoading(true);
        const newFiles = { ...files };
        const newPagesPromises = acceptedFiles.map(file => {
            newFiles[file.name] = file;
            return generatePageThumbnails(file);
        });
        const allNewPagesNested = await Promise.all(newPagesPromises);
        const allNewPages = allNewPagesNested.flat();
        setFiles(newFiles);
        setPages(p => [...p, ...allNewPages]);
        setIsLoading(false);
        setLoadingMessage('');
    }, [files, generatePageThumbnails]);
    
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });

    const handleRotate = (pageId) => {
        setPages(pages.map(p => p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };
    
    const handleRemovePage = (pageId) => {
        setPages(pages.filter(p => p.id !== pageId));
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(pages);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setPages(items);
    };

    const handleMerge = async () => {
        setLoadingMessage('Merging your pages...');
        setIsLoading(true);
        const formData = new FormData();
        const pagesData = pages.map(({ sourceFile, pageIndex, rotation }) => ({ sourceFile, pageIndex, rotation }));
        formData.append('pages_data', JSON.stringify(pagesData));
        const uniqueFiles = new Set(pages.map(p => p.sourceFile));
        uniqueFiles.forEach(fileName => formData.append('files', files[fileName]));
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        try {
            const response = await fetch(`${apiUrl}/api/v1/merge`, { method: 'POST', body: formData });
            if (!response.ok) {
                 const err = await response.json();
                 throw new Error(err.detail || 'Server error');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            navigate('/download', { state: { downloadUrl: url, fileName: 'merged_by_PDFkaro.in.pdf', sourceTool: 'merge' } });
        } catch (e) {
            setError(`Failed to merge PDFs. Error: ${e.message}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">{loadingMessage}</h2>
                <p className="mt-2 text-slate-600">Please wait, this might take a moment.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-6xl mx-auto p-4">
             <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Merge PDF Files</h1>
                <p className="text-slate-600 mt-2">Combine and reorder pages from multiple PDFs.</p>
            </div>
             {pages.length === 0 && (
                 <div {...getRootProps()} className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors border-slate-300 hover:border-slate-400">
                    <input {...getInputProps()} />
                    <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-semibold">Drag & drop PDF files here, or click to select</p>
                </div>
            )}
            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
            {pages.length > 0 && (
                <div>
                     <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="pages">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-slate-100 rounded-lg">
                                    {pages.map((page, index) => (
                                        <Draggable key={page.id} draggableId={page.id} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="relative w-full aspect-[2/3] bg-white rounded-lg shadow-md border group">
                                                    <img src={page.thumbnail} alt={`Page ${page.pageIndex + 1}`} className="w-full h-full object-contain rounded-lg transition-transform" style={{ transform: `rotate(${page.rotation}deg)` }} />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center rounded-lg gap-2">
                                                        <button onClick={() => handleRotate(page.id)} className="p-2 bg-white rounded-full text-slate-700 hover:bg-slate-200 opacity-0 group-hover:opacity-100" title="Rotate Page">
                                                            <RotateCw size={18} />
                                                        </button>
                                                        <button onClick={() => handleRemovePage(page.id)} className="p-2 bg-white rounded-full text-slate-700 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100" title="Remove Page">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                    <span className="absolute bottom-1 right-1 px-2 py-0.5 text-xs bg-slate-800 text-white rounded">{index + 1}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <div {...getRootProps()} className="w-full sm:w-auto">
                           <button className="w-full sm:w-auto border-2 border-slate-700 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-100">Add More Files</button>
                           <input {...getInputProps()} className="hidden"/>
                        </div>
                        <button onClick={handleMerge} className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800">Merge PDFs</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MergePage;


