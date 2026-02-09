import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { Database, Globe, Server, CheckCircle, AlertTriangle } from 'lucide-react';

interface NameserverResult {
    domain: string;
    nameservers: {
        hostname: string;
        ipAddresses: string[];
        provider: string;
    }[];
    provider: string;
    isUsingCDN: boolean;
    redundancy: 'good' | 'fair' | 'poor';
}

export const NameserverLookupTool: React.FC = () => {
    const [domain, setDomain] = useState<string>('');
    const [results, setResults] = useState<NameserverResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const identifyNsProvider = (hostname: string): string => {
        const h = hostname.toLowerCase();

        if (h.includes('cloudflare')) return 'Cloudflare';
        if (h.includes('awsdns')) return 'Amazon Route 53';
        if (h.includes('google') || h.includes('googledomains')) return 'Google Cloud DNS';
        if (h.includes('azure') || h.includes('microsoft')) return 'Microsoft Azure DNS';
        if (h.includes('ns.namecheap')) return 'Namecheap';
        if (h.includes('domaincontrol') || h.includes('godaddy')) return 'GoDaddy';
        if (h.includes('registrar-servers')) return 'Namecheap';
        if (h.includes('hostgator')) return 'HostGator';
        if (h.includes('bluehost')) return 'Bluehost';
        if (h.includes('digitalocean')) return 'DigitalOcean';
        if (h.includes('linode')) return 'Linode';
        if (h.includes('vultr')) return 'Vultr';
        if (h.includes('ovh')) return 'OVH';
        if (h.includes('hetzner')) return 'Hetzner';
        if (h.includes('dnsimple')) return 'DNSimple';
        if (h.includes('dnsmadeeasy')) return 'DNS Made Easy';
        if (h.includes('ns1')) return 'NS1';
        if (h.includes('ultradns')) return 'UltraDNS';
        if (h.includes('dynect') || h.includes('dyn.com')) return 'Dyn';

        return 'Custom/Unknown';
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);

        if (!domain.trim()) return;

        setIsLoading(true);
        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

        try {
            // Get NS records
            const nsResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=NS`);
            const nsData = await nsResponse.json();

            if (nsData.Status !== 0 || !nsData.Answer) {
                setError("Could not find nameservers for this domain.");
                setIsLoading(false);
                return;
            }

            const nsRecords = nsData.Answer
                .filter((r: any) => r.type === 2)
                .map((r: any) => r.data.replace(/\.$/, ''));

            // Get IP addresses for each nameserver
            const nameservers = await Promise.all(
                nsRecords.map(async (ns: string) => {
                    try {
                        const ipResponse = await fetch(`https://dns.google/resolve?name=${ns}&type=A`);
                        const ipData = await ipResponse.json();
                        const ips = ipData.Answer
                            ? ipData.Answer.filter((r: any) => r.type === 1).map((r: any) => r.data)
                            : [];

                        return {
                            hostname: ns,
                            ipAddresses: ips,
                            provider: identifyNsProvider(ns)
                        };
                    } catch {
                        return {
                            hostname: ns,
                            ipAddresses: [],
                            provider: identifyNsProvider(ns)
                        };
                    }
                })
            );

            // Determine overall provider
            const providers = nameservers.map(ns => ns.provider);
            const mainProvider = providers[0] || 'Unknown';
            const isUsingCDN = providers.some(p => ['Cloudflare', 'Fastly', 'Akamai'].includes(p));

            // Assess redundancy
            const uniqueIPs = new Set(nameservers.flatMap(ns => ns.ipAddresses));
            let redundancy: 'good' | 'fair' | 'poor' = 'poor';
            if (nameservers.length >= 4 || uniqueIPs.size >= 4) redundancy = 'good';
            else if (nameservers.length >= 2) redundancy = 'fair';

            setResults({
                domain: cleanDomain,
                nameservers,
                provider: mainProvider,
                isUsingCDN,
                redundancy
            });
        } catch (err) {
            console.error("Nameserver Lookup Error", err);
            setError("Failed to lookup nameservers. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getRedundancyColor = (redundancy: string) => {
        switch (redundancy) {
            case 'good': return 'text-green-400 bg-green-900/30';
            case 'fair': return 'text-yellow-400 bg-yellow-900/30';
            default: return 'text-red-400 bg-red-900/30';
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="text-amber-400 w-7 h-7" />
                <span className="text-amber-400">Nameserver</span> Lookup
            </h2>

            <form onSubmit={handleLookup} className="relative mb-8">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain (e.g. example.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Lookup'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-center mb-6">
                    {error}
                </div>
            )}

            {results && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-4 rounded-lg border border-amber-500/30">
                            <p className="text-gray-400 text-sm mb-1">DNS Provider</p>
                            <p className="text-xl font-bold text-white">{results.provider}</p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-center">
                            <p className="text-gray-400 text-sm mb-1">Nameservers</p>
                            <p className="text-2xl font-bold">{results.nameservers.length}</p>
                        </div>
                        <div className={`p-4 rounded-lg border text-center ${getRedundancyColor(results.redundancy)}`}>
                            <p className="text-gray-400 text-sm mb-1">Redundancy</p>
                            <p className="text-xl font-bold capitalize flex items-center justify-center gap-2">
                                {results.redundancy === 'good' ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5" />
                                )}
                                {results.redundancy}
                            </p>
                        </div>
                    </div>

                    {/* CDN Notice */}
                    {results.isUsingCDN && (
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                            <span className="text-blue-300">This domain is using a CDN/DDoS protection service</span>
                        </div>
                    )}

                    {/* Nameserver List */}
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                        <div className="bg-gray-700/30 px-4 py-3 border-b border-gray-700/30 font-semibold text-gray-300 flex items-center gap-2">
                            <Server className="w-4 h-4" />
                            Nameserver Records
                        </div>
                        <div className="divide-y divide-gray-700/30">
                            {results.nameservers.map((ns, idx) => (
                                <div key={idx} className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-amber-400 break-all">{ns.hostname}</p>
                                            {ns.ipAddresses.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {ns.ipAddresses.map((ip, ipIdx) => (
                                                        <span key={ipIdx} className="px-2 py-1 bg-gray-800 rounded text-xs font-mono text-gray-400">
                                                            {ip}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className="px-3 py-1 bg-amber-900/30 text-amber-400 rounded-full text-xs font-medium whitespace-nowrap">
                                            {ns.provider}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    {results.redundancy !== 'good' && (
                        <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-400">
                                <AlertTriangle className="w-4 h-4" />
                                Recommendation
                            </h4>
                            <p className="text-sm text-gray-400">
                                {results.redundancy === 'poor'
                                    ? 'Consider using at least 2 nameservers for better reliability and failover protection.'
                                    : 'For optimal reliability, consider using 4+ geographically distributed nameservers.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
