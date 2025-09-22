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
import { UploadCloud, LoaderCircle, Trash2, RotateCw, Settings, SlidersHorizontal, Target, ArrowLeft, ArrowRight } from 'lucide-react';

// Sortable Page Component
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
    touchAction: 'none',
  };

  const handleButtonClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <div ref={setNodeRef} style={style} className="w-40 flex-shrink-0 flex flex-col items-center">
      <div 
        className="relative w-full aspect-[2/3] bg-white rounded-lg shadow-md border group cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <img
          src={page.thumbnail}
          alt={`${page.sourceFileName} - Page ${page.pageIndex + 1}`}
          className="w-full h-full object-contain rounded-lg transition-transform duration-300"
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />
        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => handleButtonClick(e, () => onRotate(page.id))} 
            className="p-1.5 bg-slate-700 text-white rounded-full focus:outline-none" 
            title="Rotate 90°"
          >
            <RotateCw size={14} />
          </button>
          <button 
            onClick={(e) => handleButtonClick(e, () => onRemove(page.id))} 
            className="p-1.5 bg-red-500 text-white rounded-full focus:outline-none" 
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <span className="absolute bottom-1 left-1 px-2 py-0.5 text-xs bg-slate-800 text-white rounded">{index + 1}</span>
      </div>
      <p className="text-xs text-center truncate mt-1 px-1 w-full">{page.sourceFileName} (p.{page.pageIndex + 1})</p>
    </div>
  );
};

