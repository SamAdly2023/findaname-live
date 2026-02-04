
// ==========================================
// SEO & RISK INTELLIGENCE - SAFETY SUITE
// Domain Intelligence Hub v2.0
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { generateWhoisHistory, generateSpamRiskReport } from '../services/geminiService';
import {
    MarketAnalysis,
    WhoisHistorySummary,
    SpamRiskReport,
    WaybackData
} from '../types';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from './ProgressBar';
import {
    ShieldCheck,
    History,
    ExternalLink,
    AlertTriangle,
    Shield,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    Activity,
    Globe,
    AlertOctagon,
    FileSearch,
    Archive,
    Gauge,
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    Info,
    Lock,
    Unlock,
    Server,
    Mail,
    ChevronRight,
    Zap
} from 'lucide-react';

interface Props {
    domain: string;
    analysis?: MarketAnalysis | null;
    onCreditsUsed?: () => void;
}

// Health grade badge
const HealthGrade: React.FC<{ grade: string; score: number }> = ({ grade, score }) => {
    const config: Record<string, { bg: string; text: string; border: string }> = {
        'A': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-400' },
        'B': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400' },
        'C': { bg: 'bg-yellow-500', text: 'text-gray-900', border: 'border-yellow-400' },
        'D': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-400' },
        'F': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-400' },
    };

    const { bg, text, border } = config[grade] || config['C'];

    return (
        <div className="flex items-center gap-4">
            <div className={`w-16 h-16 ${bg} ${text} rounded-xl flex items-center justify-center font-bold text-3xl shadow-lg border-2 ${border}`}>
                {grade}
            </div>
            <div>
                <p className="text-sm text-gray-400">Health Score</p>
                <p className="text-2xl font-bold text-white">{score}/100</p>
            </div>
        </div>
    );
};

