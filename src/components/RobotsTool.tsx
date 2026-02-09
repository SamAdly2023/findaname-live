import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { FileCode, CheckCircle, XCircle, AlertTriangle, Bot } from 'lucide-react';

interface RobotsRule {
    userAgent: string;
    rules: { type: 'allow' | 'disallow'; path: string }[];
}

interface RobotsResult {
    exists: boolean;
    content: string;
    rules: RobotsRule[];
    hasSitemap: boolean;
    sitemapUrls: string[];
    issues: string[];
    score: number;
}

export const RobotsTool: React.FC = () => {
    const [domain, setDomain] = useState<string>('');
    const [results, setResults] = useState<RobotsResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);

        if (!domain.trim()) return;

        setIsLoading(true);
        let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        const robotsUrl = `https://${cleanDomain}/robots.txt`;

        try {
            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(robotsUrl)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Failed to fetch robots.txt');
            }

            const data = await response.json();

            if (data.contents && !data.contents.includes('<!DOCTYPE') && !data.contents.includes('<html')) {
                const content = data.contents;
                const lines = content.split('\n');

                const rules: RobotsRule[] = [];
                const sitemapUrls: string[] = [];
                const issues: string[] = [];
                let currentUserAgent = '*';
                let currentRules: { type: 'allow' | 'disallow'; path: string }[] = [];

                lines.forEach((line: string) => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#')) return;

                    const [directive, ...valueParts] = trimmed.split(':');
                    const value = valueParts.join(':').trim();

                    switch (directive.toLowerCase()) {
                        case 'user-agent':
                            if (currentRules.length > 0) {
                                rules.push({ userAgent: currentUserAgent, rules: currentRules });
                            }
                            currentUserAgent = value || '*';
                            currentRules = [];
                            break;
                        case 'disallow':
                            currentRules.push({ type: 'disallow', path: value || '/' });
                            break;
                        case 'allow':
                            currentRules.push({ type: 'allow', path: value });
                            break;
                        case 'sitemap':
                            sitemapUrls.push(value);
                            break;
                    }
                });

                // Push last user-agent rules
                if (currentRules.length > 0) {
                    rules.push({ userAgent: currentUserAgent, rules: currentRules });
                }

                // Check for issues
                if (rules.length === 0) {
                    issues.push('No crawling rules defined');
                }
                if (sitemapUrls.length === 0) {
                    issues.push('No sitemap URL specified');
                }

                const hasDisallowAll = rules.some(r =>
                    r.rules.some(rule => rule.type === 'disallow' && rule.path === '/')
                );
                if (hasDisallowAll) {
                    issues.push('Warning: Disallow all (/) rule found - this blocks all crawling');
                }

                // Calculate score
                let score = 50; // Base score for having robots.txt
                if (rules.length > 0) score += 20;
                if (sitemapUrls.length > 0) score += 20;
                if (!hasDisallowAll) score += 10;

                setResults({
                    exists: true,
                    content,
                    rules,
                    hasSitemap: sitemapUrls.length > 0,
                    sitemapUrls,
                    issues,
                    score: Math.min(score, 100)
                });
            } else {
                setResults({
                    exists: false,
                    content: '',
                    rules: [],
                    hasSitemap: false,
                    sitemapUrls: [],
                    issues: ['No robots.txt file found'],
                    score: 0
                });
            }
        } catch (err: any) {
            console.error("Robots.txt Check Error", err);
            if (err.name === 'AbortError') {
                setError("Request timed out. The website may be slow or blocking requests.");
            } else {
                setError("Failed to fetch robots.txt. Some sites may block automated requests.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Bot className="text-teal-400 w-7 h-7" />
                <span className="text-teal-400">Robots.txt</span> Validator
            </h2>

            <form onSubmit={handleCheck} className="relative mb-8">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain (e.g. example.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <FileCode className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Validate'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-center mb-6">
                    {error}
                </div>
            )}

            {results && (
                <div className="space-y-6">
                    {/* Status */}
                    <div className={`p-6 rounded-xl border ${results.exists ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                        <div className="flex items-center gap-4">
                            {results.exists ? (
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            ) : (
                                <XCircle className="w-10 h-10 text-red-400" />
                            )}
                            <div>
                                <h3 className="text-xl font-bold">
                                    {results.exists ? 'Robots.txt Found' : 'Robots.txt Not Found'}
                                </h3>
                                <p className="text-gray-400">
                                    {results.exists
                                        ? `${results.rules.length} user-agent rules, ${results.sitemapUrls.length} sitemap(s)`
                                        : 'Consider adding a robots.txt file for better SEO control'}
                                </p>
                            </div>
                            <div className={`ml-auto text-3xl font-bold px-4 py-2 rounded-lg ${results.score >= 80 ? 'text-green-400 bg-green-900/30' :
                                results.score >= 50 ? 'text-yellow-400 bg-yellow-900/30' :
                                    'text-red-400 bg-red-900/30'
                                }`}>
                                {results.score}%
                            </div>
                        </div>
                    </div>

                    {/* Issues */}
                    {results.issues.length > 0 && (
                        <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-400">
                                <AlertTriangle className="w-4 h-4" />
                                Issues Found
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-400">
                                {results.issues.map((issue, idx) => (
                                    <li key={idx}>• {issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Sitemaps */}
                    {results.sitemapUrls.length > 0 && (
                        <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                            <div className="bg-gray-700/30 px-4 py-3 border-b border-gray-700/30 font-semibold text-gray-300">
                                Sitemap URLs
                            </div>
                            <div className="p-4 space-y-2">
                                {results.sitemapUrls.map((url, idx) => (
                                    <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block font-mono text-sm text-teal-400 hover:text-teal-300 break-all"
                                    >
                                        {url}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rules */}
                    {results.rules.length > 0 && (
                        <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                            <div className="bg-gray-700/30 px-4 py-3 border-b border-gray-700/30 font-semibold text-gray-300">
                                Crawling Rules
                            </div>
                            <div className="divide-y divide-gray-700/30">
                                {results.rules.map((ruleGroup, idx) => (
                                    <div key={idx} className="p-4">
                                        <p className="font-semibold mb-2 flex items-center gap-2">
                                            <Bot className="w-4 h-4 text-gray-500" />
                                            User-agent: <span className="text-teal-400">{ruleGroup.userAgent}</span>
                                        </p>
                                        <div className="space-y-1 ml-6">
                                            {ruleGroup.rules.map((rule, rIdx) => (
                                                <p key={rIdx} className={`text-sm font-mono ${rule.type === 'allow' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {rule.type === 'allow' ? 'Allow' : 'Disallow'}: {rule.path || '(empty)'}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Raw Content */}
                    {results.content && (
                        <details className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                            <summary className="bg-gray-700/30 px-4 py-3 cursor-pointer font-semibold text-gray-300 hover:bg-gray-700/50">
                                View Raw robots.txt
                            </summary>
                            <pre className="p-4 text-sm font-mono text-gray-400 overflow-x-auto whitespace-pre-wrap">
                                {results.content}
                            </pre>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
};
