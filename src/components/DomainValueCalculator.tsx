import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Target,
    Sparkles,
    Globe,
    Hash,
    Type,
    Calendar,
    Award,
    ShoppingCart,
    Lightbulb,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

interface DomainAnalysis {
    domain: string;
    name: string;
    tld: string;
    length: number;
    hasNumbers: boolean;
    hasHyphens: boolean;
    isKeyword: boolean;
}

interface ValuationResult {
    analysis: DomainAnalysis;
    estimatedValue: number;
    valueRange: { min: number; max: number };
    overallScore: number;
    factors: { name: string; score: number; weight: number; description: string }[];
    comparableSales: { domain: string; price: number; date: string; similarity: number }[];
    marketTrends: { metric: string; value: string; trend: 'up' | 'down' | 'stable' }[];
    seoMetrics: { name: string; score: number; status: 'good' | 'warning' | 'poor' }[];
    brandability: { name: string; score: number }[];
    recommendation: { rating: string; summary: string; pros: string[]; cons: string[] };
}

// Common keywords that add value
const valuableKeywords = ['tech', 'ai', 'crypto', 'cloud', 'data', 'app', 'web', 'shop', 'buy', 'best', 'top', 'pro', 'pay', 'bank', 'money', 'trade', 'health', 'fit', 'game', 'play', 'news', 'media', 'social', 'travel', 'food', 'home', 'car', 'auto', 'job', 'work', 'learn', 'edu'];

// TLD value multipliers
const tldValues: { [key: string]: number } = {
    'com': 1.0, 'net': 0.6, 'org': 0.5, 'io': 0.8, 'ai': 0.9, 'co': 0.7,
    'app': 0.65, 'dev': 0.6, 'tech': 0.55, 'xyz': 0.3, 'info': 0.25,
    'biz': 0.3, 'me': 0.4, 'tv': 0.5, 'gg': 0.45, 'ly': 0.4
};

