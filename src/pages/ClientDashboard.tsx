import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Search,
    BookOpen,
    Settings as SettingsIcon,
    LogOut,
    Menu,
    X,
    Crown,
    Zap,
    Clock,
    User,
    ArrowLeft,
    Gift,
    Copy,
    CheckCircle,
    Users,
    Share2,
    Award,
    TrendingUp,
    Sparkles,
    ExternalLink,
    Shield,
    FileText,
    Link2,
    Mail,
    AtSign,
    Layers,
    Bot,
    Server,
    Database
} from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Link } from 'react-router-dom';
import { DomainGeneratorTool } from '../components/DomainGeneratorTool';
import { DomainValueCalculator } from '../components/DomainValueCalculator';
import { WhoisLookupTool } from '../components/WhoisLookupTool';
import { DnsLookupTool } from '../components/DnsLookupTool';
import { SeoScoreTool } from '../components/SeoScoreTool';
import { AuthorityScoreTool } from '../components/AuthorityScoreTool';
import { SslCheckerTool } from '../components/SslCheckerTool';
import { MetaAnalyzerTool } from '../components/MetaAnalyzerTool';
import { RedirectCheckerTool } from '../components/RedirectCheckerTool';
import { EmailCheckerTool } from '../components/EmailCheckerTool';
import { SocialCheckerTool } from '../components/SocialCheckerTool';
import { TechStackTool } from '../components/TechStackTool';
import { RobotsTool } from '../components/RobotsTool';
import { HostingLookupTool } from '../components/HostingLookupTool';
import { NameserverLookupTool } from '../components/NameserverLookupTool';
import UserGuide from './UserGuide';

