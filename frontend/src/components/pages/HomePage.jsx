import React from 'react';
import { Merge, Scissors } from 'lucide-react';

const ToolCard = ({ tool, darkMode, onClick }) => (
  <div 
    onClick={onClick}
    className={`group p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
  >
    <div className="p-4 rounded-full mb-4 bg-secondary text-primary transition-colors duration-300">
      {React.cloneElement(tool.icon, { size: 32 })}
    </div>
    <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-dark-charcoal'}`}>{tool.name}</h3>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tool.description}</p>
  </div>
);


const tools = [
  { id: 'merge', name: 'Merge PDF', description: 'कई PDFs को एक फ़ाइल में मिलाएं।', icon: <Merge /> },
  { id: 'split', name: 'Split PDF', description: 'एक PDF को कई छोटी फाइलों में बांटें।', icon: <Scissors /> },
];

const HomePage = ({ darkMode, setCurrentPage }) => {
  return (
    <>
      <section className={`py-20 px-6 text-center transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
          आपके सभी PDF टूल्स, एक ही जगह पर
        </h2>
        <p className={`max-w-2xl mx-auto mb-8 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          PDF फाइलों को आसानी से मर्ज करें, स्प्लिट करें, कंप्रेस करें और बदलें।
        </p>
      </section>

      <section className="py-16 px-6 md:px-12 container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {tools.map(tool => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              darkMode={darkMode} 
              onClick={() => setCurrentPage(tool.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;


