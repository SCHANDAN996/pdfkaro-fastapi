import React from 'react';
import { Merge, Scissors, FileArchive, FolderGit2 } from 'lucide-react';
import ToolCard from '../components/ToolCard.jsx';

const HomePage = () => {
    const tools = [
        { icon: Merge, title: 'Merge PDF', description: 'Combine multiple PDFs and pages.', link: '/merge', key: 'merge' },
        { icon: Scissors, title: 'Split & Extract PDF', description: 'Extract pages from a PDF.', link: '/split', key: 'split' },
        { icon: FolderGit2, title: 'Project Exporter', description: 'Export a folder\'s content into a single TXT/Word file.', link: '/project-exporter', key: 'export' },
        { icon: FileArchive, title: 'Compress PDF', description: 'Reduce the size of your PDF file.', link: '#', key: 'compress' },
    ];

    return (
        <div className="text-center" id="tools">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">The All-in-One PDF Solution</h1>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
                Easily merge, split, compress, and manage your PDF files with our collection of free and simple-to-use tools.
            </p>
            
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
    );
};

export default HomePage;
