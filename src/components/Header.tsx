import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon, CloseIcon, GlobeIcon } from './icons/Icons';

// Define google translate type on window
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = (
    <>
      <a href="/dns-lookup.html" className="text-blue-200/80 hover:text-white transition-colors font-medium">DNS Lookup</a>
      <a href="/whois-lookup.html" className="text-blue-200/80 hover:text-white transition-colors font-medium">WHOIS</a>
      <a href="/seo-checker.html" className="text-blue-200/80 hover:text-white transition-colors font-medium">SEO Checker</a>
      <a href="/blog/" className="text-blue-200/80 hover:text-white transition-colors font-medium">Blog</a>
      <a href="/about.html" className="text-blue-200/80 hover:text-white transition-colors font-medium">About Us</a>
    </>
  );

  // Close lang menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langMenuRef]);

  // Google Translate setup
  useEffect(() => {
    const googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,fr,de,es,ar',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    window.googleTranslateElementInit = googleTranslateElementInit;

    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    // 1. Set the cookie. This will handle translation for subsequent page loads.
    document.cookie = `googtrans=/en/${lang}; path=/`;

    // 2. Try to change the language on the current page without reloading.
    const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
        selectElement.value = lang;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        // 3. If the widget is not ready, reload the page to apply the cookie.
        console.warn('Google Translate widget not found. Falling back to cookie-based reload.');
        window.location.reload();
    }
    setIsLangMenuOpen(false);
  };


  return (
    <>
      <header className="py-6 px-4">
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 flex-shrink-0 z-50">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src="https://webexpert.world.masonryresto.com/wp-content/uploads/2025/10/Find-A-Name-Logo-1.png" alt="FindAName.live Logo" className="h-12 w-auto" />
            </div>
          </a>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-x-6 lg:gap-x-8">
              {navLinks}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2 z-50">
              {/* Language Switcher */}
              <div className="relative" ref={langMenuRef}>
                  <button 
                      aria-label="Select language" 
                      className="p-2"
                      onClick={() => setIsLangMenuOpen(prev => !prev)}
                  >
                      <GlobeIcon className="h-7 w-7 text-white" />
                  </button>
                  {isLangMenuOpen && (
                       <div className="absolute top-full right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl py-2 animate-fade-in-down z-20">
                          <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10">English</button>
                          <button onClick={() => changeLanguage('fr')} className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10">Français</button>
                          <button onClick={() => changeLanguage('de')} className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10">Deutsch</button>
                          <button onClick={() => changeLanguage('es')} className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10">Español</button>
                          <button onClick={() => changeLanguage('ar')} className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-white/10" dir="rtl">العربية</button>
                      </div>
                  )}
              </div>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                  <button 
                      aria-label="Toggle menu" 
                      className="p-2"
                      onClick={() => setIsMenuOpen(prev => !prev)}
                  >
                      {isMenuOpen ? (
                          <CloseIcon className="h-8 w-8 text-white" />
                      ) : (
                          <MenuIcon className="h-8 w-8 text-white" />
                      )}
                  </button>
              </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-gradient-to-br from-[#0a1024] to-[#0d183a] z-40 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <nav className="flex flex-col items-center justify-center h-full gap-y-8 text-2xl">
          {navLinks}
        </nav>
      </div>
    </>
  );
};
