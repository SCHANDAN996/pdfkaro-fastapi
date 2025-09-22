import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UploadCloud, LoaderCircle, Trash2, RotateCw } from 'lucide-react';

// एक नया और बेहतर सॉर्टेबल पेज कंपोनेंट
const SortablePage = ({ page, index, onRemove, onRotate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // स्मूथ मोबाइल ड्रैगिंग के लिए
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-40 flex-shrink-0 flex flex-col items-center">
      <div className="relative w-full aspect-[2/3] bg-white rounded-lg shadow-md border group cursor-grab active:cursor-grabbing">
        <img
          src={page.thumbnail}
          alt={`${page.sourceFileName} - Page ${page.pageIndex + 1}`}
          className="w-full h-full object-contain rounded-lg transition-transform duration-300"
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />
        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onRotate(page.id)} className="p-1.5 bg-slate-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500" title="Rotate 90°"><RotateCw size={14} /></button>
          <button onClick={() => onRemove(page.id)} className="p-1.5 bg-red-500 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-red-400" title="Remove"><Trash2 size={14} /></button>
        </div>
        <span className="absolute bottom-1 left-1 px-2 py-0.5 text-xs bg-slate-800 text-white rounded">{index + 1}</span>
      </div>
      <p className="text-xs text-center truncate mt-1 px-1 w-full">{page.sourceFileName} (p.{page.pageIndex + 1})</p>
    </div>
  );
};


const MergePage = () => {
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length === 0) return;

        setProcessingMessage('Extracting pages...');
        setIsLoading(true);

        try {
            let newPages = [];
            for (const file of pdfFiles) {
                const pdfjsLib = await window.pdfjsLib;
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const context = canvas.getContext('2d');
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    newPages.push({
                        id: `${file.name}_page_${i}_${Date.now()}_${Math.random()}`,
                        sourceFile: file,
                        sourceFileName: file.name,
                        pageIndex: i - 1,
                        thumbnail: canvas.toDataURL(),
                        rotation: 0
                    });
                }
            }
            setPages(p => [...p, ...newPages]);
        } catch (error) {
            console.error("Failed to extract pages:", error);
            alert("Could not process one or more PDF files. Please ensure they are valid PDFs.");
        } finally {
            setIsLoading(false);
            setProcessingMessage('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleRemovePage = (id) => setPages(pages.filter(p => p.id !== id));
    const handleRotatePage = (id) => setPages(pages.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));

    const handleMerge = async () => {
        if (pages.length === 0) {
            alert('Please add some PDF pages to merge.');
            return;
        }
        setProcessingMessage('Merging your pages...');
        setIsLoading(true);

        const formData = new FormData();
        const filesToUpload = new Map();
        pages.forEach(page => {
            if (!filesToUpload.has(page.sourceFileName)) {
                filesToUpload.set(page.sourceFileName, page.sourceFile);
            }
        });
        filesToUpload.forEach(file => formData.append('files', file));
        
        const pageInstructions = pages.map(page => ({
            sourceFile: page.sourceFileName,
            pageIndex: page.pageIndex,
            rotation: page.rotation
        }));

        formData.append('pages_data', JSON.stringify(pageInstructions));
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/v1/merge`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Merge failed on the server.');
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            navigate('/merge-complete', { 
                state: { 
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
                <p className="text-slate-600 mt-2">Combine and reorder pages from multiple PDFs into one single document.</p>
            </div>

            {pages.length === 0 ? (
                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary bg-slate-50' : 'border-slate-400'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="font-semibold">Drag & drop PDF files here</p>
                </div>
            ) : (
                <>
                    <h3 className="text-xl font-bold text-center mt-8 mb-4">Arrange Your Pages ({pages.length})</h3>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                            <div className="flex flex-wrap gap-4 p-4 bg-slate-100 rounded-lg min-h-[220px] justify-center">
                                {pages.map((page, index) => (
                                    <SortablePage key={page.id} page={page} index={index} onRemove={handleRemovePage} onRotate={handleRotatePage} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    
                    <div {...getRootProps()} className="mt-4 p-3 border-2 border-dashed rounded-lg text-center cursor-pointer text-sm text-slate-600 hover:bg-slate-50 hover:border-primary">
                        <input {...getInputProps()} />
                        Add more files...
                    </div>

                    <div className="text-center mt-8">
                        <button onClick={handleMerge} className="bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800">
                            Merge {pages.length} Pages
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MergePage;
