import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { Mail, CheckCircle, XCircle, AlertTriangle, Server, Shield } from 'lucide-react';

interface EmailCheckResult {
    domain: string;
    hasMX: boolean;
    mxRecords: string[];
    hasSPF: boolean;
    spfRecord: string;
    hasDMARC: boolean;
    dmarcRecord: string;
    hasDKIM: boolean;
    score: number;
    grade: string;
}

export const EmailCheckerTool: React.FC = () => {
    const [domain, setDomain] = useState<string>('');
    const [results, setResults] = useState<EmailCheckResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);

        if (!domain.trim()) return;

        setIsLoading(true);
        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('@').pop() || domain;

        try {
            // Check MX records
            const mxResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=MX`);
            const mxData = await mxResponse.json();
            const hasMX = mxData.Status === 0 && mxData.Answer;
            const mxRecords = hasMX ? mxData.Answer.map((r: any) => r.data) : [];

            // Check SPF records (TXT)
            const txtResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=TXT`);
            const txtData = await txtResponse.json();
            const txtRecords = txtData.Answer || [];
            const spfRecord = txtRecords.find((r: any) => r.data.includes('v=spf1'))?.data || '';
            const hasSPF = !!spfRecord;

            // Check DMARC
            const dmarcResponse = await fetch(`https://dns.google/resolve?name=_dmarc.${cleanDomain}&type=TXT`);
            const dmarcData = await dmarcResponse.json();
            const dmarcRecord = dmarcData.Answer?.[0]?.data || '';
            const hasDMARC = dmarcRecord.includes('v=DMARC1');

            // Check DKIM (common selectors)
            const dkimSelectors = ['default', 'google', 'selector1', 'selector2', 'k1'];
            let hasDKIM = false;
            for (const selector of dkimSelectors) {
                const dkimResponse = await fetch(`https://dns.google/resolve?name=${selector}._domainkey.${cleanDomain}&type=TXT`);
                const dkimData = await dkimResponse.json();
                if (dkimData.Status === 0 && dkimData.Answer) {
                    hasDKIM = true;
                    break;
                }
            }

            // Calculate score
            let score = 0;
            if (hasMX) score += 30;
            if (hasSPF) score += 25;
            if (hasDMARC) score += 25;
            if (hasDKIM) score += 20;

            const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 30 ? 'D' : 'F';

            setResults({
                domain: cleanDomain,
                hasMX,
                mxRecords,
                hasSPF,
                spfRecord: spfRecord.replace(/"/g, ''),
                hasDMARC,
                dmarcRecord: dmarcRecord.replace(/"/g, ''),
                hasDKIM,
                score,
                grade
            });

        } catch (err) {
            console.error("Email Check Error", err);
            setError("Failed to check email deliverability. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A+': case 'A': return 'text-green-400 bg-green-900/30';
            case 'B': return 'text-yellow-400 bg-yellow-900/30';
            case 'C': return 'text-orange-400 bg-orange-900/30';
            default: return 'text-red-400 bg-red-900/30';
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="text-pink-400 w-7 h-7" />
                <span className="text-pink-400">Email</span> Deliverability Checker
            </h2>

            <form onSubmit={handleCheck} className="relative mb-8">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain or email (e.g. example.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-pink-600 hover:bg-pink-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Check'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-center mb-6">
                    {error}
                </div>
            )}

            {results && (
                <div className="space-y-6">
                    {/* Score Header */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 mb-1">Email Deliverability Score</p>
                            <h3 className="text-xl font-bold">{results.domain}</h3>
                        </div>
                        <div className={`text-4xl font-bold px-6 py-3 rounded-xl ${getGradeColor(results.grade)}`}>
                            {results.grade}
                        </div>
                    </div>

                    {/* Checks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* MX Records */}
                        <div className={`p-4 rounded-lg border ${results.hasMX ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {results.hasMX ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                <span className="font-semibold">MX Records</span>
                                <Server className="w-4 h-4 text-gray-500 ml-auto" />
                            </div>
                            {results.hasMX ? (
                                <div className="text-sm text-gray-400 space-y-1">
                                    {results.mxRecords.slice(0, 3).map((mx, i) => (
                                        <p key={i} className="font-mono text-xs truncate">{mx}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-red-400">No MX records found</p>
                            )}
                        </div>

                        {/* SPF */}
                        <div className={`p-4 rounded-lg border ${results.hasSPF ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {results.hasSPF ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                <span className="font-semibold">SPF Record</span>
                                <Shield className="w-4 h-4 text-gray-500 ml-auto" />
                            </div>
                            {results.hasSPF ? (
                                <p className="text-sm text-gray-400 font-mono text-xs break-all">{results.spfRecord.substring(0, 80)}...</p>
                            ) : (
                                <p className="text-sm text-red-400">No SPF record found</p>
                            )}
                        </div>

                        {/* DMARC */}
                        <div className={`p-4 rounded-lg border ${results.hasDMARC ? 'bg-green-900/20 border-green-500/30' : 'bg-yellow-900/20 border-yellow-500/30'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {results.hasDMARC ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                                <span className="font-semibold">DMARC Record</span>
                            </div>
                            {results.hasDMARC ? (
                                <p className="text-sm text-gray-400 font-mono text-xs break-all">{results.dmarcRecord.substring(0, 80)}...</p>
                            ) : (
                                <p className="text-sm text-yellow-400">No DMARC record found</p>
                            )}
                        </div>

                        {/* DKIM */}
                        <div className={`p-4 rounded-lg border ${results.hasDKIM ? 'bg-green-900/20 border-green-500/30' : 'bg-yellow-900/20 border-yellow-500/30'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {results.hasDKIM ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                                <span className="font-semibold">DKIM Record</span>
                            </div>
                            <p className={`text-sm ${results.hasDKIM ? 'text-green-400' : 'text-yellow-400'}`}>
                                {results.hasDKIM ? 'DKIM signature found' : 'No DKIM record detected'}
                            </p>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {results.score < 100 && (
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-blue-400" />
                                Recommendations
                            </h4>
                            <ul className="text-sm text-gray-400 space-y-1">
                                {!results.hasMX && <li>• Add MX records to receive emails</li>}
                                {!results.hasSPF && <li>• Add an SPF record to prevent spoofing</li>}
                                {!results.hasDMARC && <li>• Add a DMARC policy for better deliverability</li>}
                                {!results.hasDKIM && <li>• Configure DKIM signing for authentication</li>}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
