import React from 'react';

const ToolCard = ({ tool, darkMode, onClick }) => (
  <div 
    onClick={onClick}
    className={`group p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
  >
    <div className="p-4 rounded-full mb-4 transition-colors duration-300" style={{ backgroundColor: '#F0F0F0', color: '#6A5ACD' }}>
      {React.cloneElement(tool.icon, { size: 32 })}
    </div>
    <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tool.name}</h3>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tool.description}</p>
  </div>
);

export default ToolCard;