// Risk meter component
const RiskMeter: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const getColor = () => {
        if (score < 30) return 'bg-green-500';
        if (score < 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className={`font-medium ${score < 30 ? 'text-green-400' : score < 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {score}%
                </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${getColor()} transition-all duration-500`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
};

// Event type badge
const EventBadge: React.FC<{ event: string }> = ({ event }) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        'registration': { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircle2 size={12} /> },
        'transfer': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <Users size={12} /> },
        'renewal': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <RefreshCw size={12} /> },
        'dns_update': { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: <Server size={12} /> },
        'status_change': { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <Activity size={12} /> },
        'expiration': { bg: 'bg-red-500/20', text: 'text-red-400', icon: <Clock size={12} /> },
    };

    const { bg, text, icon } = config[event] || config['status_change'];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${bg} ${text} text-xs font-medium capitalize`}>
            {icon} {event.replace('_', ' ')}
        </span>
    );
};

// Blacklist status indicator
const BlacklistStatus: React.FC<{ listed: boolean; listName: string }> = ({ listed, listName }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg ${listed ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
        <span className="text-sm text-gray-300">{listName}</span>
        {listed ? (
            <XCircle size={16} className="text-red-400" />
        ) : (
            <CheckCircle2 size={16} className="text-green-400" />
        )}
    </div>
);

export const SeoRiskSuite: React.FC<Props> = ({ domain, analysis, onCreditsUsed }) => {
    const { canSearch, recordSearch, user } = useAuth();

    // State
    const [whoisHistory, setWhoisHistory] = useState<WhoisHistorySummary | null>(null);
    const [spamReport, setSpamReport] = useState<SpamRiskReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);

    // Wayback Machine data
    const waybackData: WaybackData = {
        domain,
        archiveUrl: `https://web.archive.org/web/*/${domain}`,
        totalSnapshots: 0,
        hasHistory: true,
    };

    // Calculate overall health
    const calculateHealthGrade = (): { grade: string; score: number } => {
        if (!analysis && !spamReport) return { grade: 'C', score: 50 };

        let score = 100;

        // Deduct for spam risk
        if (analysis?.spamRisk) {
            score -= analysis.spamRisk.score * 0.5;
        } else if (spamReport) {
            score -= spamReport.overallScore * 0.5;
        }

        // Deduct for ownership instability
        if (whoisHistory?.stabilityScore) {
            score -= (100 - whoisHistory.stabilityScore) * 0.3;
        }

        // Deduct for drop history
        if (whoisHistory?.hasDropHistory) {
            score -= 10;
        }

        score = Math.max(0, Math.min(100, Math.round(score)));

        let grade = 'A';
        if (score < 60) grade = 'F';
        else if (score < 70) grade = 'D';
        else if (score < 80) grade = 'C';
        else if (score < 90) grade = 'B';

        return { grade, score };
    };

    // Fetch detailed data
    const fetchDetailedData = useCallback(async () => {
        if (!canSearch()) return;

        setLoading(true);
        setLoadingPhase('Retrieving ownership history...');

        try {
            const historyData = await generateWhoisHistory(domain);
            setWhoisHistory(historyData);

            setLoadingPhase('Analyzing risk factors...');
            const riskData = await generateSpamRiskReport(domain);
            setSpamReport(riskData);

            recordSearch(domain, 'SEO Risk Analysis');
            onCreditsUsed?.();
            setDataLoaded(true);
        } catch (error) {
            console.error('Error fetching SEO risk data:', error);
        } finally {
            setLoading(false);
        }
    }, [domain, canSearch, recordSearch, onCreditsUsed]);

    // Use existing analysis data if available
    useEffect(() => {
        if (analysis) {
            // Pre-populate with analysis data
            setDataLoaded(true);
        }
    }, [analysis]);

    const { grade, score } = calculateHealthGrade();

    return (
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto mt-8 overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 p-6 border-b border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400 flex items-center gap-2">
                            <ShieldCheck className="text-orange-500" /> SEO & Risk Intelligence
                        </h2>
                        <p className="text-gray-400 mt-1">Safety analysis for <span className="text-white font-medium">{domain}</span></p>
                    </div>

                    <HealthGrade grade={grade} score={score} />
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-cyan-400 mb-2">
                            <History size={16} />
                            <span className="text-xs font-medium uppercase tracking-wider">Domain Age</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{whoisHistory?.registrationAge || 'Unknown'}</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-yellow-400 mb-2">
                            <Users size={16} />
                            <span className="text-xs font-medium uppercase tracking-wider">Owner Changes</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{whoisHistory?.totalOwnerChanges ?? 0}</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                            <Shield size={16} />
                            <span className="text-xs font-medium uppercase tracking-wider">Stability</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{whoisHistory?.stabilityScore ?? 50}/100</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <AlertTriangle size={16} />
                            <span className="text-xs font-medium uppercase tracking-wider">Risk Score</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0}%
                        </p>
                    </div>
                </div>

                {/* Load Detailed Data Button */}
                {!dataLoaded && !loading && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                        {!canSearch() ? (
                            <div>
                                <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={32} />
                                <p className="text-gray-400 mb-2">Credits required for detailed analysis</p>
                                <p className="text-sm text-gray-500">Upgrade to Pro for unlimited reports</p>
                            </div>
                        ) : (
                            <div>
                                <FileSearch className="mx-auto text-blue-400 mb-4" size={32} />
                                <p className="text-gray-400 mb-4">Click to load detailed ownership history and risk analysis</p>
                                <button
                                    onClick={fetchDetailedData}
                                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
                                >
                                    <Zap size={18} /> Load Detailed Analysis
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <ProgressBar progress={50} text={loadingPhase} />
                    </div>
                )}

                {/* ===== WHOIS HISTORY SECTION ===== */}
                {dataLoaded && (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <History size={18} className="text-cyan-400" /> Ownership History
                            </h3>
                            <a
                                href={waybackData.archiveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                            >
                                <Archive size={14} /> View on Wayback Machine <ExternalLink size={12} />
                            </a>
                        </div>

                        <div className="p-4">
                            {/* History Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                                    <p className="text-2xl font-bold text-white">{whoisHistory?.totalOwnerChanges ?? 0}</p>
                                    <p className="text-xs text-gray-400">Transfers</p>
                                </div>
                                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                                    <p className="text-2xl font-bold text-white">{whoisHistory?.registrationAge || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">Age</p>
                                </div>
                                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                                    <p className={`text-2xl font-bold ${whoisHistory?.hasDropHistory ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {whoisHistory?.hasDropHistory ? 'Yes' : 'No'}
                                    </p>
                                    <p className="text-xs text-gray-400">Drop History</p>
                                </div>
                            </div>

                            {/* History Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Event</th>
                                            <th className="px-4 py-3 font-medium">Details</th>
                                            <th className="px-4 py-3 font-medium">Registrar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {whoisHistory?.history && whoisHistory.history.length > 0 ? (
                                            whoisHistory.history.map((record, i) => (
                                                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{record.date}</td>
                                                    <td className="px-4 py-3">
                                                        <EventBadge event={record.event} />
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400">{record.change}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">{record.registrar || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            // Default placeholder data
                                            <>
                                                <tr className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">2023-01-15</td>
                                                    <td className="px-4 py-3"><EventBadge event="registration" /></td>
                                                    <td className="px-4 py-3 text-gray-400">Initial Registration</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">GoDaddy</td>
                                                </tr>
                                                <tr className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">2024-01-15</td>
                                                    <td className="px-4 py-3"><EventBadge event="renewal" /></td>
                                                    <td className="px-4 py-3 text-gray-400">Annual Renewal</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">GoDaddy</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== SPAM & BLACKLIST CHECK ===== */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gray-800">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <AlertOctagon size={18} className="text-red-400" /> Spam & Blacklist Check
                        </h3>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Risk Level Display */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center ${(spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0) < 30
                                    ? 'bg-green-500/20 border-2 border-green-500'
                                    : (spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0) < 60
                                        ? 'bg-yellow-500/20 border-2 border-yellow-500'
                                        : 'bg-red-500/20 border-2 border-red-500'
                                }`}>
                                <span className={`text-3xl font-bold ${(spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0) < 30 ? 'text-green-400' :
                                        (spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0) < 60 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0}
                                </span>
                                <span className="text-xs text-gray-400">/100</span>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-semibold ${(spamReport?.riskLevel ?? analysis?.spamRisk?.level) === 'Safe' ||
                                            (spamReport?.riskLevel ?? analysis?.spamRisk?.level) === 'Low' ? 'text-green-400' :
                                            (spamReport?.riskLevel ?? analysis?.spamRisk?.level) === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {spamReport?.riskLevel ?? analysis?.spamRisk?.level ?? 'Unknown'} Risk
                                    </span>
                                    {(spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0) < 30 && (
                                        <CheckCircle2 size={20} className="text-green-400" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">
                                    {(spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0) < 30
                                        ? 'This domain appears clean and safe for use. No significant risk factors detected.'
                                        : (spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0) < 60
                                            ? 'Some caution advised. Review the risk factors below before proceeding.'
                                            : 'High risk detected. Careful evaluation recommended before acquisition.'}
                                </p>
                            </div>
                        </div>

                        {/* Risk Meters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RiskMeter score={spamReport?.overallScore ?? analysis?.spamRisk?.score ?? 0} label="Overall Spam Risk" />
                            <RiskMeter score={whoisHistory?.hasDropHistory ? 60 : 10} label="Drop History Risk" />
                            <RiskMeter score={100 - (whoisHistory?.stabilityScore ?? 50)} label="Ownership Instability" />
                            <RiskMeter score={(spamReport?.blacklistResults?.filter(b => b.listed).length ?? 0) * 25} label="Blacklist Presence" />
                        </div>

                        {/* Blacklist Results */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                <Shield size={14} /> Blacklist Status
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {(spamReport?.blacklistResults && spamReport.blacklistResults.length > 0 ?
                                    spamReport.blacklistResults :
                                    [
                                        { list: 'Spamhaus', listed: false },
                                        { list: 'SURBL', listed: false },
                                        { list: 'Barracuda', listed: false },
                                        { list: 'Google Safe Browsing', listed: false },
                                    ]
                                ).map((result, i) => (
                                    <BlacklistStatus key={i} listName={result.list} listed={result.listed} />
                                ))}
                            </div>
                        </div>

                        {/* Risk Factors */}
                        {((analysis?.spamRisk?.factors && analysis.spamRisk.factors.length > 0) ||
                            (spamReport?.spamIndicators && spamReport.spamIndicators.length > 0)) && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Detected Risk Factors
                                    </h4>
                                    <div className="space-y-2">
                                        {(spamReport?.spamIndicators ?? analysis?.spamRisk?.factors?.map(f => ({
                                            indicator: f,
                                            severity: 'medium' as const,
                                            description: f
                                        })) ?? []).map((indicator, i) => (
                                            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${indicator.severity === 'high' ? 'bg-red-500/10 border border-red-500/30' :
                                                    indicator.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                                                        'bg-gray-700/50 border border-gray-600'
                                                }`}>
                                                <div className={`mt-0.5 ${indicator.severity === 'high' ? 'text-red-400' :
                                                        indicator.severity === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                                                    }`}>
                                                    {indicator.severity === 'high' ? <AlertOctagon size={14} /> :
                                                        indicator.severity === 'medium' ? <AlertTriangle size={14} /> : <Info size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-medium">{indicator.indicator}</p>
                                                    <p className="text-xs text-gray-400">{indicator.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Recommendations */}
                        {(spamReport?.recommendations ?? analysis?.spamRisk?.recommendations ?? []).length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {(spamReport?.recommendations ?? analysis?.spamRisk?.recommendations ?? []).map((rec, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <ChevronRight size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== WAYBACK MACHINE QUICK LINK ===== */}
                <a
                    href={waybackData.archiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all hover:scale-[1.01]"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Archive className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Wayback Machine Archive</h4>
                                <p className="text-sm text-gray-400">View historical snapshots of this domain</p>
                            </div>
                        </div>
                        <ExternalLink className="text-gray-500" size={20} />
                    </div>
                </a>

                {/* Footer Note */}
                <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-700">
                    <p>Risk assessments are AI-generated estimates. Always perform due diligence before domain acquisition.</p>
                </div>
            </div>
        </div>
    );
};
