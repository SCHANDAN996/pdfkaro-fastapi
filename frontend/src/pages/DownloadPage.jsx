import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Download, Share2, Trash2, ArrowLeft, RefreshCw, Lock, FileShrink2 } from 'lucide-react';

const DownloadPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const downloadUrl = location.state?.downloadUrl;

    // Yadi koi download URL nahi hai, to user ko wapas bhej dein
    useEffect(() => {
        if (!downloadUrl) {
            console.error("No download URL found, redirecting to merge page.");
            navigate('/merge');
        }
    }, [downloadUrl, navigate]);

    // Cleanup function to revoke the object URL when the component unmounts
    useEffect(() => {
        return () => {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl]);
    
    if (!downloadUrl) {
        return null; // Ya ek loading indicator dikhayein
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Your PDFs have been merged!</h1>
            <p className="text-slate-600 mt-2 mb-8">Your file is ready to download.</p>

            <a
                href={downloadUrl}
                download="merged_document.pdf"
                className="inline-flex items-center justify-center bg-slate-700 text-white font-bold py-4 px-16 rounded-lg text-lg hover:bg-slate-800 transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
                <Download className="mr-3" />
                Download Merged PDF
            </a>

            <div className="mt-6 flex items-center justify-center space-x-4">
                 <button className="p-2 text-slate-500 hover:text-slate-800" title="Share link (coming soon)">
                    <Share2 />
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-800" title="Delete it now (coming soon)">
                    <Trash2 />
                </button>
            </div>
            
            <div className="mt-12">
                 <Link to="/merge" className="inline-flex items-center text-slate-600 hover:text-slate-800 font-semibold">
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Merge
                </Link>
            </div>

            <div className="mt-16 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h2 className="text-xl font-bold text-slate-700 mb-4">Continue to...</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Link to="/compress" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <FileShrink2 className="text-slate-500 mr-4" />
                        <span className="font-semibold text-slate-800">Compress PDF</span>
                    </Link>
                     <Link to="/split" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <RefreshCw className="text-slate-500 mr-4" />
                        <span className="font-semibold text-slate-800">Split PDF</span>
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

