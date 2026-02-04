import React, { useState } from 'react';
import { SearchIcon, LoaderIcon } from './icons/Icons';

export const DnsLookupTool: React.FC = () => {
    const [domain, setDomain] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults([]);

        if (!domain.trim()) return;

        setIsLoading(true);
        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

        const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

        try {
            const promises = recordTypes.map(type =>
                fetch(`https://dns.google/resolve?name=${cleanDomain}&type=${type}`)
                    .then(res => res.json())
                    .then(data => ({ type, data }))
            );

            const responses = await Promise.all(promises);
            const validRecords = responses
                .filter(res => res.data.Status === 0 && res.data.Answer)
                .map(res => ({
                    type: res.type,
                    records: res.data.Answer
                }));

            if (validRecords.length === 0) {
                setError("No DNS records found for this domain.");
            } else {
                setResults(validRecords);
            }
        } catch (err) {
            console.error("DNS Lookup Error", err);
            setError("Failed to fetch DNS records. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-blue-400">DNS</span> Lookup
            </h2>

            <form onSubmit={handleLookup} className="relative mb-8">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain (e.g. google.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Lookup'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-center mb-6">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {results.map((group, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700/50">
                        <div className="bg-gray-700/30 px-4 py-2 border-b border-gray-700/30 font-bold text-gray-300 flex justify-between items-center">
                            <span>{group.type} Records</span>
                            <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-400">{group.records.length}</span>
                        </div>
                        <div className="divide-y divide-gray-700/30">
                            {group.records.map((rec: any, rIdx: number) => (
                                <div key={rIdx} className="px-4 py-3 flex justify-between items-center text-sm">
                                    <span className="font-mono text-green-400 break-all mr-4">{rec.data}</span>
                                    <span className="text-gray-500 whitespace-nowrap">TTL: {rec.TTL}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
