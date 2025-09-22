import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';

const CompressCompletePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { downloadUrl } = location.state || {};

    useEffect(() => {
        if (!downloadUrl) {
            navigate('/compress-pdf');
        }
        
        return () => {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl, navigate]);

    if (!downloadUrl) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold">Your PDFs are Compressed!</h1>
            <p className="mt-2 mb-8 text-slate-600">Your file is ready to download.</p>
            
            <a 
                href={downloadUrl} 
                download="compressed_by_PDFkaro.in.zip" 
                className="inline-flex items-center justify-center bg-slate-700 text-white font-bold py-4 px-16 rounded-lg hover:bg-slate-800 mb-8"
            >
                <Download className="mr-3" /> Download Compressed File
            </a>
            
            <div className="mt-12">
                <Link to="/compress-pdf" className="inline-flex items-center font-semibold text-slate-700 hover:text-slate-900">
                    <ArrowLeft className="mr-2" size={20} /> Back to Compress
                </Link>
            </div>
        </div>
    );
};

export default CompressCompletePage;
