import React from 'react';
import { Merge, Scissors } from 'lucide-react';

// Header Component (inside this file)
const Header = () => (
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-[#6A5ACD]">PDFkaro.in</h1>
      <nav>
        <a href="#tools" className="text-gray-600 hover:text-[#6A5ACD] mx-2">Tools</a>
      </nav>
    </div>
  </header>
);

// Footer Component (inside this file)
const Footer = () => (
  <footer className="bg-gray-800 text-white py-6">
    <div className="container mx-auto text-center">
      <p>&copy; 2025 PDFkaro.in. All rights reserved.</p>
    </div>
  </footer>
);

// ToolCard Component (inside this file)
const ToolCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center transform hover:-translate-y-1">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-[#6A5ACD]">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Main App Component
function App() {
  const tools = [
    {
      icon: <Merge size={48} className="text-[#6A5ACD]" />,
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one single document.',
    },
    {
      icon: <Scissors size={48} className="text-[#6A5ACD]" />,
      title: 'Split PDF',
      description: 'Extract pages from a PDF.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] text-[#333333] font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#333333] mb-4">
            The All-in-One PDF Solution
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Easily manage your PDF files with our collection of free and simple-to-use tools.
          </p>
        </div>
        <div id="tools" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;

