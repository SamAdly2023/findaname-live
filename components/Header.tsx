
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <img src="https://webexpert.world.masonryresto.com/wp-content/uploads/2025/10/Find-A-Name-Logo-1.png" alt="FindAName.live Logo" className="h-12 w-auto" />
          </div>
        </a>
        {/* Can add navigation links here if needed */}
      </div>
    </header>
  );
};