import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UploadCloud, LoaderCircle, Settings, CheckSquare, Square, GripVertical, FileText, FileArchive } from 'lucide-react';

const SortableItem = ({ file }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <li ref={setNodeRef} style={style} {...attributes} className="flex items-center bg-white p-3 mb-2 rounded-md shadow-sm">
            <span {...listeners} className="cursor-grab active:cursor-grabbing"><GripVertical className="text-slate-400 mr-3" /></span>
            <span className="font-mono text-sm text-slate-700">{file.path}</span>
        </li>
    );
};

const ProjectExporterPage = () => {
    const [files, setFiles] = useState([]);
    const [outputFormat, setOutputFormat] = useState('txt');
    const [exportType, setExportType] = useState('single');
    const [includePaths, setIncludePaths] = useState(true);
    const [alignStructure, setAlignStructure] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;
        setLoadingMessage('Reading files...');
        setIsLoading(true);
        setError('');
        const filePromises = acceptedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ id: `${file.name}-${file.lastModified}-${file.size}-${Math.random()}`, path: file.webkitRelativePath || file.name, content: reader.result });
                reader.onerror = () => resolve(null);
                reader.readAsText(file);
            });
        });
        Promise.all(filePromises).then(results => {
            const validFiles = results.filter(file => file !== null);
            setFiles(f => [...f, ...validFiles]);
        }).catch(err => {
            setError("An error occurred while reading files.");
        }).finally(() => setIsLoading(false));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleConvert = async () => {
        if (files.length === 0) {
            setError('Please upload files or a folder first.');
            return;
        }
        setLoadingMessage('Processing on server...');
        setIsLoading(true);
        setError('');

        // --- मुख्य बदलाव यहाँ है ---
        const endpoint = exportType === 'single' ? '/api/v1/project-exporter/single' : '/api/v1/project-exporter/zip';
        
        const payload = { files: files.map(({id, ...rest}) => rest), output_format: outputFormat, include_paths: includePaths, align_structure: alignStructure };
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Server error.');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = exportType === 'single' ? `project_export.${outputFormat}` : `project_export.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setFiles([]);
        } catch (e) {
            setError(`Conversion failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Project Exporter</h1>
                <p className="text-slate-600 mt-2">Combine files & folders into a single document or a zip archive.</p>
            </div>
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-slate-700 bg-slate-100' : 'border-slate-400'}`}>
                <input {...getInputProps()} webkitdirectory="" mozdirectory="" />
                <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="font-semibold">Drag & drop files or a folder here</p>
                <p className="text-sm text-slate-500 mt-1">(Or click to select)</p>
            </div>
            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
            {files.length > 0 && (
                <>
                    <h3 className="text-xl font-bold text-center mt-8 mb-4">Your Files ({files.length})</h3>
                    <p className="text-center text-sm text-slate-500 mb-4">Drag to reorder the files for the final output.</p>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <ul className="bg-slate-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                            <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                {files.map(file => <SortableItem key={file.id} file={file} />)}
                            </SortableContext>
                        </ul>
                    </DndContext>
                    <div className="mt-8 flex flex-col items-center gap-6">
                        <div className="p-4 border rounded-lg w-full sm:w-auto">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings size={20}/>Export Options</h3>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="font-medium mb-2 block">Output Type:</label>
                                    <div className="flex rounded-md shadow-sm">
                                        <button onClick={() => setExportType('single')} className={`px-4 py-2 text-sm font-medium rounded-l-md border ${exportType === 'single' ? 'bg-slate-700 text-white' : ''}`}><FileText size={16} className="inline-block mr-2"/>Combine into Single File</button>
                                        <button onClick={() => setExportType('zip')} className={`px-4 py-2 text-sm font-medium rounded-r-md border ${exportType === 'zip' ? 'bg-slate-700 text-white' : ''}`}><FileArchive size={16} className="inline-block mr-2"/>Export Individual Files (.zip)</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="output-format" className="font-medium">File Format:</label>
                                    <select id="output-format" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="border rounded-md px-2 py-1"><option value="txt">.txt</option><option value="docx">.docx</option></select>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={includePaths} onChange={() => setIncludePaths(!includePaths)} className="hidden" />{includePaths ? <CheckSquare className="text-slate-700" /> : <Square className="text-slate-500" />}<span>Include file paths</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={alignStructure} onChange={() => setAlignStructure(!alignStructure)} className="hidden" />{alignStructure ? <CheckSquare className="text-slate-700" /> : <Square className="text-slate-500" />}<span>Generate aligned structure tree</span></label>
                            </div>
                        </div>
                        <button onClick={handleConvert} className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800">Convert and Download</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectExporterPage;
