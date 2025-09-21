import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File as FileIcon, LoaderCircle, Trash2, RotateCw, GripVertical } from 'lucide-react';

const MergePage = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles) => {
        const pdfFiles = acceptedFiles
            .filter(file => file.type === 'application/pdf')
            .map(file => ({
                id: `${file.name}-${file.lastModified}-${file.size}`,
                file,
                rotation: 0
            }));
        setFiles(f => [...f, ...pdfFiles]);
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
        setFiles(files.map(f => {
            if (f.id === id) {
                return { ...f, rotation: (f.rotation + 90) % 360 };
            }
            return f;
        }));
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            alert('Please select at least two PDF files to merge.');
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        const pagesData = [];

        files.forEach(item => {
            formData.append('files', item.file);
            // This is a placeholder for page selection logic if we add it later
            // For now, we assume all pages of each file are included.
            // A more complex implementation would read pages and let user select.
            // The backend needs a way to know which pages from which file.
            // For now, we will send file name and rotation for all pages.
            // This part is simplified for merging entire documents.
            pagesData.push({
                sourceFile: item.file.name,
                pageIndex: -1, // Placeholder for "all pages"
                rotation: item.rotation
            });
        });
        
        // This logic will need to be changed if per-page selection is added
        // The backend would need to know total pages per file
        // For now, we simplify this to just pass file name and rotation
        const simplePagesData = files.map(item => ({
            sourceFile: item.file.name,
            pageIndex: -1, 
            rotation: item.rotation
        }));
        
        // Final logic for merging full files with rotation
        const finalPagesData = [];
        const pdfjsLib = await window.pdfjsLib;

        for (const item of files) {
            const arrayBuffer = await item.file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
            for (let i = 0; i < pdf.numPages; i++) {
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
            const response = await fetch(`${apiUrl}/api/v1/merge`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                navigate('/merge-complete', { 
                    state: { 
                        sourceTool: 'merge',
                        downloadUrl: url,
                        fileName: 'merged_by_PDFkaro.in.pdf'
                    } 
                });
            } else {
                alert('Merge failed. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">Merging your PDFs...</h2>
                <p className="text-slate-500">Please wait, this may take a moment.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Merge PDF Files</h1>
                <p className="text-slate-600 mt-2">Combine multiple PDFs into one single document. Reorder and rotate files as needed.</p>
            </div>

            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-slate-700 bg-slate-100' : 'border-slate-400'}`}>
                <input {...getInputProps()} />
                <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="font-semibold">Drag & drop PDF files here, or click to select</p>
            </div>

            {files.length > 0 && (
                <>
                    <h3 className="text-xl font-bold text-center mt-8 mb-4">Your Files ({files.length})</h3>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="files">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="bg-slate-100 p-4 rounded-lg">
                                    {files.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center bg-white p-3 mb-2 rounded-md shadow-sm">
                                                    <GripVertical className="text-slate-400 mr-3" />
                                                    <FileIcon className="text-red-500 mr-3" />
                                                    <span className="flex-grow text-slate-700">{item.file.name}</span>
                                                    <span className="text-sm text-slate-500 mr-3">{item.rotation}°</span>
                                                    <button onClick={() => handleRotateFile(item.id)} className="p-2 hover:bg-slate-100 rounded-full" title="Rotate 90°"><RotateCw size={18} /></button>
                                                    <button onClick={() => handleRemoveFile(item.id)} className="p-2 hover:bg-slate-100 rounded-full text-red-500" title="Remove"><Trash2 size={18} /></button>
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
                            Merge PDFs
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MergePage;
