import React from 'react';
import { Merge, Scissors } from 'lucide-react';

// Simplified ToolCard component for now
const ToolCard = ({ icon, title, description, href }) => (
  <a href={href} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center transform hover:-translate-y-1">
    <div className="flex justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-[#6A5ACD]">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </a>
);

const HomePage = () => {
  const tools = [
    {
      icon: <Merge size={48} className="text-[#6A5ACD]" />,
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one single document.',
      href: '/merge' // This is a simple link for now
    },
    {
      icon: <Scissors size={48} className="text-[#6A5ACD]" />,
      title: 'Split PDF',
      description: 'Extract pages from your PDF or save each page as a separate PDF.',
      href: '/split' // This is a simple link for now
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#333333] mb-4">
          The All-in-One PDF Solution
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Easily manage your PDF files with our collection of free and simple-to-use tools.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            href={tool.href}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;

