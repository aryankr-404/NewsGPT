import React from 'react';
import { Plus, Settings, ChevronDown } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-lg">ChatGPT</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;