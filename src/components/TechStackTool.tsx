import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { Layers, Server, Code, Database, Shield, Zap } from 'lucide-react';

interface TechStackResult {
    category: string;
    technologies: { name: string; confidence: string; icon: string }[];
}

export const TechStackTool: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [results, setResults] = useState<TechStackResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDetect = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults([]);

        if (!url.trim()) return;

        setIsLoading(true);
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
            const data = await response.json();

            if (data.contents) {
                const html = data.contents.toLowerCase();
                const headers = data.status?.response_headers || {};
                const detectedTech: TechStackResult[] = [];

                // CMS Detection
                const cms: { name: string; confidence: string; icon: string }[] = [];
                if (html.includes('wp-content') || html.includes('wordpress')) {
                    cms.push({ name: 'WordPress', confidence: 'High', icon: '📝' });
                }
                if (html.includes('shopify') || html.includes('cdn.shopify')) {
                    cms.push({ name: 'Shopify', confidence: 'High', icon: '🛍️' });
                }
                if (html.includes('wix.com') || html.includes('wixsite')) {
                    cms.push({ name: 'Wix', confidence: 'High', icon: '🎨' });
                }
                if (html.includes('squarespace')) {
                    cms.push({ name: 'Squarespace', confidence: 'High', icon: '⬛' });
                }
                if (html.includes('webflow')) {
                    cms.push({ name: 'Webflow', confidence: 'High', icon: '🌊' });
                }
                if (cms.length > 0) detectedTech.push({ category: 'CMS / Platform', technologies: cms });

                // JavaScript Frameworks
                const jsFrameworks: { name: string; confidence: string; icon: string }[] = [];
                if (html.includes('react') || html.includes('_next') || html.includes('__next')) {
                    jsFrameworks.push({ name: 'React', confidence: 'High', icon: '⚛️' });
                }
                if (html.includes('__nuxt') || html.includes('nuxt')) {
                    jsFrameworks.push({ name: 'Vue.js / Nuxt', confidence: 'High', icon: '💚' });
                }
                if (html.includes('ng-') || html.includes('angular')) {
                    jsFrameworks.push({ name: 'Angular', confidence: 'Medium', icon: '🅰️' });
                }
                if (html.includes('svelte')) {
                    jsFrameworks.push({ name: 'Svelte', confidence: 'High', icon: '🔥' });
                }
                if (html.includes('jquery') || html.includes('jquery.min.js')) {
                    jsFrameworks.push({ name: 'jQuery', confidence: 'High', icon: '💲' });
                }
                if (jsFrameworks.length > 0) detectedTech.push({ category: 'JavaScript Frameworks', technologies: jsFrameworks });

                // CSS Frameworks
                const cssFrameworks: { name: string; confidence: string; icon: string }[] = [];
                if (html.includes('bootstrap') || html.includes('btn-primary')) {
                    cssFrameworks.push({ name: 'Bootstrap', confidence: 'High', icon: '🅱️' });
                }
                if (html.includes('tailwind') || html.includes('tw-')) {
                    cssFrameworks.push({ name: 'Tailwind CSS', confidence: 'High', icon: '🌊' });
                }
                if (html.includes('bulma')) {
                    cssFrameworks.push({ name: 'Bulma', confidence: 'High', icon: '💎' });
                }
                if (cssFrameworks.length > 0) detectedTech.push({ category: 'CSS Frameworks', technologies: cssFrameworks });

                // Analytics & Marketing
                const analytics: { name: string; confidence: string; icon: string }[] = [];
                if (html.includes('google-analytics') || html.includes('gtag') || html.includes('ga.js') || html.includes('analytics.js')) {
                    analytics.push({ name: 'Google Analytics', confidence: 'High', icon: '📊' });
                }
                if (html.includes('gtm.js') || html.includes('googletagmanager')) {
                    analytics.push({ name: 'Google Tag Manager', confidence: 'High', icon: '🏷️' });
                }
                if (html.includes('facebook') && html.includes('pixel')) {
                    analytics.push({ name: 'Facebook Pixel', confidence: 'High', icon: '📘' });
                }
                if (html.includes('hotjar')) {
                    analytics.push({ name: 'Hotjar', confidence: 'High', icon: '🔥' });
                }
                if (html.includes('clarity.ms')) {
                    analytics.push({ name: 'Microsoft Clarity', confidence: 'High', icon: '🔍' });
                }
                if (analytics.length > 0) detectedTech.push({ category: 'Analytics & Marketing', technologies: analytics });

                // CDN & Hosting
                const hosting: { name: string; confidence: string; icon: string }[] = [];
                if (html.includes('cloudflare') || headers['cf-ray']) {
                    hosting.push({ name: 'Cloudflare', confidence: 'High', icon: '☁️' });
                }
                if (html.includes('vercel') || html.includes('_vercel')) {
                    hosting.push({ name: 'Vercel', confidence: 'High', icon: '▲' });
                }
                if (html.includes('netlify')) {
                    hosting.push({ name: 'Netlify', confidence: 'High', icon: '🌐' });
                }
                if (html.includes('amazonaws') || html.includes('aws')) {
                    hosting.push({ name: 'AWS', confidence: 'Medium', icon: '☁️' });
                }
                if (hosting.length > 0) detectedTech.push({ category: 'CDN & Hosting', technologies: hosting });

                // Security
                const security: { name: string; confidence: string; icon: string }[] = [];
                if (html.includes('recaptcha') || html.includes('grecaptcha')) {
                    security.push({ name: 'reCAPTCHA', confidence: 'High', icon: '🤖' });
                }
                if (html.includes('hcaptcha')) {
                    security.push({ name: 'hCaptcha', confidence: 'High', icon: '🛡️' });
                }
                if (security.length > 0) detectedTech.push({ category: 'Security', technologies: security });

                if (detectedTech.length === 0) {
                    setError("Could not detect any specific technologies. The site may use custom or less common tools.");
                } else {
                    setResults(detectedTech);
                }
            } else {
                setError("Could not fetch the page. Please check the URL.");
            }
        } catch (err) {
            console.error("Tech Stack Detection Error", err);
            setError("Failed to analyze the page. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'CMS / Platform': return <Server className="w-5 h-5 text-blue-400" />;
            case 'JavaScript Frameworks': return <Code className="w-5 h-5 text-yellow-400" />;
            case 'CSS Frameworks': return <Layers className="w-5 h-5 text-purple-400" />;
            case 'Analytics & Marketing': return <Zap className="w-5 h-5 text-green-400" />;
            case 'CDN & Hosting': return <Database className="w-5 h-5 text-cyan-400" />;
            case 'Security': return <Shield className="w-5 h-5 text-red-400" />;
            default: return <Layers className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Layers className="text-orange-400 w-7 h-7" />
                <span className="text-orange-400">Tech Stack</span> Detector
            </h2>

            <form onSubmit={handleDetect} className="relative mb-8">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter website URL (e.g. example.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <Layers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Detect'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-lg text-yellow-400 text-center mb-6">
                    {error}
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-center">
                        <p className="text-gray-400 mb-1">Technologies Detected</p>
                        <p className="text-3xl font-bold text-orange-400">
                            {results.reduce((acc, cat) => acc + cat.technologies.length, 0)}
                        </p>
                    </div>

                    {/* Results by Category */}
                    <div className="space-y-4">
                        {results.map((category, idx) => (
                            <div key={idx} className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                                <div className="bg-gray-700/30 px-4 py-3 border-b border-gray-700/30 flex items-center gap-3">
                                    {getCategoryIcon(category.category)}
                                    <span className="font-semibold">{category.category}</span>
                                    <span className="ml-auto bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-400">
                                        {category.technologies.length}
                                    </span>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {category.technologies.map((tech, tIdx) => (
                                        <div key={tIdx} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg">
                                            <span className="text-xl">{tech.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-medium">{tech.name}</p>
                                                <p className={`text-xs ${tech.confidence === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {tech.confidence} confidence
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
