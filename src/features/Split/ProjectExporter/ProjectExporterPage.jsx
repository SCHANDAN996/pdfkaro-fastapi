import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { UploadCloud, LoaderCircle, Folder, Settings, CheckSquare, Square, GripVertical, FileText, FileArchive } from 'lucide-react';

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
                reader.onload = () => resolve({
                    id: `${file.name}-${file.lastModified}-${file.size}`,
                    path: file.webkitRelativePath || file.name,
                    content: reader.result,
                    fileObject: file
                });
                reader.onerror = () => resolve(null);
                reader.readAsText(file);
            });
        });

        Promise.all(filePromises).then(results => {
            const validFiles = results.filter(file => file !== null);
            if (validFiles.length === 0) {
                setError("Could not read any text files.");
            }
            setFiles(f => [...f, ...validFiles]);
        }).catch(err => {
            setError("An error occurred while reading files.");
        }).finally(() => setIsLoading(false));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(files);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFiles(items);
    };

    const handleConvert = async () => {
        if (files.length === 0) {
            setError('Please upload files or a folder first.');
            return;
        }
        setLoadingMessage('Processing on server...');
        setIsLoading(true);
        setError('');

        const endpoint = exportType === 'single' ? '/api/v1/process-structure' : '/api/v1/export-zip-structure';
        const payload = { files: files.map(({id, fileObject, ...rest}) => rest), output_format: outputFormat, include_paths: includePaths, align_structure: alignStructure };
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Server error.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = exportType === 'single' 
                ? `project_export_by_PDFkaro.in.${outputFormat}` 
                : `project_export_by_PDFkaro.in.zip`;
            a.click();
            URL.revokeObjectURL(url);
            setFiles([]);
        } catch (e) {
            setError(`Conversion failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center h-96 flex flex-col justify-center items-center"><LoaderCircle className="animate-spin" size={48} /><p className="mt-4">{loadingMessage}</p></div>;
    }
    
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
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="files">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="bg-slate-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                                    {files.map((file, index) => (
                                        <Draggable key={file.id} draggableId={file.id} index={index}>
                                            {(provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center bg-white p-3 mb-2 rounded-md shadow-sm">
                                                    <GripVertical className="text-slate-400 mr-3" />
                                                    <span className="font-mono text-sm text-slate-700">{file.path}</span>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <div className="mt-8 flex flex-col items-center gap-6">
                         <div className="p-4 border rounded-lg w-full sm:w-auto">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings size={20}/>Export Options</h3>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="font-medium mb-2 block">Output Type:</label>
                                    <div className="flex rounded-md shadow-sm">
                                        <button onClick={() => setExportType('single')} className={`px-4 py-2 text-sm font-medium rounded-l-md border ${exportType === 'single' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'}`}>
                                            <FileText size={16} className="inline-block mr-2"/>Combine into Single File
                                        </button>
                                        <button onClick={() => setExportType('zip')} className={`px-4 py-2 text-sm font-medium rounded-r-md border ${exportType === 'zip' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'}`}>
                                            <FileArchive size={16} className="inline-block mr-2"/>Export Individual Files (.zip)
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="output-format" className="font-medium">File Format:</label>
                                    <select id="output-format" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="border rounded-md px-2 py-1">
                                        <option value="txt">.txt</option>
                                        <option value="docx">.docx</option>
                                    </select>
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
