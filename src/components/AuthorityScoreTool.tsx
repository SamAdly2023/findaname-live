import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Globe,
    Award,
    TrendingUp,
    TrendingDown,
    Link2,
    Users,
    Shield,
    RefreshCw,
    ExternalLink,
    BarChart2,
    Target,
    Zap,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';

interface AuthorityResult {
    domainAuthority: number;
    pageAuthority: number;
    spamScore: number;
    trustFlow: number;
    citationFlow: number;
    backlinks: {
        total: number;
        dofollow: number;
        nofollow: number;
        referring: number;
    };
    topBacklinks: {
        source: string;
        da: number;
        anchor: string;
    }[];
    competitors: {
        domain: string;
        da: number;
        trend: 'up' | 'down' | 'stable';
    }[];
    historicalDA: {
        month: string;
        score: number;
    }[];
}

const AuthorityGauge: React.FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
    const percentage = (value / max) * 100;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="12"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${percentage * 2.51} 251`}
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{value}</span>
                </div>
            </div>
            <span className="text-sm text-gray-400 mt-2">{label}</span>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; subtext?: string; color: string }> = ({ icon, label, value, subtext, color }) => (
    <div className={`bg-gray-800/60 border border-gray-700 rounded-xl p-4 hover:border-${color}-500/50 transition-all`}>
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 bg-${color}-500/20 rounded-lg`}>{icon}</div>
            <span className="text-gray-400 text-sm">{label}</span>
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
);

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
};

