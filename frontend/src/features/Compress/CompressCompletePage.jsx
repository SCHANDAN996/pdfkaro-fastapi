import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, FileText } from 'lucide-react';

const CompressCompletePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { downloadUrl, fileName } = location.state || {};

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

    if (!downloadUrl) return null;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
                <FileText size={64} className="mx-auto mb-4 text-green-600" />
                <h1 className="text-3xl sm:text-4xl font-bold text-green-800 mb-2">Compression Successful!</h1>
                <p className="text-green-600 text-lg">Your PDF has been compressed and is ready to download</p>
            </div>
            
            <a 
                href={downloadUrl} 
                download={fileName || "compressed_by_PDFkaro.in.pdf"}
                className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-16 rounded-lg hover:bg-blue-700 mb-8 text-lg transition-colors"
            >
                <Download className="mr-3" size={24} /> Download Compressed PDF
            </a>
            
            <div className="mt-12 space-y-4">
                <Link 
                    to="/compress-pdf" 
                    className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800 text-lg"
                >
                    <ArrowLeft className="mr-2" size={20} /> Compress Another PDF
                </Link>
                <br />
                <Link 
                    to="/" 
                    className="inline-flex items-center font-semibold text-slate-600 hover:text-slate-800 text-lg"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default CompressCompletePage;
