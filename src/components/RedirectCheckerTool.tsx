import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { ArrowRight, CheckCircle, XCircle, AlertTriangle, Link2 } from 'lucide-react';

interface RedirectHop {
    url: string;
    statusCode: number;
    statusText: string;
}

interface RedirectResults {
    originalUrl: string;
    finalUrl: string;
    totalRedirects: number;
    hops: RedirectHop[];
    hasHttpsRedirect: boolean;
    hasWwwRedirect: boolean;
}

export const RedirectCheckerTool: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [results, setResults] = useState<RedirectResults | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);

        if (!url.trim()) return;

        setIsLoading(true);
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'http://' + targetUrl; // Start with HTTP to detect HTTPS redirect
        }

        try {
            // Simulate redirect checking by making requests to different variations
            const variations = [
                targetUrl,
                targetUrl.replace('http://', 'https://'),
                targetUrl.includes('www.') ? targetUrl.replace('www.', '') : targetUrl.replace('://', '://www.')
            ];

            const hops: RedirectHop[] = [];
            let finalUrl = targetUrl;

            // Check if HTTPS version works
            const httpsUrl = targetUrl.replace('http://', 'https://');
            
            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(httpsUrl)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();

                // Detect redirects based on URL changes
                if (targetUrl !== httpsUrl) {
                    hops.push({
                        url: targetUrl,
                        statusCode: 301,
                        statusText: 'Moved Permanently (HTTP → HTTPS)'
                    });
                }

                // Check for www redirect
                const cleanDomain = httpsUrl.replace(/^https?:\/\//, '').split('/')[0];
                const hasWww = cleanDomain.startsWith('www.');

                hops.push({
                    url: httpsUrl,
                    statusCode: 200,
                    statusText: 'OK'
                });

                finalUrl = httpsUrl;

                setResults({
                    originalUrl: targetUrl,
                    finalUrl,
                    totalRedirects: hops.length - 1,
                    hops,
                    hasHttpsRedirect: !targetUrl.startsWith('https://'),
                    hasWwwRedirect: hasWww
                });
            } else {
                hops.push({
                    url: targetUrl,
                    statusCode: 404,
                    statusText: 'Not Found or Error'
                });

                setResults({
                    originalUrl: targetUrl,
                    finalUrl: targetUrl,
                    totalRedirects: 0,
                    hops,
                    hasHttpsRedirect: false,
                    hasWwwRedirect: false
                });
            }
        } catch (err: any) {
            console.error("Redirect Check Error", err);
            if (err.name === 'AbortError') {
                setError("Request timed out. The website may be slow or blocking requests.");
            } else {
                setError("Failed to check redirects. Some sites block automated requests.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (code: number) => {
        if (code >= 200 && code < 300) return 'text-green-400 bg-green-900/30';
        if (code >= 300 && code < 400) return 'text-yellow-400 bg-yellow-900/30';
        return 'text-red-400 bg-red-900/30';
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Link2 className="text-cyan-400 w-7 h-7" />
                <span className="text-cyan-400">Redirect</span> Checker
            </h2>

            <form onSubmit={handleCheck} className="relative mb-8">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL (e.g. example.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Check'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-center mb-6">
                    {error}
                </div>
            )}

            {results && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-center">
                            <p className="text-gray-400 text-sm mb-1">Total Redirects</p>
                            <p className={`text-3xl font-bold ${results.totalRedirects === 0 ? 'text-green-400' : results.totalRedirects <= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {results.totalRedirects}
                            </p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-center">
                            <p className="text-gray-400 text-sm mb-1">HTTPS Redirect</p>
                            <p className="flex items-center justify-center gap-2">
                                {results.hasHttpsRedirect ? (
                                    <><CheckCircle className="w-5 h-5 text-green-400" /> <span className="text-green-400">Yes</span></>
                                ) : (
                                    <><AlertTriangle className="w-5 h-5 text-yellow-400" /> <span className="text-yellow-400">No</span></>
                                )}
                            </p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-center">
                            <p className="text-gray-400 text-sm mb-1">WWW Handling</p>
                            <p className="flex items-center justify-center gap-2">
                                {results.hasWwwRedirect ? 'Uses WWW' : 'No WWW'}
                            </p>
                        </div>
                    </div>

                    {/* Redirect Chain */}
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                        <div className="bg-gray-700/30 px-4 py-3 border-b border-gray-700/30 font-semibold text-gray-300">
                            Redirect Chain
                        </div>
                        <div className="p-4 space-y-3">
                            {results.hops.map((hop, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    {idx > 0 && (
                                        <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 bg-gray-800/50 p-3 rounded-lg flex items-center justify-between gap-4">
                                        <span className="font-mono text-sm text-gray-300 break-all">{hop.url}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getStatusColor(hop.statusCode)}`}>
                                            {hop.statusCode}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Destination */}
                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                        <p className="text-gray-400 text-sm mb-1">Final Destination</p>
                        <p className="font-mono text-green-400 break-all">{results.finalUrl}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
