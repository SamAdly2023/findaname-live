import React from 'react';
import type { DomainInfo } from '../types';
import { DomainStatus } from '../types';
import { StarIcon, InfoIcon, TwitterIcon, FacebookIcon, LinkedInIcon } from './icons/Icons';

interface DomainCardProps {
  domain: DomainInfo;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewWhois: () => void;
  onBuy: () => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({ domain, isFavorite, onToggleFavorite, onViewWhois, onBuy }) => {
  const shareText = `I found a great domain name: ${domain.name}! Check it out on FindAName.live`;
  const shareUrl = encodeURIComponent("https://findaname.live");

  const statusClasses = {
    [DomainStatus.Available]: 'bg-green-500/20 text-green-300',
    [DomainStatus.Taken]: 'bg-red-500/20 text-red-300',
    [DomainStatus.Unknown]: 'bg-gray-500/20 text-gray-300'
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-5 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:scale-[1.02]">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-blue-100 break-all">{domain.name}</h3>
          <button onClick={onToggleFavorite} className="p-1 text-gray-400 hover:text-yellow-400 transition-colors" aria-label={`Favorite ${domain.name}`}>
            <StarIcon className={`h-6 w-6 ${isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
          </button>
        </div>
        {domain.description && (
          <p className="text-blue-200/80 mb-4 text-sm">{domain.description}</p>
        )}
        <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusClasses[domain.status]}`}>
          {domain.status}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
            {domain.status === DomainStatus.Available ? (
            <button onClick={onBuy} className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors">
                Secure on NameSilo
            </button>
            ) : (
            <button onClick={onViewWhois} className="w-full sm:w-auto px-6 py-2 bg-blue-600/50 hover:bg-blue-600/80 rounded-lg font-semibold transition-colors">
                WHOIS Info
            </button>
            )}
            {domain.status === DomainStatus.Available && (
                <div className="relative group">
                    <InfoIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 border border-white/20 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        This opens NameSilo with our affiliate link. If you make a purchase, we may earn a commission at no extra cost to you. Thank you for your support!
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex items-center justify-center sm:justify-end space-x-2 text-gray-400">
           <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-white" aria-label="Share on Twitter"><TwitterIcon className="w-5 h-5" /></a>
           <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-white" aria-label="Share on Facebook"><FacebookIcon className="w-5 h-5" /></a>
           <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-white" aria-label="Share on LinkedIn"><LinkedInIcon className="w-5 h-5" /></a>
        </div>
      </div>
    </div>
  );
};