import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Download, Share2, Trash2, ArrowLeft, RefreshCw, Lock, FileArchive, Scissors } from 'lucide-react';

const DownloadPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // State se data nikalein
    const downloadUrl = location.state?.downloadUrl;
    const fileName = location.state?.fileName || "downloaded_by_PDFkaro.in.pdf";
    const sourceTool = location.state?.sourceTool || 'merge';
    
    const [shareError, setShareError] = useState('');

    useEffect(() => {
        if (!downloadUrl) {
            navigate('/');
        }
    }, [downloadUrl, navigate]);

    useEffect(() => {
        return () => {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl]);

    // --- YEH NAYA FUNCTION HAI WHATSAPP SHARE KE LIYE ---
    const handleShare = async () => {
        setShareError('');
        // Pehle check karein ki browser Web Share API support karta hai ya nahi
        if (navigator.share && navigator.canShare) {
            try {
                // Download URL se file ka data (blob) dobara hasil karein
                const response = await fetch(downloadUrl);
                const blob = await response.blob();

                // Blob se ek File object banayein
                const fileToShare = new File([blob], fileName, { type: blob.type });

                // Check karein ki kya browser is file ko share kar sakta hai
                if (navigator.canShare({ files: [fileToShare] })) {
                    await navigator.share({
                        files: [fileToShare],
                        title: `My File from PDFkaro.in`,
                        text: `Here is the document processed with PDFkaro.in: ${fileName}`,
                    });
                } else {
                    setShareError("Your browser doesn't support sharing this file type.");
                }
            } catch (error) {
                console.error('Error sharing:', error);
                // Agar user share cancel karta hai to error na dikhayein
                if (error.name !== 'AbortError') {
                    setShareError('Could not share the file. Please try downloading it instead.');
                }
            }
        } else {
            // Desktop users ke liye message
            setShareError("Sharing is available on mobile browsers. Please download the file to share it from your desktop.");
        }
    };
    
    if (!downloadUrl) {
        return null;
    }

    const isFromMerge = sourceTool === 'merge';

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                {isFromMerge ? 'Your PDFs have been merged!' : 'Your PDF has been split!'}
            </h1>
            <p className="text-slate-600 mt-2 mb-8">Your file is ready. Share it or download it below.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                    href={downloadUrl}
                    download={fileName}
                    className="inline-flex items-center justify-center w-full sm:w-auto bg-slate-700 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-slate-800 transition-transform duration-200 ease-in-out hover:scale-105"
                >
                    <Download className="mr-3" />
                    Download
                </a>
                <button
                    onClick={handleShare}
                    className="inline-flex items-center justify-center w-full sm:w-auto bg-green-500 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-green-600 transition-transform duration-200 ease-in-out hover:scale-105"
                >
                    <Share2 className="mr-3" />
                    Share
                </button>
            </div>
            
            {shareError && <p className="text-sm text-slate-500 mt-4">{shareError}</p>}
            
            <div className="mt-12">
                 <Link to={isFromMerge ? '/merge' : '/split'} className="inline-flex items-center text-slate-600 hover:text-slate-800 font-semibold">
                    <ArrowLeft className="mr-2" size={20} />
                    Back to {isFromMerge ? 'Merge' : 'Split'}
                </Link>
            </div>

            <div className="mt-16 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h2 className="text-xl font-bold text-slate-700 mb-4">Continue to...</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Link to="/compress" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <FileArchive className="text-slate-500 mr-4" />
                        <span className="font-semibold text-slate-800">Compress PDF</span>
                    </Link>
                     <Link to={isFromMerge ? '/split' : '/merge'} className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {isFromMerge ? <Scissors className="text-slate-500 mr-4" /> : <RefreshCw className="text-slate-500 mr-4" />}
                        <span className="font-semibold text-slate-800">{isFromMerge ? 'Split PDF' : 'Merge PDFs'}</span>
                    </Link>
                     <Link to="/protect" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <Lock className="text-slate-500 mr-4" />
                        <span className="font-semibold text-slate-800">Protect PDF</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DownloadPage;


