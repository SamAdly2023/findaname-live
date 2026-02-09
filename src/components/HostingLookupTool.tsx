import React, { useState } from 'react';
import { LoaderIcon } from './icons/Icons';
import { Server, Globe, MapPin, Building } from 'lucide-react';

interface HostingResult {
    domain: string;
    ipAddresses: string[];
    provider: string;
    organization: string;
    asn: string;
    country: string;
    city: string;
    isp: string;
}

export const HostingLookupTool: React.FC = () => {
    const [domain, setDomain] = useState<string>('');
    const [results, setResults] = useState<HostingResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Known hosting providers by ASN or IP ranges
    const identifyProvider = (org: string, isp: string, asn: string): string => {
        const combined = `${org} ${isp} ${asn}`.toLowerCase();

        if (combined.includes('cloudflare')) return 'Cloudflare';
        if (combined.includes('amazon') || combined.includes('aws')) return 'Amazon Web Services (AWS)';
        if (combined.includes('google')) return 'Google Cloud Platform';
        if (combined.includes('microsoft') || combined.includes('azure')) return 'Microsoft Azure';
        if (combined.includes('digitalocean')) return 'DigitalOcean';
        if (combined.includes('linode') || combined.includes('akamai')) return 'Akamai/Linode';
        if (combined.includes('vultr')) return 'Vultr';
        if (combined.includes('ovh')) return 'OVH';
        if (combined.includes('hetzner')) return 'Hetzner';
        if (combined.includes('godaddy')) return 'GoDaddy';
        if (combined.includes('hostgator')) return 'HostGator';
        if (combined.includes('bluehost')) return 'Bluehost';
        if (combined.includes('siteground')) return 'SiteGround';
        if (combined.includes('namecheap')) return 'Namecheap';
        if (combined.includes('vercel')) return 'Vercel';
        if (combined.includes('netlify')) return 'Netlify';
        if (combined.includes('fastly')) return 'Fastly';

        return org || isp || 'Unknown Provider';
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);

        if (!domain.trim()) return;

        setIsLoading(true);
        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

        try {
            // First, get IP addresses via DNS lookup
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
            const dnsData = await dnsResponse.json();

            if (dnsData.Status !== 0 || !dnsData.Answer) {
                setError("Could not resolve domain. Please check the domain name.");
                setIsLoading(false);
                return;
            }

            const ipAddresses = dnsData.Answer
                .filter((r: any) => r.type === 1)
                .map((r: any) => r.data);

            if (ipAddresses.length === 0) {
                setError("No IP addresses found for this domain.");
                setIsLoading(false);
                return;
            }

            // Get IP info using ip-api.com (free, no API key needed)
            const ip = ipAddresses[0];
            const ipInfoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,org,as`);
            const ipInfo = await ipInfoResponse.json();

            if (ipInfo.status === 'success') {
                const provider = identifyProvider(ipInfo.org || '', ipInfo.isp || '', ipInfo.as || '');

                setResults({
                    domain: cleanDomain,
                    ipAddresses,
                    provider,
                    organization: ipInfo.org || 'Unknown',
                    asn: ipInfo.as || 'Unknown',
                    country: ipInfo.country || 'Unknown',
                    city: ipInfo.city || 'Unknown',
                    isp: ipInfo.isp || 'Unknown'
                });
            } else {
                // Fallback if IP lookup fails
                setResults({
                    domain: cleanDomain,
                    ipAddresses,
                    provider: 'Unknown',
                    organization: 'Unknown',
                    asn: 'Unknown',
                    country: 'Unknown',
                    city: 'Unknown',
                    isp: 'Unknown'
                });
            }
        } catch (err) {
            console.error("Hosting Lookup Error", err);
            setError("Failed to lookup hosting information. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Server className="text-violet-400 w-7 h-7" />
                <span className="text-violet-400">Hosting</span> Lookup
            </h2>

            <form onSubmit={handleLookup} className="relative mb-8">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain (e.g. example.com)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-md font-medium transition-colors disabled:opacity-50"
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
                    {/* Provider Card */}
                    <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 p-6 rounded-xl border border-violet-500/30">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-violet-500/20 rounded-xl">
                                <Server className="w-10 h-10 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Hosting Provider</p>
                                <h3 className="text-2xl font-bold text-white">{results.provider}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <Globe className="w-4 h-4" />
                                <span className="text-sm">Domain</span>
                            </div>
                            <p className="font-semibold">{results.domain}</p>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <Server className="w-4 h-4" />
                                <span className="text-sm">IP Address(es)</span>
                            </div>
                            <div className="space-y-1">
                                {results.ipAddresses.map((ip, idx) => (
                                    <p key={idx} className="font-mono text-sm text-violet-400">{ip}</p>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <Building className="w-4 h-4" />
                                <span className="text-sm">Organization</span>
                            </div>
                            <p className="font-semibold text-sm">{results.organization}</p>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <Server className="w-4 h-4" />
                                <span className="text-sm">ISP</span>
                            </div>
                            <p className="font-semibold text-sm">{results.isp}</p>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Location</span>
                            </div>
                            <p className="font-semibold">{results.city}, {results.country}</p>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <span className="text-sm">ASN</span>
                            </div>
                            <p className="font-mono text-sm">{results.asn}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
