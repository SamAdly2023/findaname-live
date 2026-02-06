import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Globe,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    TrendingUp,
    FileText,
    Link2,
    Image,
    Smartphone,
    Zap,
    RefreshCw,
    ExternalLink,
    BarChart3,
    Target,
    Clock,
    Shield
} from 'lucide-react';

interface SeoResult {
    overallScore: number;
    grade: string;
    metrics: {
        titleTag: { score: number; status: 'good' | 'warning' | 'error'; message: string };
        metaDescription: { score: number; status: 'good' | 'warning' | 'error'; message: string };
        headings: { score: number; status: 'good' | 'warning' | 'error'; message: string };
        mobileResponsive: { score: number; status: 'good' | 'warning' | 'error'; message: string };
        pageSpeed: { score: number; status: 'good' | 'warning' | 'error'; message: string; loadTime: string };
        ssl: { score: number; status: 'good' | 'warning' | 'error'; message: string };
        contentLength: { score: number; status: 'good' | 'warning' | 'error'; message: string; wordCount: number };
        internalLinks: { score: number; status: 'good' | 'warning' | 'error'; message: string; count: number };
        externalLinks: { score: number; status: 'good' | 'warning' | 'error'; message: string; count: number };
        images: { score: number; status: 'good' | 'warning' | 'error'; message: string; total: number; withAlt: number };
    };
    recommendations: string[];
}

