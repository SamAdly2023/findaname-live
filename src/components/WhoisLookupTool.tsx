import React, { useState } from 'react';
import { getWhoisInfo } from '../services/geminiService';
import { LoaderIcon, SearchIcon } from './icons/Icons';
import type { WhoisData } from '../types';

export const WhoisLookupTool: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [data, setData] = useState<WhoisData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim()) return;
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
            const result = await getWhoisInfo(clean);
            setData(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to retrieve WHOIS data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-purple-400">WHOIS</span> Lookup
            </h2>

            <form onSubmit={handleLookup} className="relative mb-8">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain (e.g. facebook.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Search'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-center mb-6">
                    {error}
                </div>
            )}

            {data && (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden text-sm">
                    {data.error ? (
                        <div className="p-4 bg-red-900/10 text-red-300">
                            <strong>Error:</strong> {data.error}
                        </div>
                    ) : (
                        <pre className="p-4 text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                            {/* Format fields nicely if available, else dumping raw */}
                            {data.registrar && `Registrar: ${data.registrar}\n`}
                            {data.creationDate && `Created: ${data.creationDate}\n`}
                            {data.expirationDate && `Expires: ${data.expirationDate}\n`}
                            {data.nameServers && data.nameServers.length > 0 && `Name Servers:\n  ${data.nameServers.join('\n  ')}\n`}
                            {data.status && data.status.length > 0 && `\nStatus:\n  ${data.status.join('\n  ')}\n`}

                            {/* Fallback to raw text if specific fields missing but no error */}
                            {(!data.registrar && !data.creationDate && data.rawText) ? data.rawText : ''}

                            {/* Fallback debug view for other props */}
                            {(!data.registrar && !data.creationDate && !data.rawText) && JSON.stringify(data, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};
