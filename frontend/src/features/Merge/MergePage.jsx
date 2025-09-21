import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, LoaderCircle, Trash2, RotateCw, GripVertical } from 'lucide-react';

const MergePage = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length === 0) return;

        setProcessingMessage('Generating previews...');
        setIsLoading(true);

        try {
            const filesWithThumbnails = await Promise.all(
                pdfFiles.map(async (file) => {
                    const pdfjsLib = await window.pdfjsLib;
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
                    const page = await pdf.getPage(1); // Get the first page
                    const viewport = page.getViewport({ scale: 0.3 }); // Small scale for thumbnail
                    const canvas = document.createElement('canvas');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const context = canvas.getContext('2d');
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    return {
                        id: `${file.name}-${file.lastModified}-${file.size}`,
                        file,
                        rotation: 0,
                        thumbnail: canvas.toDataURL(), // Store the thumbnail
                        pageCount: pdf.numPages
                    };
                })
            );
            
            setFiles(f => [...f, ...filesWithThumbnails]);
        } catch (error) {
            console.error("Failed to generate thumbnails:", error);
            alert("Could not generate previews for one or more files. Please check the files and try again.");
        } finally {
            setIsLoading(false);
            setProcessingMessage('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
    });

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(files);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFiles(items);
    };

    const handleRemoveFile = (id) => {
        setFiles(files.filter(f => f.id !== id));
    };

    const handleRotateFile = (id) => {
        setFiles(files.map(f => f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f));
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            alert('Please select at least two PDF files to merge.');
            return;
        }
        setProcessingMessage('Merging your PDFs...');
        setIsLoading(true);

        const formData = new FormData();
        const finalPagesData = [];

        for (const item of files) {
            formData.append('files', item.file);
            for (let i = 0; i < item.pageCount; i++) {
                finalPagesData.push({
                    sourceFile: item.file.name,
                    pageIndex: i,
                    rotation: item.rotation
                });
            }
        }

        formData.append('pages_data', JSON.stringify(finalPagesData));
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/v1/merge`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Merge failed on the server.');
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            navigate('/merge-complete', { 
                state: { 
                    sourceTool: 'merge',
                    downloadUrl: url,
                    fileName: 'merged_by_PDFkaro.in.pdf'
                } 
            });
        } catch (error) {
            console.error("Merge error:", error);
            alert('An error occurred. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
            setProcessingMessage('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">{processingMessage}</h2>
                <p className="text-slate-500">Please wait, this may take a moment.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Merge PDF Files</h1>
                <p className="text-slate-600 mt-2">Combine multiple PDFs into one document. Drag to reorder files as needed.</p>
            </div>

            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-slate-700 bg-slate-100' : 'border-slate-400'}`}>
                <input {...getInputProps()} />
                <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="font-semibold">Drag & drop PDF files here</p>
                <p className="text-sm text-slate-500 mt-1">(Or click to select files)</p>
            </div>

            {files.length > 0 && (
                <>
                    <h3 className="text-xl font-bold text-center mt-8 mb-4">Arrange Your Files ({files.length})</h3>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="files" direction="horizontal">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="flex gap-4 p-4 bg-slate-100 rounded-lg overflow-x-auto min-h-[220px]">
                                    {files.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} className="flex-shrink-0 w-40">
                                                    <div className="relative w-full aspect-[2/3] bg-white rounded-lg shadow-md border group">
                                                        <img src={item.thumbnail} alt={item.file.name} className="w-full h-full object-contain rounded-lg"/>
                                                        <div {...provided.dragHandleProps} className="absolute top-1 left-1 p-1 cursor-grab active:cursor-grabbing"><GripVertical size={20} className="text-slate-500"/></div>
                                                        <button onClick={() => handleRemoveFile(item.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100" title="Remove"><Trash2 size={14} /></button>
                                                        <span className="absolute bottom-1 right-1 px-2 py-0.5 text-xs bg-slate-800 text-white rounded">{item.pageCount} Pages</span>
                                                    </div>
                                                    <p className="text-xs text-center truncate mt-2">{item.file.name}</p>
                                                    <div className="text-center mt-1">
                                                        <button onClick={() => handleRotateFile(item.id)} className="p-1 hover:bg-slate-200 rounded-full" title="Rotate 90°">
                                                            <RotateCw size={16} className="inline-block"/> <span className="text-xs">{item.rotation}°</span>
                                                        </button>
                                                    </div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <div className="text-center mt-8">
                        <button onClick={handleMerge} className="bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800">
                            Merge {files.length} PDFs
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MergePage;