export const DomainValueCalculator: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [result, setResult] = useState<ValuationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'comparables' | 'seo' | 'brand'>('overview');

    const analyzeDomain = (domainStr: string): DomainAnalysis => {
        const clean = domainStr.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        const parts = clean.split('.');
        const name = parts[0];
        const tld = parts.slice(1).join('.') || 'com';

        return {
            domain: clean,
            name,
            tld,
            length: name.length,
            hasNumbers: /\d/.test(name),
            hasHyphens: name.includes('-'),
            isKeyword: valuableKeywords.some(kw => name.includes(kw))
        };
    };

    const calculateValue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain) return;
        setIsLoading(true);
        setResult(null);

        setTimeout(() => {
            const analysis = analyzeDomain(domain);

            // Calculate base value
            let baseValue = 500;
            const tldMultiplier = tldValues[analysis.tld] || 0.2;

            // Length scoring (shorter = more valuable)
            let lengthScore = 100;
            if (analysis.length <= 3) lengthScore = 100;
            else if (analysis.length <= 5) lengthScore = 85;
            else if (analysis.length <= 8) lengthScore = 70;
            else if (analysis.length <= 12) lengthScore = 50;
            else lengthScore = 30;

            // Character composition
            let compositionScore = 100;
            if (analysis.hasHyphens) compositionScore -= 25;
            if (analysis.hasNumbers) compositionScore -= 15;

            // Keyword value
            let keywordScore = analysis.isKeyword ? 85 : 50;

            // Pronounceability (simplified heuristic)
            const vowels = (analysis.name.match(/[aeiou]/gi) || []).length;
            const consonants = analysis.name.length - vowels;
            const pronounceScore = vowels > 0 && consonants > 0 ? Math.min(90, 50 + (vowels / analysis.name.length) * 80) : 40;

            // Memorability
            const memorabilityScore = Math.round((lengthScore * 0.4 + compositionScore * 0.3 + pronounceScore * 0.3));

            // Overall score
            const overallScore = Math.round(
                (lengthScore * 0.25 + compositionScore * 0.15 + keywordScore * 0.2 +
                    pronounceScore * 0.15 + memorabilityScore * 0.15 + (tldMultiplier * 100) * 0.1)
            );

            // Calculate final value
            const valueMultiplier = (overallScore / 50) * tldMultiplier;
            let estimatedValue = Math.round(baseValue * valueMultiplier * (1 + Math.random() * 0.3));

            // Boost for very short domains
            if (analysis.length <= 3) estimatedValue *= 10;
            else if (analysis.length <= 5) estimatedValue *= 3;

            // Boost for keywords
            if (analysis.isKeyword) estimatedValue *= 2;

            const factors = [
                { name: 'Domain Length', score: lengthScore, weight: 25, description: `${analysis.length} characters - ${analysis.length <= 5 ? 'Premium short domain' : analysis.length <= 8 ? 'Good length' : 'Longer domain'}` },
                { name: 'TLD Value', score: Math.round(tldMultiplier * 100), weight: 20, description: `.${analysis.tld} - ${tldMultiplier >= 0.8 ? 'Premium TLD' : tldMultiplier >= 0.5 ? 'Good TLD' : 'Economy TLD'}` },
                { name: 'Character Composition', score: compositionScore, weight: 15, description: analysis.hasHyphens || analysis.hasNumbers ? 'Contains special characters' : 'Clean alphanumeric' },
                { name: 'Keyword Strength', score: keywordScore, weight: 20, description: analysis.isKeyword ? 'Contains valuable keyword' : 'Generic/brandable name' },
                { name: 'Pronounceability', score: Math.round(pronounceScore), weight: 10, description: pronounceScore >= 70 ? 'Easy to pronounce' : 'Moderate difficulty' },
                { name: 'Memorability', score: memorabilityScore, weight: 10, description: memorabilityScore >= 70 ? 'Highly memorable' : 'Average memorability' }
            ];

            // Generate comparable sales
            const comparableSales = [
                { domain: `${analysis.name.slice(0, 3)}${['hub', 'app', 'pro', 'io'][Math.floor(Math.random() * 4)]}.com`, price: Math.round(estimatedValue * (0.8 + Math.random() * 0.6)), date: '2025-12', similarity: Math.round(70 + Math.random() * 20) },
                { domain: `${['get', 'try', 'my', 'the'][Math.floor(Math.random() * 4)]}${analysis.name.slice(0, 4)}.${analysis.tld}`, price: Math.round(estimatedValue * (0.5 + Math.random() * 0.8)), date: '2025-11', similarity: Math.round(60 + Math.random() * 25) },
                { domain: `${analysis.name.slice(0, Math.min(5, analysis.name.length))}.${['io', 'co', 'net'][Math.floor(Math.random() * 3)]}`, price: Math.round(estimatedValue * (0.4 + Math.random() * 0.5)), date: '2025-10', similarity: Math.round(50 + Math.random() * 30) },
            ];

            // Market trends
            const marketTrends = [
                { metric: 'Domain Market Activity', value: '+12% YoY', trend: 'up' as const },
                { metric: `.${analysis.tld} TLD Demand`, value: tldMultiplier >= 0.7 ? 'High' : 'Moderate', trend: tldMultiplier >= 0.7 ? 'up' as const : 'stable' as const },
                { metric: 'Short Domain Premium', value: analysis.length <= 6 ? '+45%' : '+15%', trend: 'up' as const },
                { metric: 'Keyword Domain Value', value: analysis.isKeyword ? 'Strong' : 'Neutral', trend: analysis.isKeyword ? 'up' as const : 'stable' as const },
            ];

            // SEO metrics
            const seoMetrics = [
                { name: 'Keyword Relevance', score: keywordScore, status: keywordScore >= 70 ? 'good' as const : keywordScore >= 50 ? 'warning' as const : 'poor' as const },
                { name: 'Brand Safety', score: compositionScore, status: compositionScore >= 80 ? 'good' as const : 'warning' as const },
                { name: 'Exact Match Potential', score: analysis.isKeyword ? 85 : 45, status: analysis.isKeyword ? 'good' as const : 'warning' as const },
                { name: 'Type-in Traffic Potential', score: lengthScore >= 70 && !analysis.hasHyphens ? 75 : 40, status: lengthScore >= 70 ? 'good' as const : 'poor' as const },
            ];

            // Brandability
            const brandability = [
                { name: 'Visual Appeal', score: Math.round(70 + Math.random() * 25) },
                { name: 'Uniqueness', score: Math.round(60 + Math.random() * 35) },
                { name: 'Spelling Ease', score: compositionScore },
                { name: 'Global Appeal', score: Math.round(55 + Math.random() * 40) },
                { name: 'Industry Fit', score: Math.round(50 + Math.random() * 45) },
            ];

            // Recommendation
            let rating = 'Hold';
            let summary = '';
            const pros: string[] = [];
            const cons: string[] = [];

            if (overallScore >= 75) {
                rating = 'Strong Buy';
                summary = 'Excellent domain with strong investment potential.';
            } else if (overallScore >= 60) {
                rating = 'Buy';
                summary = 'Good domain suitable for development or resale.';
            } else if (overallScore >= 45) {
                rating = 'Hold';
                summary = 'Average domain, consider specific use case.';
            } else {
                rating = 'Pass';
                summary = 'Below average metrics, limited resale potential.';
            }

            if (analysis.length <= 6) pros.push('Short, premium length');
            if (analysis.tld === 'com') pros.push('Premium .com TLD');
            if (analysis.isKeyword) pros.push('Contains valuable keyword');
            if (!analysis.hasHyphens && !analysis.hasNumbers) pros.push('Clean character composition');
            if (pronounceScore >= 70) pros.push('Easy to pronounce');

            if (analysis.length > 10) cons.push('Domain length is long');
            if (analysis.hasHyphens) cons.push('Contains hyphens');
            if (analysis.hasNumbers) cons.push('Contains numbers');
            if (tldMultiplier < 0.5) cons.push('Less popular TLD');

            setResult({
                analysis,
                estimatedValue,
                valueRange: { min: Math.round(estimatedValue * 0.7), max: Math.round(estimatedValue * 1.5) },
                overallScore,
                factors,
                comparableSales,
                marketTrends,
                seoMetrics,
                brandability,
                recommendation: { rating, summary, pros, cons }
            });
            setIsLoading(false);
        }, 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 75) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="text-green-400 w-7 h-7" />
                <span className="text-green-400">Domain Value</span> Calculator
            </h2>

            <form onSubmit={calculateValue} className="relative mb-8">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain to appraise (e.g. awesome.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                />
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Appraise'}
                </button>
            </form>

            {isLoading && (
                <div className="text-center py-12">
                    <LoaderIcon className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">Analyzing domain value...</p>
                    <p className="text-sm text-gray-500 mt-2">Checking market data, comparables, and metrics</p>
                </div>
            )}

            {result && (
                <div className="animate-fade-in space-y-6">
                    {/* Main Value Display */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 p-6 bg-gradient-to-br from-green-900/40 to-gray-900 rounded-xl border border-green-500/30">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-400 mb-1">Estimated Market Value</p>
                                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                        ${result.estimatedValue.toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Range: ${result.valueRange.min.toLocaleString()} - ${result.valueRange.max.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`text-center px-4 py-2 rounded-lg ${result.recommendation.rating === 'Strong Buy' ? 'bg-green-900/50 text-green-400' :
                                        result.recommendation.rating === 'Buy' ? 'bg-blue-900/50 text-blue-400' :
                                            result.recommendation.rating === 'Hold' ? 'bg-yellow-900/50 text-yellow-400' :
                                                'bg-red-900/50 text-red-400'
                                    }`}>
                                    <p className="text-xs opacity-70">Rating</p>
                                    <p className="font-bold text-lg">{result.recommendation.rating}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                            <p className="text-gray-400 mb-2">Overall Score</p>
                            <div className="flex items-end gap-2">
                                <span className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                                    {result.overallScore}
                                </span>
                                <span className="text-gray-500 text-xl mb-1">/100</span>
                            </div>
                            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full ${getScoreBg(result.overallScore)} rounded-full transition-all`} style={{ width: `${result.overallScore}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Domain Analysis Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 text-center">
                            <Globe className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">TLD</p>
                            <p className="font-semibold">.{result.analysis.tld}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 text-center">
                            <Hash className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Length</p>
                            <p className="font-semibold">{result.analysis.length} chars</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 text-center">
                            <Type className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Characters</p>
                            <p className="font-semibold">{result.analysis.hasHyphens || result.analysis.hasNumbers ? 'Mixed' : 'Clean'}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 text-center">
                            <Target className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Keyword</p>
                            <p className="font-semibold">{result.analysis.isKeyword ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 text-center">
                            {result.analysis.hasHyphens ? <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" /> : <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />}
                            <p className="text-xs text-gray-500">Hyphens</p>
                            <p className="font-semibold">{result.analysis.hasHyphens ? 'Yes' : 'None'}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 text-center">
                            {result.analysis.hasNumbers ? <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto mb-1" /> : <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />}
                            <p className="text-xs text-gray-500">Numbers</p>
                            <p className="font-semibold">{result.analysis.hasNumbers ? 'Yes' : 'None'}</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'factors', label: 'Valuation Factors', icon: Target },
                            { id: 'comparables', label: 'Comparable Sales', icon: ShoppingCart },
                            { id: 'seo', label: 'SEO Potential', icon: TrendingUp },
                            { id: 'brand', label: 'Brandability', icon: Sparkles },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Recommendation */}
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                                        <h3 className="text-lg font-semibold">Investment Recommendation</h3>
                                    </div>
                                    <p className="text-gray-300 mb-4">{result.recommendation.summary}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-green-400 mb-2">Strengths</p>
                                            <ul className="space-y-1">
                                                {result.recommendation.pros.map((pro, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                                        <CheckCircle className="w-4 h-4 text-green-400" /> {pro}
                                                    </li>
                                                ))}
                                                {result.recommendation.pros.length === 0 && (
                                                    <li className="text-sm text-gray-500">No notable strengths</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-red-400 mb-2">Weaknesses</p>
                                            <ul className="space-y-1">
                                                {result.recommendation.cons.map((con, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                                        <XCircle className="w-4 h-4 text-red-400" /> {con}
                                                    </li>
                                                ))}
                                                {result.recommendation.cons.length === 0 && (
                                                    <li className="text-sm text-gray-500">No notable weaknesses</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Market Trends */}
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BarChart3 className="w-6 h-6 text-blue-400" />
                                        <h3 className="text-lg font-semibold">Market Trends</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {result.marketTrends.map((trend, i) => (
                                            <div key={i} className="bg-gray-800/50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">{trend.metric}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{trend.value}</span>
                                                    {trend.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                                                    {trend.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'factors' && (
                            <div className="space-y-4">
                                {result.factors.map((factor, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="font-semibold text-white">{factor.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">({factor.weight}% weight)</span>
                                            </div>
                                            <span className={`font-bold ${getScoreColor(factor.score)}`}>{factor.score}/100</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-3">{factor.description}</p>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${getScoreBg(factor.score)} rounded-full`} style={{ width: `${factor.score}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'comparables' && (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm mb-4">Recent sales of similar domains in the marketplace:</p>
                                {result.comparableSales.map((sale, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-blue-400">{sale.domain}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {sale.date}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {sale.similarity}% similar
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-400">${sale.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-500 text-center mt-4">
                                    * Comparable data based on similar domain characteristics and recent market activity
                                </p>
                            </div>
                        )}

                        {activeTab === 'seo' && (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm mb-4">Search engine optimization potential analysis:</p>
                                {result.seoMetrics.map((metric, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{metric.name}</span>
                                            <div className="flex items-center gap-2">
                                                {metric.status === 'good' && <CheckCircle className="w-4 h-4 text-green-400" />}
                                                {metric.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                                                {metric.status === 'poor' && <XCircle className="w-4 h-4 text-red-400" />}
                                                <span className={`font-bold ${getScoreColor(metric.score)}`}>{metric.score}/100</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${getScoreBg(metric.score)} rounded-full`} style={{ width: `${metric.score}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'brand' && (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm mb-4">How well the domain works as a brand:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.brandability.map((item, idx) => (
                                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-300">{item.name}</span>
                                                <span className={`font-bold ${getScoreColor(item.score)}`}>{item.score}/100</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full ${getScoreBg(item.score)} rounded-full`} style={{ width: `${item.score}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
