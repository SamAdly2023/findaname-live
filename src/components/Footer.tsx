import React from 'react';
import { FacebookIcon, InstagramIcon, LinkedInIcon, PinterestIcon, BloggerIcon } from './icons/Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 px-4 mt-12 border-t border-white/10">
      <div className="container mx-auto text-center text-blue-200/60">
        <div className="flex justify-center items-center space-x-6 mb-6">
            <a href="https://www.facebook.com/profile.php?id=61582389547950" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <FacebookIcon className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/findaname2025/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-6 h-6" />
            </a>
            <a href="https://www.linkedin.com/company/find-a-name2025" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <LinkedInIcon className="w-6 h-6" />
            </a>
            <a href="https://ph.pinterest.com/findanameseo/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Pinterest">
                <PinterestIcon className="w-6 h-6" />
            </a>
            <a href="https://www.blogger.com/u/1/blog/posts/7689043304800964058" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Blogger">
                <BloggerIcon className="w-6 h-6" />
            </a>
        </div>
        <p>&copy; {new Date().getFullYear()} FindAName.live. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="/about.html" className="hover:text-blue-300 transition-colors">About Us</a>
          <span>|</span>
          <a href="/privacy.html" className="hover:text-blue-300 transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="/terms.html" className="hover:text-blue-300 transition-colors">Terms of Service</a>
          <span>|</span>
          <a href="/contact.html" className="hover:text-blue-300 transition-colors">Contact</a>
           <span>|</span>
          <a href="/automation-guide.html" className="hover:text-blue-300 transition-colors">Automation Guide</a>
        </div>
      </div>
    </footer>
  );
};
