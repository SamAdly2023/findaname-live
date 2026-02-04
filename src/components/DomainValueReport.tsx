
// ==========================================
// DOMAIN VALUE REPORT - COMPREHENSIVE MARKET INTELLIGENCE
// Domain Intelligence Hub v2.0
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { generateMarketAnalysis, generateWhoisHistory, generateSpamRiskReport } from '../services/geminiService';
import { checkSocialHandles, prepareGHLPayload, deployToGHL, validateGHLWebhook } from '../services/socialCheckAPI';
import {
    MarketAnalysis,
    SocialCheckResult,
    WhoisHistorySummary,
    SpamRiskReport,
    SEORiskIntelligence,
    GHLDeploymentResult
} from '../types';
import { ProgressBar } from './ProgressBar';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Lucide Icons
import {
    Download,
    TrendingUp,
    DollarSign,
    ShieldAlert,
    Activity,
    Search,
    Target,
    Zap,
    BarChart3,
    Globe,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Rocket,
    Send,
    History,
    Shield,
    Award,
    Gauge,
    Users,
    Sparkles,
    Info,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Link2
} from 'lucide-react';

interface Props {
    domain: string;
    onCreditsUsed?: () => void;
}

// Progress indicator component
const MetricBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({
    value, max, color, label
}) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-300 font-medium">{value}/{max}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Score badge component
const ScoreBadge: React.FC<{
    score: number;
    maxScore: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}> = ({ score, maxScore, size = 'md', showLabel = true }) => {
    const percentage = (score / maxScore) * 100;
    const getColor = () => {
        if (percentage >= 80) return 'from-green-500 to-emerald-500';
        if (percentage >= 60) return 'from-blue-500 to-cyan-500';
        if (percentage >= 40) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-14 h-14 text-lg',
        lg: 'w-20 h-20 text-2xl'
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getColor()} flex items-center justify-center font-bold text-white shadow-lg`}>
                {score}
            </div>
            {showLabel && <span className="text-xs text-gray-400">/ {maxScore}</span>}
        </div>
    );
};

// Risk level badge
const RiskBadge: React.FC<{ level: string; score?: number }> = ({ level, score }) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        'Low': { bg: 'bg-green-500/20 border-green-500/30', text: 'text-green-400', icon: <CheckCircle2 size={14} /> },
        'Safe': { bg: 'bg-green-500/20 border-green-500/30', text: 'text-green-400', icon: <CheckCircle2 size={14} /> },
        'Medium': { bg: 'bg-yellow-500/20 border-yellow-500/30', text: 'text-yellow-400', icon: <AlertTriangle size={14} /> },
        'High': { bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-400', icon: <XCircle size={14} /> },
        'Critical': { bg: 'bg-red-600/30 border-red-600/50', text: 'text-red-300', icon: <ShieldAlert size={14} /> },
    };

    const { bg, text, icon } = config[level] || config['Medium'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${bg} ${text} text-xs font-semibold`}>
            {icon} {level} {score !== undefined && `(${score}%)`}
        </span>
    );
};

// Collapsible section
const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    iconColor: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, icon, iconColor, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-700 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
                <div className={`flex items-center gap-3 ${iconColor}`}>
                    {icon}
                    <span className="font-semibold text-white">{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isOpen && <div className="p-4 bg-gray-900/30">{children}</div>}
        </div>
    );
};

