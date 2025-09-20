import React from 'react';
import { Link } from 'react-router-dom';

const ToolCard = ({ icon: Icon, title, description, link }) => { // <-- बदलाव यहाँ है
    return (
        <Link to={link} className="block p-6 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center mb-3">
                {/* बदलाव यहाँ है */}
                {Icon && <Icon size={32} className="text-slate-500" />} 
                <h3 className="ml-4 text-lg font-bold text-slate-800">{title}</h3>
            </div>
            <p className="text-slate-600">{description}</p>
        </Link>
    );
};

export default ToolCard;
