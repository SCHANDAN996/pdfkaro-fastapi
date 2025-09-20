import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, LoaderCircle, Folder, Settings, CheckSquare, Square } from 'lucide-react';

const ProjectExporterPage = () => {
    const [files, setFiles] = useState([]);
    const [outputFormat, setOutputFormat] = useState('txt');
    const [includePaths, setIncludePaths] = useState(true);
    const [alignStructure, setAlignStructure] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) {
            return;
        }

        setLoadingMessage('Reading folder/files...');
        setIsLoading(true);
        setError('');

        const filePromises = acceptedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        path: file.webkitRelativePath || file.name,
                        content: reader.result
                    });
                };
                reader.onerror = () => {
                    // Ignore non-readable files (like binary images) and resolve with null
                    resolve(null);
                };
                reader.readAsText(file);
            });
        });

        Promise.all(filePromises)
            .then(results => {
                const validFiles = results.filter(file => file !== null && file.path);
                if (validFiles.length === 0) {
                    setError("Could not read any text files. Please select a folder with code/text files.");
                }
                setFiles(validFiles);
            })
            .catch(err => {
                setError("An error occurred while reading files.");
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
                setLoadingMessage('');
            });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleConvert = async () => {
        if (files.length === 0) {
            setError('Please upload a folder first.');
            return;
        }
        setLoadingMessage('Processing on server...');
        setIsLoading(true);
        setError('');

        const payload = { files, output_format: outputFormat, include_paths: includePaths, align_structure: alignStructure };
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/v1/process-structure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Server error.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project_export_by_PDFkaro.in.${outputFormat}`;
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
    
    if (isLoading) {
        return <div className="text-center h-96 flex flex-col justify-center items-center"><LoaderCircle className="animate-spin" size={48} /><p className="mt-4">{loadingMessage}</p></div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold">Project Exporter</h1>
                <p className="text-slate-600 mt-2">Drag & drop a folder to convert its entire structure and content into a single file.</p>
            </div>

            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-slate-700 bg-slate-100' : 'border-slate-400'}`}>
                <input {...getInputProps()} webkitdirectory="" mozdirectory="" />
                {files.length === 0 ? (
                    <>
                        <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
                        <p className="font-semibold">Drag & drop a folder here</p>
                        <p className="text-sm text-slate-500 mt-1">(Or click to select a folder)</p>
                    </>
                ) : (
                    <div className="text-center">
                        <Folder className="mx-auto text-slate-700 mb-2" size={32} />
                        <p className="text-xl font-semibold text-slate-800">{files.length} text files ready to be processed.</p>
                        <button onClick={(e) => { e.stopPropagation(); setFiles([]); }} className="mt-2 text-sm text-red-500 hover:underline">Clear</button>
                    </div>
                )}
            </div>
            
            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

            {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center gap-6">
                    <div className="p-4 border rounded-lg w-full sm:w-auto">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings size={20}/>Options</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between"><label htmlFor="output-format" className="font-medium">Output Format:</label><select id="output-format" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="border rounded-md px-2 py-1"><option value="txt">.txt</option><option value="docx">.docx</option></select></div>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={includePaths} onChange={() => setIncludePaths(!includePaths)} className="hidden" />{includePaths ? <CheckSquare className="text-slate-700" /> : <Square className="text-slate-500" />}<span>Include file paths</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={alignStructure} onChange={() => setAlignStructure(!alignStructure)} className="hidden" />{alignStructure ? <CheckSquare className="text-slate-700" /> : <Square className="text-slate-500" />}<span>Generate aligned structure tree</span></label>
                        </div>
                    </div>
                    <button onClick={handleConvert} className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-slate-800">Convert and Download</button>
                </div>
            )}
        </div>
    );
};

export default ProjectExporterPage;
