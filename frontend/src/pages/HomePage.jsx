import React from 'react';
import ToolCard from '../components/ToolCard';

// सभी उपलब्ध उपकरणों की सूची।
// एक नया टूल जोड़ने के लिए, बस इस ऐरे में एक और ऑब्जेक्ट जोड़ें।
const tools =;

const HomePage = () => {
  return (
    <div className="bg-secondary min-h-screen p-8">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary font-sans">PDFkaro.in</h1>
          <p className="text-xl text-gray-700 mt-4 font-body">Your All-in-One PDF Toolkit</p>
        </header>
        
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tools.map((tool, index) => (
              <ToolCard 
                key={index}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                path={tool.path}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
