import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, File as FileIcon, LoaderCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const MergePage = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // --- YEH NAYA FUNCTION HAI THUMBNAIL BANANE KE LIYE ---
    const generateThumbnail = async (file) => {
        // Ensure pdfjsLib is loaded
        if (!window.pdfjsLib) {
            console.error("pdf.js library is not loaded.");
            return null;
        }

        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        return new Promise((resolve, reject) => {
            fileReader.onload = async () => {
                try {
                    const typedarray = new Uint8Array(fileReader.result);
                    const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.5 }); // Chhota scale
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    resolve(canvas.toDataURL());
                } catch (err) {
                    console.error('Error generating thumbnail:', err);
                    resolve(null); // Agar error aaye to null bhejein
                }
            };
            fileReader.onerror = (error) => {
                console.error('File reading error:', error);
                reject(error);
            };
        });
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === "application/pdf");
        if (pdfFiles.length !== acceptedFiles.length) {
            setError("Only PDF files are accepted. Please try again.");
            return;
        }
        
        setError('');
        setIsLoading(true); // Start loading when thumbnail generation begins

        // Har file ke liye thumbnail generate karein
        const filesWithPreviews = await Promise.all(
            pdfFiles.map(async (file) => {
                const thumbnail = await generateThumbnail(file);
                return Object.assign(file, {
                    id: `file-${Date.now()}-${Math.random()}`,
                    preview: thumbnail,
                });
            })
        );
        setFiles(prevFiles => [...prevFiles, ...filesWithPreviews]);
        setIsLoading(false); // Stop loading after thumbnails are generated
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });
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
        setIsLoading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        try {
            const response = await fetch(`${apiUrl}/api/v1/merge`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            navigate('/download', { state: { downloadUrl: url, fileName: 'merged_by_PDFkaro.in.pdf', sourceTool: 'merge' } });
        } catch (e) {
            setError(`Failed to merge PDFs. Error: ${e.message}`);
            setIsLoading(false);
        }
    };

    if (isLoading && files.length === 0) { // Initial loading for thumbnail generation
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">Processing files...</h2>
                <p className="mt-2 text-slate-600">Generating previews, please wait.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Merge PDF Files</h1>
                <p className="text-slate-600 mt-2">Combine and reorder PDFs with visual previews.</p>
            </div>

            {files.length === 0 && (
                 <div {...getRootProps()} className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 border-slate-300 hover:border-slate-400">
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <UploadCloud size={48} className="mb-4 text-slate-400" />
                        <p className="text-lg font-semibold">Drag & drop files here, or click to select files</p>
                    </div>
                </div>
            )}
           
            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

            {files.length > 0 && (
                <div className="mt-8">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="files" direction="horizontal">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="flex gap-4 p-4 overflow-x-auto bg-slate-100 rounded-lg min-h-[16rem] items-center">
                                    {files.map((file, index) => (
                                        <Draggable key={file.id} draggableId={file.id} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="relative flex-shrink-0 w-40 h-56 bg-white rounded-lg shadow-md border border-slate-200 group transition-transform hover:scale-105">
                                                    {file.preview ? (
                                                        <img src={file.preview} alt={file.name} className="w-full h-full object-contain rounded-t-lg p-2" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                          <FileIcon className="w-16 h-16 text-slate-300" />
                                                        </div>
                                                    )}
                                                    <p className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center text-white bg-black bg-opacity-60 rounded-b-lg truncate">{file.name}</p>
                                                    <button onClick={() => removeFile(file.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    <div {...getRootProps()} className="flex-shrink-0 w-40 h-56 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 hover:border-slate-400">
                                        <input {...getInputProps()} />
                                        <UploadCloud size={32} />
                                        <span className="mt-2 text-sm text-center">Add more files</span>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <div className="mt-8 flex justify-center">
                        <button onClick={handleMerge} disabled={isLoading} className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800 transition-transform disabled:bg-slate-400">
                            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Merge PDFs'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MergePage;