// --- Dashboard Home Component ---
const DashboardHome: React.FC = () => {
    const { user, isAdmin, switchViewMode, upgradePlan } = useAuth();
    if (!user) return null;
    const isPro = user.plan === 'pro';

    // PayPal Configuration
    const initialOptions = {
        "clientId": "AarwkYK4lzBjwzF7OCgJeoRBnGAZehBAsNrEyrQZSdzu7yyPH3P7qEm0qtm-VNj_SvYFPpKA9PjZqO2G",
        currency: "USD",
        intent: "capture"
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold">Welcome Back, {user.name}!</h1>
                    <p className="text-gray-400 mt-2">Here's your account overview and quick actions.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={switchViewMode}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Admin
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-900/50 to-gray-800 p-6 rounded-xl border border-indigo-500/30 shadow-lg hover:border-indigo-400/50 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-indigo-300 mb-1 text-sm font-medium uppercase tracking-wider">Current Plan</p>
                            <h3 className="text-2xl font-bold flex items-center gap-2 mt-2">
                                {isPro ? <Crown className="text-yellow-400 w-6 h-6" /> : <Zap className="text-gray-400 w-6 h-6" />}
                                <span className="capitalize">{user.plan}</span>
                            </h3>
                            {isPro && <span className="text-xs text-green-400 mt-1">Unlimited Access</span>}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-gray-600 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 mb-1 text-sm font-medium uppercase tracking-wider">Credits</p>
                            <h3 className={`text-4xl font-bold mt-2 ${!isPro && user.credits === 0 ? 'text-red-400' : 'text-white'}`}>
                                {isPro ? '∞' : user.credits}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Resets monthly</p>
                        </div>
                        <Zap className="text-yellow-400/50 w-8 h-8" />
                    </div>
                </div>

                <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-gray-600 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 mb-1 text-sm font-medium uppercase tracking-wider">Searches</p>
                            <h3 className="text-4xl font-bold text-white mt-2">
                                {user.searches?.length || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">All time activity</p>
                        </div>
                        <Clock className="text-gray-600 w-8 h-8" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-gray-800 p-6 rounded-xl border border-purple-500/30 shadow-lg hover:border-purple-400/50 transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-purple-300 mb-1 text-sm font-medium uppercase tracking-wider">Referrals</p>
                            <h3 className="text-4xl font-bold text-white mt-2">
                                {user.affiliateStats?.totalReferrals || 0}
                            </h3>
                            <p className="text-xs text-purple-400 mt-1">+{user.affiliateStats?.creditsEarned || 0} credits earned</p>
                        </div>
                        <Gift className="text-purple-400/50 w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                            <Search className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Generate Domains</h4>
                            <p className="text-sm text-gray-400">AI-powered name suggestions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Value Calculator</h4>
                            <p className="text-sm text-gray-400">Estimate domain worth</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <Share2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Share & Earn</h4>
                            <p className="text-sm text-gray-400">Get 3 free credits per referral</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade Section */}
            {!isPro && (
                <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50 p-8 rounded-2xl border border-purple-500/30 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full mb-4">
                            <Sparkles size={16} className="text-purple-400" />
                            <span className="text-sm font-medium text-purple-300">Limited Time Offer</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Unlock Unlimited Power</h2>
                        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                            Upgrade to Pro for just <span className="text-green-400 font-bold">$49/month</span> and get unlimited searches,
                            advanced analytics, priority support, and exclusive features.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {['Unlimited Searches', 'Advanced Analytics', 'Priority Support', 'Export Reports'].map((feature) => (
                                <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                                    <CheckCircle size={16} className="text-green-400" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="max-w-xs mx-auto relative z-0">
                            <PayPalScriptProvider options={initialOptions}>
                                <PayPalButtons
                                    style={{ layout: "vertical", shape: "rect", label: "pay" }}
                                    createOrder={(data, actions) => {
                                        return actions.order.create({
                                            intent: "CAPTURE",
                                            purchase_units: [{
                                                amount: {
                                                    currency_code: "USD",
                                                    value: "49.00"
                                                },
                                                description: "FindAName Pro Plan - Monthly Subscription"
                                            }]
                                        });
                                    }}
                                    onApprove={async (data, actions) => {
                                        if (actions.order) {
                                            const details = await actions.order.capture();
                                            console.log("Payment successful!", details);
                                            upgradePlan(details);
                                            alert("Payment successful! Welcome to Pro.");
                                        }
                                    }}
                                />
                            </PayPalScriptProvider>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {user.searches && user.searches.length > 0 && (
                <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-gray-400" />
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {user.searches.slice(0, 5).map((search, i) => (
                            <div key={search.id || i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Search size={16} className="text-gray-500" />
                                    <span className="font-medium">{search.term}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{search.tool}</span>
                                    <span>{new Date(search.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Affiliate Component ---
const AffiliateTab: React.FC = () => {
    const { user, getAffiliateLeaderboard } = useAuth();
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const leaderboard = getAffiliateLeaderboard();

    if (!user) return null;

    const affiliateLink = user.affiliateStats?.referralLink || '';
    const affiliateCode = user.affiliateStats?.referralCode || '';

    const copyToClipboard = (text: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(text);
        if (type === 'link') {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-8 rounded-2xl border border-purple-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-purple-500/20 rounded-xl">
                            <Gift className="w-10 h-10 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Affiliate Program</h1>
                            <p className="text-gray-400">Share FindAName and earn free credits</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="text-yellow-400" />
                    How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Share2 className="text-purple-400" />
                        </div>
                        <h4 className="font-semibold mb-2">1. Share Your Link</h4>
                        <p className="text-sm text-gray-400">Copy your unique referral link and share it with friends</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="text-green-400" />
                        </div>
                        <h4 className="font-semibold mb-2">2. Friends Sign Up</h4>
                        <p className="text-sm text-gray-400">When they register using your link, you both get rewarded</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="text-yellow-400" />
                        </div>
                        <h4 className="font-semibold mb-2">3. Earn Credits</h4>
                        <p className="text-sm text-gray-400">You get <span className="text-green-400 font-bold">3 credits</span> and they get <span className="text-green-400 font-bold">3 credits</span></p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6 rounded-xl border border-purple-500/30">
                    <p className="text-gray-400 text-sm">Total Referrals</p>
                    <p className="text-3xl font-bold mt-1">{user.affiliateStats?.totalReferrals || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 p-6 rounded-xl border border-green-500/30">
                    <p className="text-gray-400 text-sm">Credits Earned</p>
                    <p className="text-3xl font-bold mt-1 text-green-400">{user.affiliateStats?.creditsEarned || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 p-6 rounded-xl border border-blue-500/30">
                    <p className="text-gray-400 text-sm">Your Code</p>
                    <p className="text-xl font-bold mt-1 font-mono text-blue-400">{affiliateCode}</p>
                </div>
            </div>

            {/* Affiliate Link */}
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ExternalLink className="text-purple-400" />
                    Your Affiliate Link
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={affiliateLink}
                            readOnly
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono"
                        />
                        <button
                            onClick={() => copyToClipboard(affiliateLink, 'link')}
                            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${copiedLink
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                                }`}
                        >
                            {copiedLink ? <CheckCircle size={18} /> : <Copy size={18} />}
                            {copiedLink ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                            <span className="text-gray-400 text-sm">Referral Code: </span>
                            <span className="font-mono font-bold text-purple-400">{affiliateCode}</span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(affiliateCode, 'code')}
                            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${copiedCode
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                        >
                            {copiedCode ? <CheckCircle size={18} /> : <Copy size={18} />}
                            {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Award className="text-yellow-400" />
                        Top Affiliates
                    </h3>
                    <div className="space-y-3">
                        {leaderboard.slice(0, 5).map((entry, i) => (
                            <div key={entry.userId} className={`flex items-center justify-between p-4 rounded-lg ${i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20' :
                                'bg-gray-700/30'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xl font-bold w-6 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                                        }`}>
                                        #{i + 1}
                                    </span>
                                    <img src={entry.userPicture} alt={entry.userName} className="w-8 h-8 rounded-full" />
                                    <span className="font-medium">{entry.userName}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-green-400 font-bold">{entry.totalReferrals} referrals</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Share Buttons */}
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Share on Social Media</h3>
                <div className="flex flex-wrap gap-3">
                    <a
                        href={`https://twitter.com/intent/tweet?text=Check out FindAName - AI-powered domain name generator!&url=${encodeURIComponent(affiliateLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                        Twitter
                    </a>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#4267B2]/20 hover:bg-[#4267B2]/30 text-[#4267B2] rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        Facebook
                    </a>
                    <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(affiliateLink)}&title=FindAName - AI Domain Generator`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#0077B5]/20 hover:bg-[#0077B5]/30 text-[#0077B5] rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        LinkedIn
                    </a>
                    <a
                        href={`mailto:?subject=Check out FindAName&body=I've been using FindAName for domain name generation. Sign up with my link and we both get 3 free credits: ${affiliateLink}`}
                        className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Email
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- Settings Component ---
const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl">
                        <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-2 border-indigo-500" />
                        <div>
                            <h3 className="text-xl font-bold">{user.name}</h3>
                            <p className="text-gray-400">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                                    {user.role}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${user.plan === 'pro' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    {user.plan} Plan
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-sm">Current Plan</p>
                                <p className="font-medium text-white capitalize flex items-center gap-2 mt-1">
                                    {user.plan === 'pro' && <Crown size={16} className="text-yellow-400" />}
                                    {user.plan}
                                </p>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-sm">Member Since</p>
                                <p className="font-medium text-white mt-1">
                                    {new Date(user.joinedAt || user.lastResetDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-sm">Total Searches</p>
                                <p className="font-medium text-white mt-1">{user.searches?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {user.referredBy && (
                        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                            <p className="text-purple-400 text-sm flex items-center gap-2">
                                <Gift size={16} />
                                You joined through a referral and received bonus credits!
                            </p>
                        </div>
                    )}

                    <div className="border-t border-gray-700 pt-6">
                        <button
                            onClick={logout}
                            className="bg-red-900/50 hover:bg-red-900 text-red-200 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Client Dashboard with Sidebar ---
export default function ClientDashboard() {
    const { user, logout, getAffiliateLeaderboard } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'valuation' | 'whois' | 'dns' | 'seo' | 'authority' | 'ssl' | 'meta' | 'redirect' | 'email' | 'social' | 'techstack' | 'robots' | 'hosting' | 'nameserver' | 'affiliate' | 'guide' | 'settings'>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return <div className="p-10 text-center text-white">Please log in to view dashboard.</div>;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'generator', label: 'Domain Generator', icon: Search },
        { id: 'valuation', label: 'Value Calculator', icon: Crown },
        { id: 'whois', label: 'WHOIS Lookup', icon: Search },
        { id: 'dns', label: 'DNS Lookup', icon: Database },
        { id: 'seo', label: 'SEO Score', icon: TrendingUp },
        { id: 'authority', label: 'Authority Score', icon: Award },
        { id: 'ssl', label: 'SSL Checker', icon: Shield },
        { id: 'meta', label: 'Meta Analyzer', icon: FileText },
        { id: 'redirect', label: 'Redirect Checker', icon: Link2 },
        { id: 'email', label: 'Email Checker', icon: Mail },
        { id: 'social', label: 'Social Checker', icon: AtSign },
        { id: 'techstack', label: 'Tech Stack', icon: Layers },
        { id: 'robots', label: 'Robots.txt', icon: Bot },
        { id: 'hosting', label: 'Hosting Lookup', icon: Server },
        { id: 'nameserver', label: 'Nameserver Lookup', icon: Database },
        { id: 'affiliate', label: 'Affiliate', icon: Gift, badge: user.affiliateStats?.totalReferrals },
        { id: 'guide', label: 'User Guide', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardHome />;
            case 'generator': return <DomainGeneratorTool />;
            case 'valuation': return <DomainValueCalculator />;
            case 'whois': return <WhoisLookupTool />;
            case 'dns': return <DnsLookupTool />;
            case 'seo': return <SeoScoreTool />;
            case 'authority': return <AuthorityScoreTool />;
            case 'ssl': return <SslCheckerTool />;
            case 'meta': return <MetaAnalyzerTool />;
            case 'redirect': return <RedirectCheckerTool />;
            case 'email': return <EmailCheckerTool />;
            case 'social': return <SocialCheckerTool />;
            case 'techstack': return <TechStackTool />;
            case 'robots': return <RobotsTool />;
            case 'hosting': return <HostingLookupTool />;
            case 'nameserver': return <NameserverLookupTool />;
            case 'affiliate': return <AffiliateTab />;
            case 'guide': return <div className="bg-gray-800 rounded-xl p-6 border border-gray-700"><UserGuide /></div>;
            case 'settings': return <Settings />;
            default: return <DashboardHome />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-gray-800/95 backdrop-blur border-r border-gray-700
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col
            `}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-indigo-400 tracking-tight">FindAName<span className="text-white">.live</span></h2>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id as any);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all
                                    ${isActive
                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} />
                                    {item.label}
                                </div>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full text-xs font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-700/30 rounded-lg">
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full ring-2 ring-gray-600" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                {user.plan === 'pro' ? (
                                    <><Crown size={10} className="text-yellow-400" /> Pro Plan</>
                                ) : (
                                    <>{user.credits} credits left</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-gray-800/95 backdrop-blur border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-400 hover:text-white">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-indigo-400">FindAName<span className="text-white">.live</span></span>
                    <div className="w-6" />
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}