const CompressPage = () => {
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [compressionMode, setCompressionMode] = useState('quality');
    const [qualityValue, setQualityValue] = useState(50);
    const [targetSize, setTargetSize] = useState('100');
    const [sizeUnit, setSizeUnit] = useState('KB');
    const navigate = useNavigate();

    // PDF Processing Function
    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length === 0) return;
        
        setProcessingMessage('Processing PDF files...');
        setIsLoading(true);
        
        try {
            let newPages = [];
            for (const file of pdfFiles) {
                const pdfjsLib = await window.pdfjsLib;
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.3 }); // Smaller thumbnail for better performance
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
            setPages(prevPages => [...prevPages, ...newPages]);
        } catch (error) {
            console.error("Failed to process PDF files:", error);
            alert("Could not process one or more PDF files. Please ensure they are valid PDFs.");
        } finally {
            setIsLoading(false);
            setProcessingMessage('');
        }
    }, []);

    // Dropzone Configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 'application/pdf': ['.pdf'] } 
    });

    // Drag and Drop Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Event Handlers
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

    const handleRemovePage = (id) => {
        setPages(pages.filter(p => p.id !== id));
    };

    const handleRotatePage = (id) => {
        setPages(pages.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };

    const handleAlignLeft = () => {
        setPages(pages.map((page, index) => ({ ...page, id: `page_${index}` })));
    };

    // Compression Handler
    const handleCompress = async () => {
        if (pages.length === 0) return;
        
        setProcessingMessage('Compressing your PDF...');
        setIsLoading(true);

        const formData = new FormData();
        const filesToUpload = new Map();
        
        // Add files to form data
        pages.forEach(page => {
            if (!filesToUpload.has(page.sourceFileName)) {
                filesToUpload.set(page.sourceFileName, page.sourceFile);
            }
        });
        
        filesToUpload.forEach(file => {
            formData.append('files', file);
        });

        // Create page instructions for backend
        const pageInstructions = pages.map(page => ({
            sourceFile: page.sourceFileName,
            pageIndex: page.pageIndex,
            rotation: page.rotation
        }));
        
        formData.append('pages_data', JSON.stringify(pageInstructions));

        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        let endpoint = '';
        
        // Set endpoint and parameters based on compression mode
        if (compressionMode === 'quality') {
            endpoint = '/api/v1/compress/quality';
            formData.append('quality', qualityValue);
        } else {
            endpoint = '/api/v1/compress/size';
            formData.append('target_size', parseInt(targetSize));
            formData.append('size_unit', sizeUnit);
        }

        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            navigate('/compress-complete', { 
                state: { 
                    downloadUrl: url,
                    fileName: 'compressed_by_PDFkaro.in.pdf'
                } 
            });
            
        } catch (error) {
            console.error('Compression error:', error);
            alert('An error occurred during compression. Please try again.');
        } finally {
            setIsLoading(false);
            setProcessingMessage('');
        }
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-96">
                <LoaderCircle className="animate-spin text-slate-700" size={64} />
                <h2 className="mt-6 text-2xl font-bold text-slate-800">{processingMessage}</h2>
                <p className="text-slate-500 mt-2">Please wait, this may take a moment.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Compress PDF Files</h1>
                <p className="text-slate-600 mt-2">Arrange, edit, and compress pages with advanced options</p>
            </div>

            {/* Drop Zone */}
            {pages.length === 0 ? (
                <div {...getRootProps()} className={`p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-400 hover:border-slate-600'
                }`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={64} className="mx-auto mb-4 text-slate-400" />
                    <p className="font-semibold text-lg">Drag & drop PDF files here</p>
                    <p className="text-slate-500 mt-2">or click to select files</p>
                </div>
            ) : (
                <>
                    {/* Pages Preview Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Arrange Pages ({pages.length})</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleAlignLeft}
                                    className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Align Pages
                                </button>
                                <div {...getRootProps()} className="px-4 py-2 border-2 border-dashed border-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 flex items-center gap-2">
                                    <input {...getInputProps()} />
                                    <UploadCloud size={16} /> Add More Files
                                </div>
                            </div>
                        </div>
                        
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                                <div className="flex flex-wrap gap-4 p-6 bg-slate-100 rounded-lg min-h-[300px] justify-center items-start">
                                    {pages.map((page, index) => (
                                        <SortablePage 
                                            key={page.id} 
                                            page={page} 
                                            index={index} 
                                            onRemove={handleRemovePage} 
                                            onRotate={handleRotatePage} 
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Compression Options */}
                    <div className="bg-white p-8 rounded-lg border shadow-sm max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
                            <Settings size={24} /> Compression Settings
                        </h3>
                        
                        {/* Mode Selection */}
                        <div className="flex justify-center mb-6 border border-slate-200 rounded-lg p-1 bg-slate-50">
                            <button 
                                onClick={() => setCompressionMode('quality')} 
                                className={`w-1/2 p-3 rounded-md flex items-center justify-center gap-3 transition-all ${
                                    compressionMode === 'quality' 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-white'
                                }`}
                            >
                                <SlidersHorizontal size={18} /> Quality Based
                            </button>
                            <button 
                                onClick={() => setCompressionMode('size')} 
                                className={`w-1/2 p-3 rounded-md flex items-center justify-center gap-3 transition-all ${
                                    compressionMode === 'size' 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-white'
                                }`}
                            >
                                <Target size={18} /> Size Based
                            </button>
                        </div>

                        {/* Quality Based Options */}
                        {compressionMode === 'quality' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold text-lg block mb-3">
                                        Quality Level: <span className="text-blue-600">{qualityValue}%</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="100" 
                                        value={qualityValue} 
                                        onChange={(e) => setQualityValue(parseInt(e.target.value))} 
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-sm text-slate-500 mt-2">
                                        <span>Small File Size</span>
                                        <span>Best Quality</span>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Recommended:</strong> {qualityValue >= 80 ? 'High Quality' : 
                                                                     qualityValue >= 60 ? 'Good Quality' : 
                                                                     qualityValue >= 40 ? 'Balanced' : 
                                                                     qualityValue >= 20 ? 'Medium Compression' : 'High Compression'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Size Based Options */
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold text-lg block mb-3">Target File Size</label>
                                    <div className="flex gap-3 items-center">
                                        <input 
                                            type="number" 
                                            value={targetSize} 
                                            onChange={e => setTargetSize(e.target.value)} 
                                            className="border border-slate-300 rounded-lg p-3 text-lg w-32 focus:outline-none focus:border-blue-500"
                                            min="1"
                                            placeholder="100"
                                        />
                                        <select 
                                            value={sizeUnit} 
                                            onChange={e => setSizeUnit(e.target.value)} 
                                            className="border border-slate-300 rounded-lg p-3 text-lg focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="KB">KB</option>
                                            <option value="MB">MB</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <strong>Note:</strong> We'll compress to {sizeUnit === 'MB' ? 
                                        `${(parseInt(targetSize) * 0.8).toFixed(0)}-${targetSize} MB` : 
                                        `${(parseInt(targetSize) * 0.8).toFixed(0)}-${targetSize} KB`} range
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Compress Button */}
                        <div className="text-center mt-8">
                            <button 
                                onClick={handleCompress}
                                className="bg-blue-600 text-white font-bold py-4 px-16 rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-lg"
                            >
                                Compress {pages.length} Page(s)
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CompressPage;
