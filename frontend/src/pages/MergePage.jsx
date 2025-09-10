import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, File as FileIcon, GripVertical, LoaderCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const MergePage = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onDrop = useCallback(acceptedFiles => {
        const pdfFiles = acceptedFiles.filter(file => file.type === "application/pdf");
        if (pdfFiles.length !== acceptedFiles.length) {
            setError("Only PDF files are accepted. Please try again.");
        } else {
            setError('');
            const newFiles = pdfFiles.map(file => Object.assign(file, { id: `file-${Date.now()}-${Math.random()}` }));
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });
    const removeFile = (fileId) => setFiles(files.filter(file => file.id !== fileId));

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(files);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFiles(items);
    }

    const handleMerge = async () => {
        if (files.length < 1) {
            setError("Please select at least one PDF file.");
            return;
        }
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/v1/merge`, { method: 'POST', body: formData });
            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // --- YEH SABSE ZAROORI BADLAV HAI ---
            // Ab hum download karne ke bajaye, user ko naye page par bhej rahe hain
            navigate('/download', { state: { downloadUrl: url, fileName: 'merged_by_PDFkaro.in.pdf' } });

        } catch (e) {
            console.error("Merge request failed:", e);
            setError(`Failed to merge PDFs. Please try again. Error: ${e.message}`);
            setIsLoading(false);
        }
    };

    // --- PROCESSING SCREEN ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">Merging your PDFs...</h2>
                <p className="mt-2 text-slate-600">Please wait, this might take a moment.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Merge PDF Files</h1>
                <p className="text-slate-600 mt-2">Combine and reorder PDFs into one single document.</p>
            </div>

            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-slate-500 bg-slate-100' : 'border-slate-300 hover:border-slate-400'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-slate-500">
                    <UploadCloud size={48} className="mb-4 text-slate-400" />
                    <p className="text-lg font-semibold">Drag & drop files here, or click to select files</p>
                    <p className="text-sm mt-1">Only PDF files are accepted</p>
                </div>
            </div>

            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

            {files.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Arrange your files:</h2>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="files">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {files.map((file, index) => (
                                        <Draggable key={file.id} draggableId={file.id} index={index}>
                                            {(provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                                                    <div className="flex items-center space-x-3">
                                                        <GripVertical className="text-slate-400 cursor-grab" />
                                                        <FileIcon className="text-slate-500" />
                                                        <span className="text-slate-800 font-medium">{file.name}</span>
                                                    </div>
                                                    <button onClick={() => removeFile(file.id)} className="text-slate-400 hover:text-red-500 transition-colors"> <X size={20} /> </button>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <div className="mt-8 flex justify-center">
                        <button onClick={handleMerge} className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800 transition-transform duration-200 ease-in-out hover:scale-105">
                            Merge PDFs
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MergePage;

