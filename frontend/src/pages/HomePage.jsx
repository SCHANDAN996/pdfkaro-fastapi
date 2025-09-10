import React from 'react';
import { Merge, Scissors } from 'lucide-react';
import ToolCard from '../components/ToolCard.jsx';

const HomePage = () => {
  const tools = [
    {
      icon: Merge,
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one single document.',
      link: '/merge'
    },
    {
      icon: Scissors,
      title: 'Split PDF',
      description: 'Extract pages from a PDF.',
      link: '/split' // This will be created later
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold text-slate-800">The All-in-One PDF Solution</h1>
        <p className="mt-4 text-lg text-slate-600">Easily manage your PDF files with our collection of free and simple-to-use tools.</p>
      </div>

      <div id="tools" className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
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

