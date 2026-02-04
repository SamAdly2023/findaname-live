
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 px-4 mt-12 border-t border-white/10">
      <div className="container mx-auto text-center text-blue-200/60">
        <p>&copy; {new Date().getFullYear()} FindAName.live. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-blue-300 transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:text-blue-300 transition-colors">Terms of Service</a>
          <span>|</span>
          <a href="#" className="hover:text-blue-300 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};
