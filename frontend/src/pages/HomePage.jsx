import React from 'react';
import { Merge, Scissors, FileArchive, FolderGit2 } from 'lucide-react';
import ToolCard from '../components/ToolCard.jsx';

const HomePage = () => {
    const tools = [
        { icon: Merge, title: 'Merge PDF', description: 'Combine multiple PDFs and pages.', link: '/merge-pdf', key: 'merge' },
        { icon: Scissors, title: 'Split & Extract PDF', description: 'Extract pages from a PDF.', link: '/split-pdf', key: 'split' },
        { icon: FolderGit2, title: 'Project Exporter', description: 'Export a folder\'s content into a single TXT/Word file.', link: '/project-exporter', key: 'export' },
        { icon: FileArchive, title: 'Compress PDF', description: 'Reduce the size of your PDF file.', link: '/compress-pdf', key: 'compress' },
    ];

    return (
        <div className="text-center" id="tools">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">The All-in-One Free PDF Solution</h1>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
                Easily <strong className="text-slate-700">combine PDF files</strong>, <strong className="text-slate-700">extract pages</strong>, export entire projects, and manage your documents with our collection of free, secure, and simple-to-use online <strong className="text-slate-700">PDF tools</strong>.
            </p>
            
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-slate-700">Our Powerful PDF Tools</h2>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <ToolCard
                            key={tool.key}
                            icon={tool.icon}
                            title={tool.title}
                            description={tool.description}
                            link={tool.link}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-20 text-left max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-700 text-center mb-8">Frequently Asked Questions</h2>
                <div className="space-y-6 bg-white p-8 rounded-lg border">
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">How to combine PDF files for free?</h3>
                        <p className="text-slate-600 mt-1">
                            Our 'Merge PDF' tool allows you to upload multiple PDF files, reorder them as you like, and combine them into a single document for free, without any watermarks.
                        </p>
                    </div>
                    <hr/>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">Is it safe to upload my files to PDFkaro?</h3>
                        <p className="text-slate-600 mt-1">
                            Yes, your privacy and security are our top priority. All files you upload are processed securely and are automatically deleted from our servers after one hour.
                        </p>
                    </div>
                    <hr/>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">Do I need to install any software?</h3>
                        <p className="text-slate-600 mt-1">
                            No, PDFkaro.in is a fully online PDF tool. You don't need to install anything. All our tools work directly in your web browser on any device, including mobile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
