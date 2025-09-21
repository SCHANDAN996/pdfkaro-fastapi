
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-slate-800">
                    PDFkaro<span className="text-slate-500">.in</span>
                </Link>
                <nav>
                    <a href="/#tools" className="text-slate-600 hover:text-slate-800">
                        Tools
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default Header;
