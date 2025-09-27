import React from 'react';
import { UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-10 py-2 bg-transparent">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-lg">News RAG</span>
          </div>
        </div>

        {/* Right side: Clerk UserButton */}
        <div>
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
