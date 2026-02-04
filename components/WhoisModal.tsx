
import React from 'react';
import type { WhoisData } from '../types';
import { LoaderIcon, CloseIcon } from './icons/Icons';

interface WhoisModalProps {
  domainName: string;
  isLoading: boolean;
  whoisData: WhoisData | null;
  onClose: () => void;
}

export const WhoisModal: React.FC<WhoisModalProps> = ({ domainName, isLoading, whoisData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-[#0e183a] to-[#0a1024] border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-100">
            WHOIS Info: <span className="text-blue-300">{domainName}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48">
              <LoaderIcon className="h-10 w-10 animate-spin text-blue-400" />
              <p className="mt-4 text-blue-200">Fetching WHOIS data...</p>
            </div>
          )}

          {!isLoading && whoisData && (
            whoisData.error ? (
                <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">{whoisData.error}</div>
            ) : (
            <div className="space-y-4 text-blue-100/90">
                <DataItem label="Registrar" value={whoisData.registrar} />
                <DataItem label="Creation Date" value={whoisData.creationDate ? new Date(whoisData.creationDate).toDateString() : 'N/A'} />
                <DataItem label="Expiration Date" value={whoisData.expirationDate ? new Date(whoisData.expirationDate).toDateString() : 'N/A'} />
                <DataItem label="Name Servers" value={whoisData.nameServers?.join(', ')} />
                <DataItem label="Status" value={whoisData.status?.join(', ')} />
            </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const DataItem: React.FC<{label: string; value?: string}> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row border-b border-white/10 pb-2">
    <dt className="w-full sm:w-1/3 font-semibold text-blue-200/70">{label}:</dt>
    <dd className="w-full sm:w-2/3 text-blue-100">{value || 'N/A'}</dd>
  </div>
);