const ScoreCircle: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ score, size = 'md' }) => {
    const getColor = () => {
        if (score >= 80) return { stroke: 'stroke-green-500', text: 'text-green-400' };
        if (score >= 60) return { stroke: 'stroke-yellow-500', text: 'text-yellow-400' };
        if (score >= 40) return { stroke: 'stroke-orange-500', text: 'text-orange-400' };
        return { stroke: 'stroke-red-500', text: 'text-red-400' };
    };

    const sizeConfig = {
        sm: { width: 60, strokeWidth: 4, fontSize: 'text-lg' },
        md: { width: 100, strokeWidth: 6, fontSize: 'text-3xl' },
        lg: { width: 140, strokeWidth: 8, fontSize: 'text-5xl' }
    };

    const { width, strokeWidth, fontSize } = sizeConfig[size];
    const { stroke, text } = getColor();
    const radius = (width - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={width} height={width} className="-rotate-90">
                <circle
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-700"
                />
                <circle
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${stroke} transition-all duration-1000`}
                />
            </svg>
            <span className={`absolute ${fontSize} font-bold ${text}`}>{score}</span>
        </div>
    );
};

const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    score: number;
    status: 'good' | 'warning' | 'error';
    message: string;
    extra?: React.ReactNode;
}> = ({ icon, title, score, status, message, extra }) => {
    const statusConfig = {
        good: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2, color: 'text-green-400' },
        warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle, color: 'text-yellow-400' },
        error: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle, color: 'text-red-400' }
    };

    const { bg, border, icon: StatusIcon, color } = statusConfig[status];

    return (
        <div className={`${bg} border ${border} rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 rounded-lg">{icon}</div>
                    <div>
                        <h4 className="font-semibold text-white">{title}</h4>
                        <p className="text-sm text-gray-400">{message}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${color}`}>{score}/100</span>
                    <StatusIcon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            {extra && <div className="mt-2 pt-2 border-t border-gray-700">{extra}</div>}
        </div>
    );
};

export const SeoScoreTool: React.FC = () => {
    const { user, canSearch, recordSearch } = useAuth();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SeoResult | null>(null);
    const [error, setError] = useState('');

    const analyzeSeo = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to analyze');
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
            // Simulate API call - replace with actual SEO API integration
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Mock SEO analysis result
            const mockResult: SeoResult = {
                overallScore: Math.floor(Math.random() * 30) + 65,
                grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
                metrics: {
                    titleTag: {
                        score: Math.floor(Math.random() * 20) + 80,
                        status: 'good',
                        message: 'Title tag is well-optimized (55 characters)'
                    },
                    metaDescription: {
                        score: Math.floor(Math.random() * 30) + 60,
                        status: 'warning',
                        message: 'Meta description could be improved (120 characters)'
                    },
                    headings: {
                        score: Math.floor(Math.random() * 20) + 80,
                        status: 'good',
                        message: 'Proper H1-H6 hierarchy detected'
                    },
                    mobileResponsive: {
                        score: Math.floor(Math.random() * 10) + 90,
                        status: 'good',
                        message: 'Site is fully mobile responsive'
                    },
                    pageSpeed: {
                        score: Math.floor(Math.random() * 40) + 50,
                        status: 'warning',
                        message: 'Page could load faster',
                        loadTime: `${(Math.random() * 2 + 1).toFixed(2)}s`
                    },
                    ssl: {
                        score: 100,
                        status: 'good',
                        message: 'SSL certificate is valid and secure'
                    },
                    contentLength: {
                        score: Math.floor(Math.random() * 30) + 70,
                        status: 'good',
                        message: 'Content length is adequate',
                        wordCount: Math.floor(Math.random() * 1500) + 500
                    },
                    internalLinks: {
                        score: Math.floor(Math.random() * 30) + 60,
                        status: 'warning',
                        message: 'Consider adding more internal links',
                        count: Math.floor(Math.random() * 20) + 5
                    },
                    externalLinks: {
                        score: Math.floor(Math.random() * 20) + 70,
                        status: 'good',
                        message: 'Good mix of external references',
                        count: Math.floor(Math.random() * 10) + 2
                    },
                    images: {
                        score: Math.floor(Math.random() * 40) + 50,
                        status: 'warning',
                        message: 'Some images missing alt text',
                        total: Math.floor(Math.random() * 15) + 5,
                        withAlt: Math.floor(Math.random() * 10) + 3
                    }
                },
                recommendations: [
                    'Add more descriptive meta description (150-160 characters)',
                    'Optimize images for faster loading',
                    'Add alt text to all images',
                    'Increase internal linking structure',
                    'Consider adding structured data markup'
                ]
            };

            setResult(mockResult);
            recordSearch(url, 'SEO Score');
        } catch (err) {
            setError('Failed to analyze SEO. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 p-6 rounded-2xl border border-green-500/30">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-500/20 rounded-xl">
                        <BarChart3 className="w-10 h-10 text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">SEO Score Analyzer</h1>
                        <p className="text-gray-400">Comprehensive on-page SEO analysis and recommendations</p>
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
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter website URL (e.g., example.com)"
                            className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && analyzeSeo()}
                        />
                    </div>
                    <button
                        onClick={analyzeSeo}
                        disabled={loading || !url.trim()}
                        className="px-8 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Analyze SEO
                            </>
                        )}
                    </button>
                </div>
                {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <ScoreCircle score={result.overallScore} size="lg" />
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-bold text-white mb-2">Overall SEO Score</h2>
                                <p className="text-gray-400 mb-4">
                                    Your website scores <span className={result.overallScore >= 70 ? 'text-green-400' : 'text-yellow-400'}>{result.overallScore}/100</span> in SEO optimization
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                        Grade: {result.grade}
                                    </span>
                                    <a
                                        href={url.startsWith('http') ? url : `https://${url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm flex items-center gap-1 hover:bg-gray-600"
                                    >
                                        <ExternalLink className="w-3 h-3" /> View Site
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MetricCard
                            icon={<FileText className="w-5 h-5 text-blue-400" />}
                            title="Title Tag"
                            score={result.metrics.titleTag.score}
                            status={result.metrics.titleTag.status}
                            message={result.metrics.titleTag.message}
                        />
                        <MetricCard
                            icon={<FileText className="w-5 h-5 text-purple-400" />}
                            title="Meta Description"
                            score={result.metrics.metaDescription.score}
                            status={result.metrics.metaDescription.status}
                            message={result.metrics.metaDescription.message}
                        />
                        <MetricCard
                            icon={<Target className="w-5 h-5 text-indigo-400" />}
                            title="Headings Structure"
                            score={result.metrics.headings.score}
                            status={result.metrics.headings.status}
                            message={result.metrics.headings.message}
                        />
                        <MetricCard
                            icon={<Smartphone className="w-5 h-5 text-cyan-400" />}
                            title="Mobile Responsive"
                            score={result.metrics.mobileResponsive.score}
                            status={result.metrics.mobileResponsive.status}
                            message={result.metrics.mobileResponsive.message}
                        />
                        <MetricCard
                            icon={<Zap className="w-5 h-5 text-yellow-400" />}
                            title="Page Speed"
                            score={result.metrics.pageSpeed.score}
                            status={result.metrics.pageSpeed.status}
                            message={result.metrics.pageSpeed.message}
                            extra={
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">Load time: {result.metrics.pageSpeed.loadTime}</span>
                                </div>
                            }
                        />
                        <MetricCard
                            icon={<Shield className="w-5 h-5 text-green-400" />}
                            title="SSL Security"
                            score={result.metrics.ssl.score}
                            status={result.metrics.ssl.status}
                            message={result.metrics.ssl.message}
                        />
                        <MetricCard
                            icon={<FileText className="w-5 h-5 text-orange-400" />}
                            title="Content Length"
                            score={result.metrics.contentLength.score}
                            status={result.metrics.contentLength.status}
                            message={result.metrics.contentLength.message}
                            extra={
                                <span className="text-sm text-gray-400">{result.metrics.contentLength.wordCount} words</span>
                            }
                        />
                        <MetricCard
                            icon={<Link2 className="w-5 h-5 text-pink-400" />}
                            title="Internal Links"
                            score={result.metrics.internalLinks.score}
                            status={result.metrics.internalLinks.status}
                            message={result.metrics.internalLinks.message}
                            extra={
                                <span className="text-sm text-gray-400">{result.metrics.internalLinks.count} links found</span>
                            }
                        />
                        <MetricCard
                            icon={<ExternalLink className="w-5 h-5 text-teal-400" />}
                            title="External Links"
                            score={result.metrics.externalLinks.score}
                            status={result.metrics.externalLinks.status}
                            message={result.metrics.externalLinks.message}
                            extra={
                                <span className="text-sm text-gray-400">{result.metrics.externalLinks.count} links found</span>
                            }
                        />
                        <MetricCard
                            icon={<Image className="w-5 h-5 text-rose-400" />}
                            title="Image Optimization"
                            score={result.metrics.images.score}
                            status={result.metrics.images.status}
                            message={result.metrics.images.message}
                            extra={
                                <span className="text-sm text-gray-400">
                                    {result.metrics.images.withAlt}/{result.metrics.images.total} images have alt text
                                </span>
                            }
                        />
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Recommendations for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
