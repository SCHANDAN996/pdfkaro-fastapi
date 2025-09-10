import React from 'react';
import { Link } from 'react-router-dom';

const ToolCard = ({ icon, title, description, path, accentColor }) => {
  return (
    <Link to={path} className="block group">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-full">
        <div className={`inline-block p-3 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${accentColor}20` }}>
           {React.cloneElement(icon, { style: { color: accentColor }, className: "h-8 w-8" })}
        </div>
        <h3 className="text-xl font-bold mt-4 text-slate-800">{title}</h3>
        <p className="text-slate-500 mt-2">{description}</p>
      </div>
    </Link>
  );
};

export default ToolCard;

