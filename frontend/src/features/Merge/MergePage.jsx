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
        // ... (यह फंक्शन बदला नहीं गया है)
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
        // ... (यह फंक्शन बदला नहीं गया है)
    };

    // ... (बाकी का कोड वही रहेगा, मैंने उसे संक्षिप्त कर दिया है)
    // You can copy the full code for onDrop and handleMerge from my previous response.
    // The main changes are in the libraries, the SortablePage component, and the JSX structure.

    if (isLoading) { /* ... Loading UI ... */ }

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            {/* ... (Title and Dropzone for initial upload) ... */}

            {pages.length > 0 && (
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
                    
                    {/* ... (Add more files button and Merge button) ... */}
                </>
            )}
        </div>
    );
};

export default MergePage;
