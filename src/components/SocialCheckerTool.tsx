import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { AtSign, CheckCircle, XCircle, ExternalLink, AlertCircle, Link2 } from 'lucide-react';

interface SocialResult {
    platform: string;
    icon: string;
    url: string;
    available: boolean | null;
    checking: boolean;
    statusText?: string;
}

interface PlatformConfig {
    name: string;
    icon: string;
    urlTemplate: string;
    notFoundPatterns: string[];
    takenPatterns: string[];
}

export const SocialCheckerTool: React.FC = () => {
    const [handle, setHandle] = useState<string>('');
    const [results, setResults] = useState<SocialResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [checkedHandle, setCheckedHandle] = useState<string>('');

    // Platform-specific patterns for better accuracy
    const platforms: PlatformConfig[] = [
        {
            name: 'Twitter/X',
            icon: '𝕏',
            urlTemplate: 'https://twitter.com/',
            notFoundPatterns: ['this account doesn', 'doesn\'t exist', 'page doesn\'t exist', 'account suspended'],
            takenPatterns: ['followers', 'following', 'joined', 'posts', 'tweets']
        },
        {
            name: 'Instagram',
            icon: '📸',
            urlTemplate: 'https://instagram.com/',
            notFoundPatterns: ['page isn\'t available', 'sorry, this page', 'content isn\'t available'],
            takenPatterns: ['followers', 'following', 'posts']
        },
        {
            name: 'GitHub',
            icon: '🐙',
            urlTemplate: 'https://github.com/',
            notFoundPatterns: ['not found', '404', 'page not found'],
            takenPatterns: ['repositories', 'contributions', 'followers', 'starred']
        },
        {
            name: 'TikTok',
            icon: '🎵',
            urlTemplate: 'https://tiktok.com/@',
            notFoundPatterns: ['couldn\'t find this account', 'page you requested', 'not available'],
            takenPatterns: ['followers', 'following', 'likes']
        },
        {
            name: 'YouTube',
            icon: '▶️',
            urlTemplate: 'https://youtube.com/@',
            notFoundPatterns: ['page isn\'t available', 'this page isn\'t', '404'],
            takenPatterns: ['subscribers', 'videos', 'views']
        },
        {
            name: 'Pinterest',
            icon: '📌',
            urlTemplate: 'https://pinterest.com/',
            notFoundPatterns: ['page not found', 'sorry', 'this page has moved'],
            takenPatterns: ['followers', 'following', 'pins']
        },
        {
            name: 'Reddit',
            icon: '🤖',
            urlTemplate: 'https://reddit.com/user/',
            notFoundPatterns: ['page not found', 'nobody on reddit', 'doesn\'t exist'],
            takenPatterns: ['karma', 'cake day', 'post karma', 'comment karma']
        },
        {
            name: 'Twitch',
            icon: '🎮',
            urlTemplate: 'https://twitch.tv/',
            notFoundPatterns: ['page is in another castle', 'content is currently unavailable', 'sorry'],
            takenPatterns: ['followers', 'videos', 'clips', 'streaming']
        },
        {
            name: 'LinkedIn',
            icon: '💼',
            urlTemplate: 'https://linkedin.com/in/',
            notFoundPatterns: ['page not found', 'this page doesn\'t exist', 'page you were looking for'],
            takenPatterns: ['connections', 'experience', 'linkedin']
        },
        {
            name: 'Facebook',
            icon: '📘',
            urlTemplate: 'https://facebook.com/',
            notFoundPatterns: ['page isn\'t available', 'content isn\'t available', 'link may be broken'],
            takenPatterns: ['friends', 'photos', 'videos', 'likes']
        },
    ];

    const checkWithTimeout = async (url: string, timeout: number = 8000): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    };

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle.trim()) return;

        const cleanHandle = handle.replace('@', '').trim().toLowerCase();

        // Validate handle format
        if (!/^[a-z0-9_.-]+$/i.test(cleanHandle)) {
            alert('Please enter a valid username (letters, numbers, underscore, dash, or dot only)');
            return;
        }

        setIsLoading(true);
        setCheckedHandle(cleanHandle);

        // Initialize results with checking state
        const initialResults: SocialResult[] = platforms.map(p => ({
            platform: p.name,
            icon: p.icon,
            url: p.urlTemplate + cleanHandle,
            available: null,
            checking: true,
            statusText: 'Checking...'
        }));
        setResults(initialResults);

        // Check each platform with staggered requests to avoid rate limiting
        const updatedResults = await Promise.all(
            platforms.map(async (platform, index) => {
                // Stagger requests slightly
                await new Promise(resolve => setTimeout(resolve, index * 100));

                const url = platform.urlTemplate + cleanHandle;
                try {
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                    const response = await checkWithTimeout(proxyUrl, 10000);

                    if (!response.ok) {
                        return {
                            platform: platform.name,
                            icon: platform.icon,
                            url,
                            available: null,
                            checking: false,
                            statusText: 'Check manually'
                        };
                    }

                    const data = await response.json();
                    const content = (data.contents || '').toLowerCase();

                    // Check if page indicates user not found (available)
                    const isNotFound = platform.notFoundPatterns.some(pattern =>
                        content.includes(pattern.toLowerCase())
                    );

                    // Check if page indicates user exists (taken)
                    const isTaken = platform.takenPatterns.some(pattern =>
                        content.includes(pattern.toLowerCase())
                    );

                    let available: boolean | null = null;
                    let statusText = 'Unknown';

                    if (isNotFound && !isTaken) {
                        available = true;
                        statusText = 'Likely available';
                    } else if (isTaken && !isNotFound) {
                        available = false;
                        statusText = 'Likely taken';
                    } else if (content.length < 500) {
                        // Very short response often means blocked or error
                        statusText = 'Check manually';
                    } else {
                        statusText = 'Verify manually';
                    }

                    return {
                        platform: platform.name,
                        icon: platform.icon,
                        url,
                        available,
                        checking: false,
                        statusText
                    };
                } catch (error) {
                    return {
                        platform: platform.name,
                        icon: platform.icon,
                        url,
                        available: null,
                        checking: false,
                        statusText: error instanceof Error && error.name === 'AbortError'
                            ? 'Timeout'
                            : 'Check manually'
                    };
                }
            })
        );

        setResults(updatedResults);
        setIsLoading(false);
    };

    const availableCount = results.filter(r => r.available === true).length;
    const takenCount = results.filter(r => r.available === false).length;
    const unknownCount = results.filter(r => r.available === null && !r.checking).length;

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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-center">
                            <p className="text-gray-400 text-sm mb-1">Platforms</p>
                            <p className="text-2xl font-bold">{platforms.length}</p>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 text-center">
                            <p className="text-gray-400 text-sm mb-1">Available</p>
                            <p className="text-2xl font-bold text-green-400">{availableCount}</p>
                        </div>
                        <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 text-center">
                            <p className="text-gray-400 text-sm mb-1">Taken</p>
                            <p className="text-2xl font-bold text-red-400">{takenCount}</p>
                        </div>
                        <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30 text-center">
                            <p className="text-gray-400 text-sm mb-1">Verify</p>
                            <p className="text-2xl font-bold text-yellow-400">{unknownCount}</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Link2 className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium">Quick Verify Links</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {results.map((result, idx) => (
                                <a
                                    key={idx}
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${result.available === true
                                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                            : result.available === false
                                                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {result.icon} {result.platform}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.map((result, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border flex items-center justify-between ${result.checking
                                    ? 'bg-gray-900/50 border-gray-700/50'
                                    : result.available === true
                                        ? 'bg-green-900/20 border-green-500/30'
                                        : result.available === false
                                            ? 'bg-red-900/20 border-red-500/30'
                                            : 'bg-yellow-900/10 border-yellow-500/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{result.icon}</span>
                                    <div>
                                        <p className="font-semibold">{result.platform}</p>
                                        <p className="text-sm text-gray-500">@{checkedHandle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-2">
                                        {result.checking ? (
                                            <span className="text-xs text-gray-400">Checking...</span>
                                        ) : (
                                            <span className={`text-xs ${result.available === true
                                                    ? 'text-green-400'
                                                    : result.available === false
                                                        ? 'text-red-400'
                                                        : 'text-yellow-400'
                                                }`}>
                                                {result.statusText}
                                            </span>
                                        )}
                                    </div>
                                    {result.checking ? (
                                        <LoaderIcon className="w-5 h-5 animate-spin text-gray-400" />
                                    ) : result.available === true ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : result.available === false ? (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                    )}
                                    <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                                        title="Open profile page"
                                    >
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
                        <p className="text-sm text-indigo-300">
                            <strong>Note:</strong> Results are estimates based on page content analysis.
                            Some platforms may block automated checks. Always click the link to verify availability before registering.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
