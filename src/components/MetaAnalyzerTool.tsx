import React, { useState } from 'react';
import { SearchIcon, LoaderIcon } from './icons/Icons';
import { FileText, CheckCircle, XCircle, AlertTriangle, Globe } from 'lucide-react';

interface MetaTag {
    name: string;
    content: string;
    status: 'good' | 'warning' | 'error' | 'info';
    recommendation?: string;
}

interface MetaResults {
    title: string;
    description: string;
    tags: MetaTag[];
    score: number;
}

export const MetaAnalyzerTool: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [results, setResults] = useState<MetaResults | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);

        if (!url.trim()) return;

        setIsLoading(true);
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('Failed to fetch page');
            }
            
            const data = await response.json();

            if (data.contents && !data.contents.includes('Access Denied') && data.contents.length > 500) {
                const html = data.contents;
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const title = doc.querySelector('title')?.textContent || '';
                const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

                const tags: MetaTag[] = [];
                let score = 0;

                // Title analysis
                if (title) {
                    const titleLen = title.length;
                    tags.push({
                        name: 'Title',
                        content: title,
                        status: titleLen >= 30 && titleLen <= 60 ? 'good' : titleLen < 30 ? 'warning' : 'warning',
                        recommendation: titleLen < 30 ? 'Title is too short. Aim for 30-60 characters.' : titleLen > 60 ? 'Title is too long. Keep it under 60 characters.' : undefined
                    });
                    score += titleLen >= 30 && titleLen <= 60 ? 15 : 8;
                } else {
                    tags.push({ name: 'Title', content: 'Missing', status: 'error', recommendation: 'Add a title tag to your page.' });
                }

                // Meta description analysis
                if (metaDescription) {
                    const descLen = metaDescription.length;
                    tags.push({
                        name: 'Meta Description',
                        content: metaDescription,
                        status: descLen >= 120 && descLen <= 160 ? 'good' : 'warning',
                        recommendation: descLen < 120 ? 'Description is too short. Aim for 120-160 characters.' : descLen > 160 ? 'Description is too long. Keep it under 160 characters.' : undefined
                    });
                    score += descLen >= 120 && descLen <= 160 ? 15 : 8;
                } else {
                    tags.push({ name: 'Meta Description', content: 'Missing', status: 'error', recommendation: 'Add a meta description to improve click-through rates.' });
                }

                // Open Graph tags
                const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
                const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
                const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

                tags.push({ name: 'OG:Title', content: ogTitle || 'Missing', status: ogTitle ? 'good' : 'warning' });
                tags.push({ name: 'OG:Description', content: ogDesc || 'Missing', status: ogDesc ? 'good' : 'warning' });
                tags.push({ name: 'OG:Image', content: ogImage || 'Missing', status: ogImage ? 'good' : 'warning' });
                score += (ogTitle ? 10 : 0) + (ogDesc ? 10 : 0) + (ogImage ? 10 : 0);

                // Twitter cards
                const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
                const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
                tags.push({ name: 'Twitter:Card', content: twitterCard || 'Missing', status: twitterCard ? 'good' : 'warning' });
                tags.push({ name: 'Twitter:Title', content: twitterTitle || 'Missing', status: twitterTitle ? 'good' : 'warning' });
                score += (twitterCard ? 5 : 0) + (twitterTitle ? 5 : 0);

                // Viewport
                const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content');
                tags.push({ name: 'Viewport', content: viewport || 'Missing', status: viewport ? 'good' : 'error', recommendation: !viewport ? 'Add viewport meta tag for mobile responsiveness.' : undefined });
                score += viewport ? 10 : 0;

                // Canonical
                const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
                tags.push({ name: 'Canonical URL', content: canonical || 'Missing', status: canonical ? 'good' : 'warning' });
                score += canonical ? 10 : 0;

                // Robots
                const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content');
                tags.push({ name: 'Robots', content: robots || 'Not specified (default: index,follow)', status: 'info' });

                setResults({ title, description: metaDescription, tags, score: Math.min(score, 100) });
            } else {
                setError("Could not fetch the page. Please check the URL.");
            }
        } catch (err: any) {
            console.error("Meta Analyzer Error", err);
            if (err.name === 'AbortError') {
                setError("Request timed out. The website may be slow or blocking requests.");
            } else {
                setError("Failed to analyze the page. Some sites block automated requests. Try entering a different URL.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
            default: return <Globe className="w-5 h-5 text-blue-400" />;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-purple-400 w-7 h-7" />
                <span className="text-purple-400">Meta Tag</span> Analyzer
            </h2>

            <form onSubmit={handleAnalyze} className="relative mb-8">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL (e.g. https://example.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Analyze'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-center mb-6">
                    {error}
                </div>
            )}

            {results && (
                <div className="space-y-6">
                    {/* Score */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 text-center">
                        <p className="text-gray-400 mb-2">Meta Tag Score</p>
                        <div className={`text-5xl font-bold ${getScoreColor(results.score)}`}>
                            {results.score}/100
                        </div>
                    </div>

                    {/* Tags List */}
                    <div className="space-y-3">
                        {results.tags.map((tag, idx) => (
                            <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                <div className="flex items-start gap-3">
                                    {getStatusIcon(tag.status)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-white">{tag.name}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm break-all">{tag.content.substring(0, 200)}{tag.content.length > 200 ? '...' : ''}</p>
                                        {tag.recommendation && (
                                            <p className="text-yellow-400/80 text-xs mt-2 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {tag.recommendation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
