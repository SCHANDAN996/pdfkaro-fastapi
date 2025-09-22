import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle } from 'lucide-react';

const CompressCompletePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { downloadUrl, fileName } = location.state || {};

    useEffect(() => {
        if (!downloadUrl) {
            navigate('/compress-pdf');
            return;
        }
    }, [downloadUrl, navigate]);

    if (!downloadUrl) {
        return null;
    }

    const handleDownload = () => {
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'compressed_file.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 text-center">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
                <CheckCircle size={80} className="mx-auto mb-4 text-green-500" />
                <h1 className="text-3xl font-bold text-green-800 mb-2">Compression Successful!</h1>
                <p className="text-green-600 text-lg">Your PDF file has been compressed successfully</p>
            </div>
            
            {/* Download Button */}
            <button 
                onClick={handleDownload}
                className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-12 rounded-lg hover:bg-blue-700 mb-6 text-lg transition-colors shadow-lg"
            >
                <Download className="mr-3" size={24} /> 
                Download Compressed File
            </button>
            
            {/* Additional Options */}
            <div className="mt-8 space-y-4">
                <Link 
                    to="/compress-pdf" 
                    className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800 text-lg transition-colors"
                >
                    <ArrowLeft className="mr-2" size={20} /> Compress Another PDF
                </Link>
                <br />
                <Link 
                    to="/" 
                    className="inline-flex items-center font-semibold text-gray-600 hover:text-gray-800 text-lg transition-colors"
                >
                    ← Back to Home Page
                </Link>
            </div>
            
            {/* Auto-cleanup */}
            {downloadUrl && (
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.addEventListener('beforeunload', function() {
                            URL.revokeObjectURL('${downloadUrl}');
                        });
                    `
                }} />
            )}
        </div>
    );
};

export default CompressCompletePage;