export const AuthorityScoreTool: React.FC = () => {
    const { user, canSearch, recordSearch } = useAuth();
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AuthorityResult | null>(null);
    const [error, setError] = useState('');

    const analyzeAuthority = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain to analyze');
            return;
        }

        if (!canSearch()) {
            setError('No credits available. Upgrade to Pro for unlimited access.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Simulate API call - replace with actual Moz/Ahrefs API integration
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock Authority analysis result
            const mockResult: AuthorityResult = {
                domainAuthority: Math.floor(Math.random() * 40) + 30,
                pageAuthority: Math.floor(Math.random() * 35) + 25,
                spamScore: Math.floor(Math.random() * 15) + 1,
                trustFlow: Math.floor(Math.random() * 30) + 20,
                citationFlow: Math.floor(Math.random() * 35) + 25,
                backlinks: {
                    total: Math.floor(Math.random() * 50000) + 5000,
                    dofollow: Math.floor(Math.random() * 30000) + 3000,
                    nofollow: Math.floor(Math.random() * 20000) + 2000,
                    referring: Math.floor(Math.random() * 1000) + 100
                },
                topBacklinks: [
                    { source: 'wikipedia.org', da: 95, anchor: domain.split('.')[0] },
                    { source: 'forbes.com', da: 94, anchor: 'Related Article' },
                    { source: 'medium.com', da: 92, anchor: 'Learn More' },
                    { source: 'techcrunch.com', da: 91, anchor: 'Source' },
                    { source: 'github.com', da: 90, anchor: 'View Project' }
                ],
                competitors: [
                    { domain: 'competitor1.com', da: Math.floor(Math.random() * 20) + 40, trend: 'up' },
                    { domain: 'competitor2.com', da: Math.floor(Math.random() * 20) + 35, trend: 'stable' },
                    { domain: 'competitor3.com', da: Math.floor(Math.random() * 20) + 30, trend: 'down' }
                ],
                historicalDA: [
                    { month: '6 months ago', score: Math.floor(Math.random() * 10) + 25 },
                    { month: '5 months ago', score: Math.floor(Math.random() * 10) + 28 },
                    { month: '4 months ago', score: Math.floor(Math.random() * 10) + 30 },
                    { month: '3 months ago', score: Math.floor(Math.random() * 10) + 32 },
                    { month: '2 months ago', score: Math.floor(Math.random() * 10) + 35 },
                    { month: 'Current', score: Math.floor(Math.random() * 10) + 38 }
                ]
            };

            setResult(mockResult);
            recordSearch(domain, 'Authority Score');
        } catch (err) {
            setError('Failed to analyze domain authority. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getDAGrade = (da: number) => {
        if (da >= 70) return { grade: 'Excellent', color: 'text-green-400' };
        if (da >= 50) return { grade: 'Good', color: 'text-blue-400' };
        if (da >= 30) return { grade: 'Average', color: 'text-yellow-400' };
        return { grade: 'Needs Work', color: 'text-red-400' };
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6 rounded-2xl border border-purple-500/30">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-500/20 rounded-xl">
                        <Award className="w-10 h-10 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Authority Score Checker</h1>
                        <p className="text-gray-400">Analyze domain authority, backlinks, and competitive positioning</p>
                    </div>
                </div>
            </div>

            {/* Search Form */}
            <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="Enter domain (e.g., example.com)"
                            className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && analyzeAuthority()}
                        />
                    </div>
                    <button
                        onClick={analyzeAuthority}
                        disabled={loading || !domain.trim()}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Check Authority
                            </>
                        )}
                    </button>
                </div>
                {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Authority Scores */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                        <div className="flex flex-col items-center mb-8">
                            <h2 className="text-xl font-bold text-white mb-6">Authority Metrics</h2>
                            <div className="flex flex-wrap justify-center gap-8">
                                <AuthorityGauge value={result.domainAuthority} max={100} label="Domain Authority" color="#8B5CF6" />
                                <AuthorityGauge value={result.pageAuthority} max={100} label="Page Authority" color="#06B6D4" />
                                <AuthorityGauge value={result.trustFlow} max={100} label="Trust Flow" color="#10B981" />
                                <AuthorityGauge value={result.citationFlow} max={100} label="Citation Flow" color="#F59E0B" />
                            </div>
                        </div>
                        <div className="text-center">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getDAGrade(result.domainAuthority).color} bg-gray-800`}>
                                <Star className="w-4 h-4" />
                                {getDAGrade(result.domainAuthority).grade} Domain Authority
                            </span>
                        </div>
                    </div>

                    {/* Spam Score Warning */}
                    {result.spamScore > 10 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
                            <Shield className="w-8 h-8 text-red-400" />
                            <div>
                                <h4 className="font-semibold text-red-400">High Spam Score Detected</h4>
                                <p className="text-sm text-gray-400">Spam score of {result.spamScore}% - Consider reviewing backlink profile</p>
                            </div>
                        </div>
                    )}

                    {/* Backlink Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Link2 className="w-5 h-5 text-blue-400" />}
                            label="Total Backlinks"
                            value={formatNumber(result.backlinks.total)}
                            color="blue"
                        />
                        <StatCard
                            icon={<Zap className="w-5 h-5 text-green-400" />}
                            label="Dofollow Links"
                            value={formatNumber(result.backlinks.dofollow)}
                            subtext={`${Math.round((result.backlinks.dofollow / result.backlinks.total) * 100)}% of total`}
                            color="green"
                        />
                        <StatCard
                            icon={<Shield className="w-5 h-5 text-yellow-400" />}
                            label="Nofollow Links"
                            value={formatNumber(result.backlinks.nofollow)}
                            color="yellow"
                        />
                        <StatCard
                            icon={<Users className="w-5 h-5 text-purple-400" />}
                            label="Referring Domains"
                            value={formatNumber(result.backlinks.referring)}
                            color="purple"
                        />
                    </div>

                    {/* Top Backlinks */}
                    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Top Backlinks
                        </h3>
                        <div className="space-y-3">
                            {result.topBacklinks.map((link, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-white">{link.source}</p>
                                            <p className="text-xs text-gray-500">Anchor: {link.anchor}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
                                            DA: {link.da}
                                        </span>
                                        <ExternalLink className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Competitor Analysis */}
                    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-orange-400" />
                            Competitor Comparison
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center">
                                        <Star className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <span className="font-medium text-white">{domain}</span>
                                    <span className="text-xs text-indigo-400">(Your Domain)</span>
                                </div>
                                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full font-bold">
                                    DA: {result.domainAuthority}
                                </span>
                            </div>
                            {result.competitors.map((comp, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-400">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium text-white">{comp.domain}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <TrendIcon trend={comp.trend} />
                                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                                            DA: {comp.da}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Historical DA Chart */}
                    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-cyan-400" />
                            Authority Trend (6 Months)
                        </h3>
                        <div className="flex items-end justify-between h-32 gap-2">
                            {result.historicalDA.map((item, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                                        style={{ height: `${(item.score / 100) * 100}%` }}
                                    />
                                    <span className="text-xs text-gray-500 truncate max-w-full">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
