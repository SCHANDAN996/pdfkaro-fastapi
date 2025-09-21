// frontend/src/pages/MergeCompletePage.jsx

import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';

const MergeCompletePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { downloadUrl, fileName } = location.state || {};

    // If someone lands on this page directly, redirect to home
    useEffect(() => {
        if (!downloadUrl) {
            navigate('/');
        }
        // Clean up the object URL when the component unmounts
        return () => {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        }
    }, [downloadUrl, navigate]);

    if (!downloadUrl) {
        return null; // Render nothing while redirecting
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 text-center">
             <h1 className="text-3xl sm:text-4xl font-bold">Your PDFs have been merged!</h1>
             <p className="mt-2 mb-8 text-slate-600">Your file is ready to download.</p>
             <a href={downloadUrl} download={fileName} className="inline-flex items-center justify-center bg-slate-700 text-white font-bold py-4 px-16 rounded-lg hover:bg-slate-800">
                <Download className="mr-3" /> Download Merged PDF
            </a>
             <div className="mt-12">
                 <Link to="/merge" className="inline-flex items-center font-semibold"><ArrowLeft className="mr-2" size={20} />Back to Merge</Link>
            </div>
        </div>
    );
};

export default MergeCompletePage;
