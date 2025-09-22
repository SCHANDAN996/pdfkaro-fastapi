import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, LoaderCircle, CheckSquare, Square, RotateCw } from 'lucide-react';

const SplitPage = () => {
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]);
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFile = acceptedFiles[0];
        if (!pdfFile) return;
        setIsProcessing(true);
        setFile(pdfFile);
        setPages([]);
        setSelectedPages(new Set());
        const pdfjsLib = await window.pdfjsLib;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const typedarray = new Uint8Array(e.target.result);
            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const pageThumbnails = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const context = canvas.getContext('2d');
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    pageThumbnails.push({ pageNum: i, thumbnail: canvas.toDataURL(), rotation: 0 });
                }
                setPages(pageThumbnails);
            } catch (error) {
                alert("Could not process the PDF. It might be corrupted or protected.");
                setFile(null);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsArrayBuffer(pdfFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });
    const togglePageSelection = (pageNum) => {
        setSelectedPages(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(pageNum)) newSelection.delete(pageNum);
            else newSelection.add(pageNum);
            return newSelection;
        });
    };
    const handleRotatePage = (pageNum) => {
        setPages(pages.map(p => p.pageNum === pageNum ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };
    const handleSplit = async () => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        let pagesToExtractInstructions = [];
        if (selectedPages.size > 0) {
            const sortedSelectedPages = Array.from(selectedPages).sort((a, b) => a - b);
            pagesToExtractInstructions = sortedSelectedPages.map(pageNum => {
                const pageData = pages.find(p => p.pageNum === pageNum);
                return { pageIndex: pageData.pageNum - 1, rotation: pageData.rotation };
            });
        }
        formData.append('pages_to_extract', JSON.stringify(pagesToExtractInstructions));
        const apiUrl = 'https://pdfkaro-fastapi.onrender.com';
        try {
            const response = await fetch(`${apiUrl}/api/v1/split`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Split failed on the server.');
            const newPdfBlob = await response.blob();
            const downloadUrl = URL.createObjectURL(newPdfBlob);
            const reader = new FileReader();
            reader.readAsDataURL(newPdfBlob);
            reader.onloadend = () => {
                const base64File = reader.result;
                navigate('/split-complete', { 
                    state: { 
                        downloadUrl: downloadUrl,
                        processedFile: { data: base64File, name: selectedPages.size > 0 ? "extracted_pages.pdf" : "split_pages.zip" }
                    } 
                });
            };
        } catch (error) {
            alert('An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            {/* JSX for the page UI */}
        </div>
    );
};
export default SplitPage;
