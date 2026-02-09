import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { AtSign, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface SocialResult {
    platform: string;
    icon: string;
    url: string;
    available: boolean | null;
    checking: boolean;
}

export const SocialCheckerTool: React.FC = () => {
    const [handle, setHandle] = useState<string>('');
    const [results, setResults] = useState<SocialResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const platforms = [
        { name: 'Twitter/X', icon: '𝕏', urlTemplate: 'https://twitter.com/' },
        { name: 'Instagram', icon: '📸', urlTemplate: 'https://instagram.com/' },
        { name: 'Facebook', icon: '📘', urlTemplate: 'https://facebook.com/' },
        { name: 'LinkedIn', icon: '💼', urlTemplate: 'https://linkedin.com/in/' },
        { name: 'GitHub', icon: '🐙', urlTemplate: 'https://github.com/' },
        { name: 'TikTok', icon: '🎵', urlTemplate: 'https://tiktok.com/@' },
        { name: 'YouTube', icon: '▶️', urlTemplate: 'https://youtube.com/@' },
        { name: 'Pinterest', icon: '📌', urlTemplate: 'https://pinterest.com/' },
        { name: 'Reddit', icon: '🤖', urlTemplate: 'https://reddit.com/user/' },
        { name: 'Twitch', icon: '🎮', urlTemplate: 'https://twitch.tv/' },
    ];

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle.trim()) return;

        const cleanHandle = handle.replace('@', '').trim();
        setIsLoading(true);

        // Initialize results with checking state
        const initialResults: SocialResult[] = platforms.map(p => ({
            platform: p.name,
            icon: p.icon,
            url: p.urlTemplate + cleanHandle,
            available: null,
            checking: true
        }));
        setResults(initialResults);

        // Check each platform
        const updatedResults = await Promise.all(
            platforms.map(async (platform) => {
                const url = platform.urlTemplate + cleanHandle;
                try {
                    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                    const data = await response.json();

                    // Simple heuristic: if we get content and it doesn't contain "not found" patterns
                    const notFoundPatterns = ['page not found', '404', 'doesn\'t exist', 'user not found', 'this page isn\'t available'];
                    const contentLower = (data.contents || '').toLowerCase();
                    const isAvailable = notFoundPatterns.some(pattern => contentLower.includes(pattern));

                    return {
                        platform: platform.name,
                        icon: platform.icon,
                        url,
                        available: isAvailable,
                        checking: false
                    };
                } catch {
                    return {
                        platform: platform.name,
                        icon: platform.icon,
                        url,
                        available: null,
                        checking: false
                    };
                }
            })
        );

        setResults(updatedResults);
        setIsLoading(false);
    };

    const availableCount = results.filter(r => r.available === true).length;
    const takenCount = results.filter(r => r.available === false).length;

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AtSign className="text-indigo-400 w-7 h-7" />
                <span className="text-indigo-400">Social Handle</span> Checker
            </h2>

            <form onSubmit={handleCheck} className="relative mb-8">
                <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="Enter username (e.g. johndoe)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Check All'}
                </button>
            </form>

            {results.length > 0 && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-center">
                            <p className="text-gray-400 text-sm mb-1">Platforms Checked</p>
                            <p className="text-2xl font-bold">{platforms.length}</p>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 text-center">
                            <p className="text-gray-400 text-sm mb-1">Likely Available</p>
                            <p className="text-2xl font-bold text-green-400">{availableCount}</p>
                        </div>
                        <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 text-center">
                            <p className="text-gray-400 text-sm mb-1">Likely Taken</p>
                            <p className="text-2xl font-bold text-red-400">{takenCount}</p>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.map((result, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border flex items-center justify-between ${result.checking
                                        ? 'bg-gray-900/50 border-gray-700/50'
                                        : result.available
                                            ? 'bg-green-900/20 border-green-500/30'
                                            : result.available === false
                                                ? 'bg-red-900/20 border-red-500/30'
                                                : 'bg-gray-900/50 border-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{result.icon}</span>
                                    <div>
                                        <p className="font-semibold">{result.platform}</p>
                                        <p className="text-sm text-gray-500">@{handle.replace('@', '')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {result.checking ? (
                                        <LoaderIcon className="w-5 h-5 animate-spin text-gray-400" />
                                    ) : result.available === true ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : result.available === false ? (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    ) : (
                                        <span className="text-xs text-gray-500">Unknown</span>
                                    )}
                                    <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Note: Results are estimates based on page availability. Click the link icon to verify manually.
                    </p>
                </div>
            )}
        </div>
    );
};