export const DomainValueReport: React.FC<Props> = ({ domain, onCreditsUsed }) => {
    // State management
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [socialResult, setSocialResult] = useState<SocialCheckResult | null>(null);
    const [whoisHistory, setWhoisHistory] = useState<WhoisHistorySummary | null>(null);
    const [spamReport, setSpamReport] = useState<SpamRiskReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingPhase, setLoadingPhase] = useState('');
    const [progress, setProgress] = useState(0);

    // GHL Integration state
    const [ghlWebhookUrl, setGhlWebhookUrl] = useState('');
    const [ghlDeploying, setGhlDeploying] = useState(false);
    const [ghlResult, setGhlResult] = useState<GHLDeploymentResult | null>(null);
    const [showGhlConfig, setShowGhlConfig] = useState(false);

    // Copy state
    const [copied, setCopied] = useState(false);

    const { canSearch, recordSearch, user } = useAuth();

    // Fetch all intelligence data
    useEffect(() => {
        const fetchIntelligence = async () => {
            if (!domain) return;

            // Check credits before proceeding
            if (!canSearch()) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setProgress(0);

            try {
                // Phase 1: Market Analysis
                setLoadingPhase('Analyzing market data...');
                setProgress(15);
                const marketData = await generateMarketAnalysis(domain);
                setAnalysis(marketData);
                setProgress(40);

                // Phase 2: Social Handles
                setLoadingPhase('Checking social availability...');
                const socialData = await checkSocialHandles(domain);
                setSocialResult(socialData);
                setProgress(60);

                // Phase 3: WHOIS History
                setLoadingPhase('Retrieving ownership history...');
                const historyData = await generateWhoisHistory(domain);
                setWhoisHistory(historyData);
                setProgress(80);

                // Phase 4: Spam Risk
                setLoadingPhase('Assessing risk factors...');
                const spamData = await generateSpamRiskReport(domain);
                setSpamReport(spamData);
                setProgress(100);

                // Record the search
                recordSearch(domain, 'Domain Intelligence Report');
                onCreditsUsed?.();

            } catch (error) {
                console.error('Error fetching domain intelligence:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIntelligence();
    }, [domain]);

    // Export comprehensive PDF report
    const exportPDF = useCallback(() => {
        if (!analysis) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // ===== HEADER =====
        doc.setFillColor(17, 24, 39); // gray-900
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setFontSize(24);
        doc.setTextColor(59, 130, 246); // blue-500
        doc.text('Domain Intelligence Report', 14, 20);

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(domain, 14, 32);

        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text(`Generated: ${new Date().toLocaleDateString()} | FindAName.live`, 14, 40);

        // ===== EXECUTIVE SUMMARY =====
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94); // green-500
        doc.text('Executive Summary', 14, 55);

        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text([
            `Estimated Value: $${analysis.estimatedValue.toLocaleString()} (${analysis.valueRange ? `$${analysis.valueRange.min.toLocaleString()} - $${analysis.valueRange.max.toLocaleString()}` : 'Range N/A'})`,
            `Brandability Score: ${analysis.brandability.score}/10`,
            `Liquidity Rating: ${analysis.liquidity.rating}`,
            `Risk Level: ${analysis.spamRisk.level}`,
            `Confidence: ${analysis.confidence || 75}%`
        ], 14, 65);

        // ===== BRANDABILITY BREAKDOWN =====
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text('Brandability Analysis', 14, 100);

        autoTable(doc, {
            startY: 105,
            head: [['Metric', 'Score', 'Max']],
            body: [
                ['Overall Score', analysis.brandability.score.toString(), '10'],
                ['Length Score', (analysis.brandability.lengthScore || 7).toString(), '10'],
                ['Phonetic Score', (analysis.brandability.phoneticScore || 7).toString(), '10'],
                ['Extension Value', (analysis.brandability.extensionScore || 8).toString(), '10'],
                ['Memorability', (analysis.brandability.memorabilityScore || 7).toString(), '10'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
        });

        // ===== COMPARABLE SALES =====
        const compsY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(234, 179, 8); // yellow-500
        doc.text('Comparable Sales', 14, compsY);

        autoTable(doc, {
            startY: compsY + 5,
            head: [['Domain', 'Sale Price', 'Date', 'Similarity']],
            body: analysis.comps.map(c => [
                c.domain,
                `$${c.price.toLocaleString()}`,
                c.date,
                c.similarity ? `${c.similarity}%` : 'N/A'
            ]),
            theme: 'striped',
            headStyles: { fillColor: [234, 179, 8] },
        });

        // ===== SEO METRICS =====
        const seoY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(168, 85, 247); // purple-500
        doc.text('SEO Intelligence', 14, seoY);

        autoTable(doc, {
            startY: seoY + 5,
            head: [['Metric', 'Value']],
            body: [
                ['Monthly Search Volume', analysis.seoPotential.searchVolume],
                ['Cost Per Click (CPC)', analysis.seoPotential.cpc],
                ['Keyword Difficulty', analysis.seoPotential.keywordDifficulty],
                ['Competition Level', analysis.seoPotential.competitionLevel || 'Medium'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [168, 85, 247] },
        });

        // ===== RISK ASSESSMENT =====
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68); // red-500
        doc.text('Risk Assessment', 14, 20);

        autoTable(doc, {
            startY: 25,
            head: [['Factor', 'Status']],
            body: [
                ['Overall Risk Level', analysis.spamRisk.level],
                ['Risk Score', `${analysis.spamRisk.score}/100`],
                ...analysis.spamRisk.factors.map(f => ['Risk Factor', f]),
            ],
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68] },
        });

        // ===== SOCIAL AVAILABILITY =====
        if (socialResult) {
            const socialY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.setTextColor(236, 72, 153); // pink-500
            doc.text('Social Handle Availability', 14, socialY);

            autoTable(doc, {
                startY: socialY + 5,
                head: [['Platform', 'Handle', 'Status']],
                body: socialResult.platforms.map(p => [
                    p.platform,
                    `@${p.handle}`,
                    p.available === true ? '✓ Available' : p.available === false ? '✗ Taken' : '? Unknown'
                ]),
                theme: 'striped',
                headStyles: { fillColor: [236, 72, 153] },
            });
        }

        // ===== FOOTER =====
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(
                `Page ${i} of ${pageCount} | FindAName.live Domain Intelligence Hub | Confidential`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`${domain}-intelligence-report.pdf`);
    }, [analysis, socialResult, domain]);

    // Deploy to GoHighLevel
    const handleGHLDeploy = async () => {
        if (!analysis || !ghlWebhookUrl) return;

        if (!validateGHLWebhook(ghlWebhookUrl)) {
            setGhlResult({
                success: false,
                message: 'Invalid GoHighLevel webhook URL. Please check the format.',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        setGhlDeploying(true);

        const seoIntelligence: SEORiskIntelligence = {
            domain,
            whoisHistory: whoisHistory || {
                domain,
                totalOwnerChanges: 0,
                registrationAge: 'Unknown',
                history: [],
                hasDropHistory: false,
                stabilityScore: 50,
            },
            waybackData: {
                domain,
                archiveUrl: `https://web.archive.org/web/*/${domain}`,
                totalSnapshots: 0,
                hasHistory: false,
            },
            spamRisk: spamReport || {
                domain,
                overallScore: analysis.spamRisk.score,
                riskLevel: analysis.spamRisk.level === 'Low' ? 'Safe' : analysis.spamRisk.level === 'Medium' ? 'Low Risk' : 'High Risk',
                blacklistResults: [],
                spamIndicators: [],
                contentFlags: [],
                recommendations: [],
                lastUpdated: new Date().toISOString(),
            },
            overallHealthScore: 100 - analysis.spamRisk.score,
            healthGrade: analysis.spamRisk.score < 20 ? 'A' : analysis.spamRisk.score < 40 ? 'B' : analysis.spamRisk.score < 60 ? 'C' : 'D',
        };

        const payload = prepareGHLPayload(
            domain,
            analysis,
            socialResult || { handle: domain, platforms: [], overallAvailability: 0, recommendations: [], checkedAt: new Date().toISOString() },
            seoIntelligence
        );

        const result = await deployToGHL(payload, { webhookUrl: ghlWebhookUrl });
        setGhlResult(result);
        setGhlDeploying(false);
    };

    // Copy domain to clipboard
    const copyDomain = () => {
        navigator.clipboard.writeText(domain);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-xl w-full max-w-5xl mx-auto mt-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                            <Zap className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Generating Intelligence Report</h3>
                            <p className="text-gray-400">{loadingPhase}</p>
                        </div>
                    </div>
                    <ProgressBar progress={progress} text={`${progress}% Complete`} />
                    <div className="grid grid-cols-4 gap-3">
                        {['Market Analysis', 'Social Handles', 'WHOIS History', 'Risk Assessment'].map((phase, i) => (
                            <div key={phase} className={`p-3 rounded-lg border ${progress >= (i + 1) * 25 ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-900/50 border-gray-700'}`}>
                                <p className={`text-xs font-medium ${progress >= (i + 1) * 25 ? 'text-green-400' : 'text-gray-500'}`}>{phase}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Credits check
    if (!canSearch() && !analysis) {
        return (
            <div className="bg-gray-800 border border-red-500/30 rounded-xl p-8 shadow-xl w-full max-w-5xl mx-auto mt-8 text-center">
                <ShieldAlert className="text-red-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Credits Required</h3>
                <p className="text-gray-400 mb-4">
                    You've used all your available credits. Upgrade to Pro for unlimited searches.
                </p>
                <div className="text-sm text-gray-500">
                    Credits Remaining: {user?.credits || 0} / {user?.plan === 'pro' ? '∞' : '3'}
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                <AlertTriangle className="text-yellow-500 mx-auto mb-4" size={48} />
                <p className="text-gray-400">Unable to generate analysis. Please try again.</p>
            </div>
        );
    }

    const waybackUrl = `https://web.archive.org/web/*/${domain}`;

    return (
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto mt-8 overflow-hidden animate-fade-in">

            {/* ===== HEADER SECTION ===== */}
            <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 p-6 border-b border-gray-700">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* Domain Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Globe className="text-white" size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl lg:text-3xl font-bold text-white">{domain}</h2>
                                <button onClick={copyDomain} className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-400" />}
                                </button>
                            </div>
                            <p className="text-gray-400 flex items-center gap-2 mt-1">
                                <Clock size={14} /> Generated {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Value & Actions */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Value Card */}
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 p-4 rounded-xl">
                            <p className="text-xs text-green-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <DollarSign size={12} /> Estimated Value
                            </p>
                            <p className="text-3xl font-bold text-white">${analysis.estimatedValue.toLocaleString()}</p>
                            {analysis.valueRange && (
                                <p className="text-xs text-green-400/70 mt-1">
                                    Range: ${analysis.valueRange.min.toLocaleString()} - ${analysis.valueRange.max.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={exportPDF}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
                            >
                                <Download size={18} /> Download PDF
                            </button>
                            <button
                                onClick={() => setShowGhlConfig(!showGhlConfig)}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2.5 rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
                            >
                                <Rocket size={18} /> Deploy to GHL
                            </button>
                        </div>
                    </div>
                </div>

                {/* GHL Configuration Panel */}
                {showGhlConfig && (
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-purple-500/30 animate-fade-in">
                        <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                            <Link2 size={16} /> GoHighLevel Webhook Integration
                        </h4>
                        <div className="flex gap-3">
                            <input
                                type="url"
                                value={ghlWebhookUrl}
                                onChange={(e) => setGhlWebhookUrl(e.target.value)}
                                placeholder="https://hooks.leadconnectorhq.com/webhook/..."
                                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                            />
                            <button
                                onClick={handleGHLDeploy}
                                disabled={ghlDeploying || !ghlWebhookUrl}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                {ghlDeploying ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> Send Data
                                    </>
                                )}
                            </button>
                        </div>
                        {ghlResult && (
                            <div className={`mt-3 p-3 rounded-lg ${ghlResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                <p className={`text-sm ${ghlResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {ghlResult.success ? <CheckCircle2 className="inline mr-2" size={14} /> : <XCircle className="inline mr-2" size={14} />}
                                    {ghlResult.message}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="p-6 space-y-6">

                {/* ===== KEY METRICS GRID ===== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Brandability */}
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-blue-400 flex items-center gap-2 text-sm font-medium">
                                <Target size={16} /> Brandability
                            </span>
                            <ScoreBadge score={analysis.brandability.score} maxScore={10} size="sm" />
                        </div>
                        <div className="space-y-2">
                            <MetricBar value={analysis.brandability.lengthScore || 7} max={10} color="bg-blue-500" label="Length" />
                            <MetricBar value={analysis.brandability.phoneticScore || 7} max={10} color="bg-cyan-500" label="Phonetics" />
                            <MetricBar value={analysis.brandability.extensionScore || 8} max={10} color="bg-indigo-500" label="Extension" />
                        </div>
                    </div>

                    {/* SEO Potential */}
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all">
                        <div className="flex items-center gap-2 mb-3 text-purple-400">
                            <Search size={16} />
                            <span className="text-sm font-medium">SEO Potential</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Search Vol</span>
                                <span className="text-white font-semibold text-sm">{analysis.seoPotential.searchVolume}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">CPC</span>
                                <span className="text-green-400 font-semibold text-sm">{analysis.seoPotential.cpc}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Difficulty</span>
                                <span className="text-yellow-400 font-semibold text-sm">{analysis.seoPotential.keywordDifficulty}</span>
                            </div>
                        </div>
                    </div>

                    {/* Liquidity */}
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-all">
                        <div className="flex items-center gap-2 mb-3 text-green-400">
                            <Activity size={16} />
                            <span className="text-sm font-medium">Liquidity</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Rating</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${analysis.liquidity.rating === 'High' || analysis.liquidity.rating === 'Very High'
                                        ? 'bg-green-500/20 text-green-300'
                                        : analysis.liquidity.rating === 'Medium'
                                            ? 'bg-yellow-500/20 text-yellow-300'
                                            : 'bg-red-500/20 text-red-300'
                                    }`}>
                                    {analysis.liquidity.rating}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Days to Sell</span>
                                <span className="text-white text-sm">{analysis.liquidity.estimatedDaysToSell || '30-90'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Market</span>
                                <span className="text-white text-sm">{analysis.liquidity.marketDemand || 'Warm'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Risk Level */}
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-red-500/50 transition-all">
                        <div className="flex items-center gap-2 mb-3 text-red-400">
                            <ShieldAlert size={16} />
                            <span className="text-sm font-medium">Risk Assessment</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-2">
                            <RiskBadge level={analysis.spamRisk.level} score={analysis.spamRisk.score} />
                            <div className="w-full mt-3">
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${analysis.spamRisk.score < 30 ? 'bg-green-500' :
                                                analysis.spamRisk.score < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${analysis.spamRisk.score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== COMPARABLE SALES ===== */}
                <CollapsibleSection
                    title="Comparable Sales"
                    icon={<TrendingUp size={20} />}
                    iconColor="text-yellow-400"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Domain</th>
                                    <th className="px-4 py-3 font-medium">Sale Price</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Source</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg">Similarity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {analysis.comps.length > 0 ? analysis.comps.map((comp, i) => (
                                    <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{comp.domain}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${comp.price.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-400">{comp.date}</td>
                                        <td className="px-4 py-3 text-gray-500">{comp.source || 'NameBio'}</td>
                                        <td className="px-4 py-3">
                                            {comp.similarity && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${comp.similarity}%` }} />
                                                    </div>
                                                    <span className="text-gray-400 text-xs">{comp.similarity}%</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                            No comparable sales data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CollapsibleSection>

                {/* ===== BRANDABILITY DEEP DIVE ===== */}
                <CollapsibleSection
                    title="Brandability Deep Dive"
                    icon={<Award size={20} />}
                    iconColor="text-blue-400"
                    defaultOpen={false}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Score Breakdown */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <BarChart3 size={14} /> Score Breakdown
                            </h4>
                            <div className="space-y-3">
                                <MetricBar value={analysis.brandability.lengthScore || 7} max={10} color="bg-blue-500" label="Name Length (6-10 chars ideal)" />
                                <MetricBar value={analysis.brandability.phoneticScore || 7} max={10} color="bg-purple-500" label="Phonetic Appeal (easy to say)" />
                                <MetricBar value={analysis.brandability.extensionScore || 8} max={10} color="bg-green-500" label="TLD Value (.com = 10)" />
                                <MetricBar value={analysis.brandability.uniquenessScore || 6} max={10} color="bg-yellow-500" label="Uniqueness (distinctive)" />
                                <MetricBar value={analysis.brandability.memorabilityScore || 7} max={10} color="bg-pink-500" label="Memorability (recall ease)" />
                                <MetricBar value={analysis.brandability.spellabilityScore || 8} max={10} color="bg-cyan-500" label="Spellability (no typos)" />
                            </div>
                        </div>

                        {/* Analysis */}
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <Sparkles size={14} /> AI Analysis
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{analysis.brandability.reasoning}</p>

                            {analysis.marketTrends && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Market Trends</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">TLD Growth</span>
                                            <span className="text-gray-300">{analysis.marketTrends.tldGrowth}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Industry Demand</span>
                                            <span className="text-gray-300">{analysis.marketTrends.industryDemand}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Price Direction</span>
                                            <span className={`font-medium ${analysis.marketTrends.priceDirection === 'Rising' ? 'text-green-400' :
                                                    analysis.marketTrends.priceDirection === 'Declining' ? 'text-red-400' : 'text-gray-400'
                                                }`}>
                                                {analysis.marketTrends.priceDirection}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                {/* ===== SEO INTELLIGENCE ===== */}
                <CollapsibleSection
                    title="SEO Intelligence"
                    icon={<Search size={20} />}
                    iconColor="text-purple-400"
                    defaultOpen={false}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Searches</p>
                            <p className="text-2xl font-bold text-white">{analysis.seoPotential.searchVolume}</p>
                            <p className="text-xs text-gray-400 mt-1">Estimated monthly search volume</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cost Per Click</p>
                            <p className="text-2xl font-bold text-green-400">{analysis.seoPotential.cpc}</p>
                            <p className="text-xs text-gray-400 mt-1">Average Google Ads CPC</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Keyword Difficulty</p>
                            <p className="text-2xl font-bold text-yellow-400">{analysis.seoPotential.keywordDifficulty}</p>
                            <p className="text-xs text-gray-400 mt-1">Competition level for ranking</p>
                        </div>
                    </div>

                    {analysis.seoPotential.relatedKeywords && analysis.seoPotential.relatedKeywords.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Related Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                                {analysis.seoPotential.relatedKeywords.map((kw, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-xs">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CollapsibleSection>

                {/* ===== SOCIAL AVAILABILITY ===== */}
                {socialResult && (
                    <CollapsibleSection
                        title={`Social Handle Availability (${socialResult.overallAvailability}%)`}
                        icon={<Users size={20} />}
                        iconColor="text-pink-400"
                        defaultOpen={false}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {socialResult.platforms.map((platform) => (
                                <a
                                    key={platform.platform}
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-4 rounded-lg border transition-all hover:scale-105 ${platform.available === true
                                            ? 'bg-green-500/10 border-green-500/30 hover:border-green-500'
                                            : platform.available === false
                                                ? 'bg-red-500/10 border-red-500/30 hover:border-red-500'
                                                : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-white">{platform.platform}</span>
                                        {platform.available === true ? (
                                            <CheckCircle2 size={16} className="text-green-400" />
                                        ) : platform.available === false ? (
                                            <XCircle size={16} className="text-red-400" />
                                        ) : (
                                            <Info size={16} className="text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">@{platform.handle}</p>
                                    <p className={`text-xs mt-1 ${platform.available === true ? 'text-green-400' :
                                            platform.available === false ? 'text-red-400' : 'text-gray-500'
                                        }`}>
                                        {platform.available === true ? 'Available' : platform.available === false ? 'Taken' : 'Check manually'}
                                    </p>
                                </a>
                            ))}
                        </div>

                        {socialResult.recommendations.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommendations</h5>
                                <ul className="space-y-1">
                                    {socialResult.recommendations.map((rec, i) => (
                                        <li key={i} className="text-sm text-gray-300">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CollapsibleSection>
                )}

                {/* ===== WHOIS HISTORY ===== */}
                {whoisHistory && (
                    <CollapsibleSection
                        title="Ownership History"
                        icon={<History size={20} />}
                        iconColor="text-cyan-400"
                        defaultOpen={false}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{whoisHistory.totalOwnerChanges}</p>
                                    <p className="text-xs text-gray-500">Owner Changes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{whoisHistory.registrationAge}</p>
                                    <p className="text-xs text-gray-500">Domain Age</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{whoisHistory.stabilityScore}/100</p>
                                    <p className="text-xs text-gray-500">Stability Score</p>
                                </div>
                            </div>
                            <a
                                href={waybackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                            >
                                View on Wayback Machine <ExternalLink size={14} />
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Event</th>
                                        <th className="px-4 py-3 font-medium">Change</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {whoisHistory.history.length > 0 ? whoisHistory.history.map((record, i) => (
                                        <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-300">{record.date}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.event === 'registration' ? 'bg-green-500/20 text-green-400' :
                                                        record.event === 'transfer' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            record.event === 'dns_update' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {record.event.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">{record.change}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                                No history records available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>
                )}

                {/* ===== RISK FACTORS ===== */}
                <CollapsibleSection
                    title="Risk Analysis"
                    icon={<Shield size={20} />}
                    iconColor="text-red-400"
                    defaultOpen={false}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Score */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${analysis.spamRisk.score < 30 ? 'bg-green-500/20 text-green-400 border-2 border-green-500' :
                                        analysis.spamRisk.score < 60 ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500' :
                                            'bg-red-500/20 text-red-400 border-2 border-red-500'
                                    }`}>
                                    {analysis.spamRisk.score}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white">{analysis.spamRisk.level} Risk</p>
                                    <p className="text-sm text-gray-400">
                                        {analysis.spamRisk.score < 30 ? 'This domain appears clean and safe.' :
                                            analysis.spamRisk.score < 60 ? 'Some caution advised. Review factors below.' :
                                                'High risk detected. Proceed with caution.'}
                                    </p>
                                </div>
                            </div>

                            {/* Blacklist Status */}
                            {analysis.spamRisk.blacklistStatus && (
                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Blacklist Status</h5>
                                    {analysis.spamRisk.blacklistStatus.listedOn.length > 0 ? (
                                        <div className="space-y-1">
                                            {analysis.spamRisk.blacklistStatus.listedOn.map((list, i) => (
                                                <p key={i} className="text-sm text-red-400 flex items-center gap-2">
                                                    <XCircle size={14} /> Listed on {list}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-green-400 flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Not listed on any major blacklists
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Risk Factors */}
                        <div className="space-y-4">
                            <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk Factors</h5>
                            {analysis.spamRisk.factors.length > 0 ? (
                                <ul className="space-y-2">
                                    {analysis.spamRisk.factors.map((factor, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                            <AlertTriangle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                            {factor}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No significant risk factors detected.</p>
                            )}

                            {analysis.spamRisk.recommendations && analysis.spamRisk.recommendations.length > 0 && (
                                <div className="mt-4">
                                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommendations</h5>
                                    <ul className="space-y-1">
                                        {analysis.spamRisk.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                                <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                {/* ===== FOOTER ===== */}
                <div className="border-t border-gray-700 pt-6 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <p className="text-gray-500 text-xs">
                                Report generated by FindAName.live Domain Intelligence Hub
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                                Confidence Level: {analysis.confidence || 75}% | Data may not reflect real-time market conditions
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportPDF}
                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Download size={16} /> Export PDF
                            </button>
                            <button
                                onClick={() => setShowGhlConfig(!showGhlConfig)}
                                className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium text-purple-300 transition-colors"
                            >
                                <Rocket size={16} /> Deploy to GHL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
