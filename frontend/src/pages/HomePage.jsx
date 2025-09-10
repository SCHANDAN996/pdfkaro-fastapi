import React from 'react';
import { Merge, Scissors } from 'lucide-react';
import ToolCard from '../components/ToolCard.jsx';

const HomePage = () => {
  const tools = [
    {
      icon: <Merge />,
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one single document.',
      path: '/merge',
      accentColor: '#6A5ACD', // Slate Blue
    },
    {
      icon: <Scissors />,
      title: 'Split PDF',
      description: 'Extract pages from a PDF into separate files.',
      path: '/split',
      accentColor: '#34D399', // Emerald Green
    },
  ];

  return (
    <main className="container mx-auto px-6 py-12">
      <section className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800">
          The All-in-One PDF Solution
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Easily manage your PDF files with our collection of free and simple-to-use tools.
        </p>
      </section>

      <section id="tools" className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;


