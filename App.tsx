import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DomainCard } from './components/DomainCard';
import { WhoisModal } from './components/WhoisModal';
import { AdsenseBlock } from './components/AdsenseBlock';
import { generateDomains, checkAvailability, getWhoisInfo } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DomainInfo, WhoisData, DomainStatus } from './types';
import { SearchIcon, LoaderIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [keyword, setKeyword] = useState<string>('');
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteDomains', []);
  
  const [selectedDomain, setSelectedDomain] = useState<DomainInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [isWhoisLoading, setIsWhoisLoading] = useState<boolean>(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDomains([]);

    try {
      const generatedDomains = await generateDomains(keyword);
      const availabilityChecks = generatedDomains.map(async (domain) => {
        const status = await checkAvailability(domain.name);
        return { name: domain.name, status, description: domain.description };
      });
      const results = await Promise.all(availabilityChecks);
      setDomains(results);
    } catch (err)      {
      console.error(err);
      setError('Failed to generate domain names. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword]);

  const handleViewWhois = useCallback(async (domain: DomainInfo) => {
    setSelectedDomain(domain);
    setIsModalOpen(true);
    setIsWhoisLoading(true);
    setWhoisData(null);
    try {
      const data = await getWhoisInfo(domain.name);
      setWhoisData(data);
    } catch (err) {
      console.error(err);
      setWhoisData({ error: 'Failed to fetch WHOIS data.' });
    } finally {
      setIsWhoisLoading(false);
    }
  }, []);

  const handleToggleFavorite = useCallback((domainName: string) => {
    setFavorites(prev => 
      prev.includes(domainName) 
        ? prev.filter(d => d !== domainName)
        : [...prev, domainName]
    );
  }, [setFavorites]);

  const generateAffiliateLink = (domainName: string) => {
    // --- ACTION REQUIRED: REPLACE PLACEHOLDER WITH YOUR AFFILIATE CODE ---
    // Sign up for a GoDaddy affiliate program (e.g., through CJ Affiliate) to get your code.
    const goDaddyAffiliateCode = 'YOUR_AFFILIATE_CODE'; // <-- PASTE your affiliate tracking code here
    
    const deepLink = `https://www.godaddy.com/domains/searchresults.aspx?domainToCheck=${domainName}`;
    
    // This is a common structure, but might vary depending on the affiliate network (e.g., CJ.com)
    // For CJ, it might look more complex. This is a simplified example.
    if (goDaddyAffiliateCode !== 'YOUR_AFFILIATE_CODE') {
        return `${deepLink}&isc=${goDaddyAffiliateCode}`;
    }
    
    return deepLink; // Fallback to non-affiliate link
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a1024] to-[#0d183a] text-white font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            Find Your Perfect Domain
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 mb-8">
            Leverage AI to generate unique, brandable names and check availability instantly.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., 'quantum ai' or 'sustainable travel'"
              className="w-full pl-12 pr-36 py-4 text-lg bg-white/10 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm transition-all duration-300"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-blue-200/50" />
            </div>
            <button
              type="submit"
              className="absolute inset-y-0 right-0 m-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-full font-semibold flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : 'Generate'}
            </button>
          </div>
          {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        </form>
        
        <div className="max-w-2xl mx-auto">
          <AdsenseBlock slot="5928091834" />
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block">
                <LoaderIcon className="h-12 w-12 animate-spin text-blue-400" />
            </div>
            <p className="mt-4 text-lg text-blue-200">Searching for perfect domains...</p>
          </div>
        )}

        {domains.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {domains.map((domain, index) => (
              <React.Fragment key={domain.name}>
                <DomainCard
                  domain={domain}
                  isFavorite={favorites.includes(domain.name)}
                  onToggleFavorite={() => handleToggleFavorite(domain.name)}
                  onViewWhois={() => handleViewWhois(domain)}
                  onBuy={() => window.open(generateAffiliateLink(domain.name), '_blank')}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && selectedDomain && (
        <WhoisModal
          domainName={selectedDomain.name}
          isLoading={isWhoisLoading}
          whoisData={whoisData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default App;
