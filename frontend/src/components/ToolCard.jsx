import React from 'react';
import { Link } from 'react-router-dom';

const ToolCard = ({ icon: Icon, title, description, link }) => {
  return (
    <Link to={link} className="block bg-white p-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Icon className="h-12 w-12 text-slate-600 mb-4" />
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </Link>
  );
};

export default ToolCard;

