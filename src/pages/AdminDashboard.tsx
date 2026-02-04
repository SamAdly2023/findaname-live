import React, { useState } from 'react';
import { useAuth, PlanType } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Users, Eye, TrendingUp, DollarSign,
    Activity, UserPlus, Search, Zap, Gift, Crown, Trash2,
    Copy, CheckCircle, AlertTriangle, BarChart3,
    Link, Award, LogOut, Settings
} from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'affiliates' | 'analytics' | 'settings';

export default function AdminDashboard() {
    const {
        getAllUsers, updateUserPlan, updateUserCredits, deleteUser,
        switchViewMode, user, logout, getAnalytics, getAffiliateLeaderboard
    } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const users = getAllUsers();
    const analytics = getAnalytics();
    const leaderboard = getAffiliateLeaderboard();

    if (user?.role !== 'admin') {
        return <div className="p-10 text-center text-red-400">Access Denied. Admin only.</div>;
    }

    const handleSwitchView = () => {
        switchViewMode();
        navigate('/dashboard');
    };

    const handlePlanChange = (userId: string, plan: PlanType) => {
        updateUserPlan(userId, plan);
    };

    const handleCreditsChange = (userId: string, credits: number) => {
        updateUserCredits(userId, credits);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            deleteUser(userId);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
        { id: 'users', label: 'Users', icon: <Users size={18} /> },
        { id: 'affiliates', label: 'Affiliates', icon: <Gift size={18} /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <p className="text-3xl font-bold text-white mt-1">{analytics.totalUsers}</p>
                            <p className="text-purple-400 text-xs mt-1">+{analytics.newUsersThisMonth} this month</p>
                        </div>
                        <div className="bg-purple-500/20 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 p-6 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Pro Subscribers</p>
                            <p className="text-3xl font-bold text-white mt-1">{analytics.proUsers}</p>
                            <p className="text-green-400 text-xs mt-1">{analytics.totalUsers > 0 ? ((analytics.proUsers / analytics.totalUsers) * 100).toFixed(1) : 0}% conversion</p>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-lg">
                            <Crown className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 p-6 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Monthly Revenue</p>
                            <p className="text-3xl font-bold text-white mt-1">${analytics.revenueEstimate}</p>
                            <p className="text-blue-400 text-xs mt-1">$49/user × {analytics.proUsers}</p>
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 p-6 rounded-xl border border-orange-500/30 hover:border-orange-400/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Today</p>
                            <p className="text-3xl font-bold text-white mt-1">{analytics.activeUsersToday}</p>
                            <p className="text-orange-400 text-xs mt-1">{analytics.totalSearches} total searches</p>
                        </div>
                        <div className="bg-orange-500/20 p-3 rounded-lg">
                            <Activity className="w-6 h-6 text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* User Growth Chart (Simplified visual) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-purple-400" />
                        User Activity (Last 7 Days)
                    </h3>
                    <div className="flex items-end gap-2 h-32">
                        {analytics.userGrowth.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md transition-all hover:from-purple-500 hover:to-purple-300"
                                    style={{ height: `${Math.max(10, (day.count / Math.max(...analytics.userGrowth.map(d => d.count))) * 100)}%` }}
                                />
                                <span className="text-xs text-gray-500">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-400" />
                        Top Tools by Usage
                    </h3>
                    <div className="space-y-3">
                        {analytics.topTools.length > 0 ? analytics.topTools.map((tool, i) => (
                            <div key={tool.tool} className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-amber-700'}`}>
                                    #{i + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{tool.tool}</span>
                                        <span className="text-xs text-gray-400">{tool.count} uses</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                                            style={{ width: `${(tool.count / analytics.topTools[0].count) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm">No tool usage data yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-green-400" />
                    Recent Registrations
                </h3>
                <div className="space-y-3">
                    {users.slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img src={u.picture} alt={u.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.plan === 'pro' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    {u.plan.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(u.joinedAt || u.lastResetDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
                        <span className="text-gray-400">Total:</span> <span className="font-bold text-white">{users.length}</span>
                    </span>
                    <span className="px-3 py-2 bg-green-500/20 rounded-lg text-sm">
                        <span className="text-green-400">Pro:</span> <span className="font-bold text-green-300">{users.filter(u => u.plan === 'pro').length}</span>
                    </span>
                    <span className="px-3 py-2 bg-gray-700 rounded-lg text-sm">
                        <span className="text-gray-400">Free:</span> <span className="font-bold text-gray-300">{users.filter(u => u.plan === 'free').length}</span>
                    </span>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800/80 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="text-left p-4 text-sm text-gray-400 font-medium">User</th>
                                <th className="text-left p-4 text-sm text-gray-400 font-medium">Plan</th>
                                <th className="text-left p-4 text-sm text-gray-400 font-medium">Credits</th>
                                <th className="text-left p-4 text-sm text-gray-400 font-medium">Searches</th>
                                <th className="text-left p-4 text-sm text-gray-400 font-medium">Referrals</th>
                                <th className="text-left p-4 text-sm text-gray-400 font-medium">Joined</th>
                                <th className="text-left p-4 text-sm text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={u.picture} alt={u.name} className="w-10 h-10 rounded-full ring-2 ring-gray-700" />
                                            <div>
                                                <p className="font-medium flex items-center gap-2">
                                                    {u.name}
                                                    {u.role === 'admin' && <Shield size={14} className="text-purple-400" />}
                                                </p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={u.plan}
                                            onChange={(e) => handlePlanChange(u.id, e.target.value as PlanType)}
                                            className={`appearance-none px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer focus:ring-2 focus:ring-purple-500 ${u.plan === 'pro'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : 'bg-gray-700 text-gray-300 border-gray-600'
                                                } border`}
                                            disabled={u.id === user?.id}
                                        >
                                            <option value="free">Free</option>
                                            <option value="pro">Pro</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={u.credits}
                                                onChange={(e) => handleCreditsChange(u.id, parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center text-sm"
                                                min="0"
                                            />
                                            <Zap size={14} className="text-yellow-400" />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-green-400 font-medium">{u.searches?.length || 0}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-purple-400 font-medium">{u.affiliateStats?.totalReferrals || 0}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(u.joinedAt || u.lastResetDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {u.affiliateStats?.referralCode && (
                                                <button
                                                    onClick={() => copyToClipboard(u.affiliateStats!.referralLink, u.id)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Copy affiliate link"
                                                >
                                                    {copiedCode === u.id ? <CheckCircle size={16} className="text-green-400" /> : <Link size={16} className="text-gray-400" />}
                                                </button>
                                            )}
                                            {u.id !== user?.id && (
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAffiliates = () => (
        <div className="space-y-6">
            {/* Affiliate Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6 rounded-xl border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Gift className="w-8 h-8 text-purple-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Total Referrals</p>
                            <p className="text-2xl font-bold text-white">
                                {users.reduce((acc, u) => acc + (u.affiliateStats?.totalReferrals || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 p-6 rounded-xl border border-green-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Credits Distributed</p>
                            <p className="text-2xl font-bold text-white">
                                {users.reduce((acc, u) => acc + (u.affiliateStats?.creditsEarned || 0), 0) * 2}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 p-6 rounded-xl border border-yellow-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-8 h-8 text-yellow-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Active Affiliates</p>
                            <p className="text-2xl font-bold text-white">
                                {users.filter(u => (u.affiliateStats?.totalReferrals || 0) > 0).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="text-yellow-400" />
                    Affiliate Leaderboard
                </h3>
                {leaderboard.length > 0 ? (
                    <div className="space-y-3">
                        {leaderboard.map((entry, i) => (
                            <div key={entry.userId} className={`flex items-center justify-between p-4 rounded-lg ${i === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30' :
                                    i === 1 ? 'bg-gradient-to-r from-gray-400/20 to-transparent border border-gray-400/30' :
                                        i === 2 ? 'bg-gradient-to-r from-amber-700/20 to-transparent border border-amber-700/30' :
                                            'bg-gray-700/50'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-2xl font-bold w-8 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                                        }`}>
                                        #{i + 1}
                                    </span>
                                    <img src={entry.userPicture} alt={entry.userName} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-medium">{entry.userName}</p>
                                        <p className="text-xs text-gray-400">{entry.totalReferrals} referrals</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-400 font-bold">{entry.creditsEarned} credits earned</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Gift size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No affiliate activity yet</p>
                    </div>
                )}
            </div>

            {/* All Users Affiliate Info */}
            <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Link className="text-purple-400" />
                    User Affiliate Links
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="text-left p-3 text-sm text-gray-400">User</th>
                                <th className="text-left p-3 text-sm text-gray-400">Referral Code</th>
                                <th className="text-left p-3 text-sm text-gray-400">Referrals</th>
                                <th className="text-left p-3 text-sm text-gray-400">Credits Earned</th>
                                <th className="text-left p-3 text-sm text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-t border-gray-700/50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full" />
                                            <span className="font-medium">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <code className="bg-gray-700 px-2 py-1 rounded text-sm text-purple-400">
                                            {u.affiliateStats?.referralCode || 'N/A'}
                                        </code>
                                    </td>
                                    <td className="p-3 text-green-400 font-medium">{u.affiliateStats?.totalReferrals || 0}</td>
                                    <td className="p-3 text-yellow-400 font-medium">{u.affiliateStats?.creditsEarned || 0}</td>
                                    <td className="p-3">
                                        {u.affiliateStats?.referralLink && (
                                            <button
                                                onClick={() => copyToClipboard(u.affiliateStats!.referralLink, `aff-${u.id}`)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors"
                                            >
                                                {copiedCode === `aff-${u.id}` ? <CheckCircle size={14} /> : <Copy size={14} />}
                                                {copiedCode === `aff-${u.id}` ? 'Copied!' : 'Copy Link'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">New This Month</p>
                            <p className="text-2xl font-bold mt-1">{analytics.newUsersThisMonth}</p>
                        </div>
                        <UserPlus className="text-green-400" size={24} />
                    </div>
                </div>
                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Active Today</p>
                            <p className="text-2xl font-bold mt-1">{analytics.activeUsersToday}</p>
                        </div>
                        <Activity className="text-blue-400" size={24} />
                    </div>
                </div>
                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Total Searches</p>
                            <p className="text-2xl font-bold mt-1">{analytics.totalSearches}</p>
                        </div>
                        <Search className="text-purple-400" size={24} />
                    </div>
                </div>
                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Conversion Rate</p>
                            <p className="text-2xl font-bold mt-1">
                                {analytics.totalUsers > 0 ? ((analytics.proUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                        <TrendingUp className="text-yellow-400" size={24} />
                    </div>
                </div>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
                    <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full border-8 border-gray-600 flex items-center justify-center relative">
                                <div
                                    className="absolute inset-0 rounded-full border-8 border-green-500"
                                    style={{
                                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((analytics.proUsers / Math.max(1, analytics.totalUsers)) * 2 * Math.PI)}% ${50 - 50 * Math.cos((analytics.proUsers / Math.max(1, analytics.totalUsers)) * 2 * Math.PI)}%, 50% 50%)`
                                    }}
                                />
                                <span className="text-2xl font-bold">{analytics.totalUsers}</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Total Users</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-green-500"></div>
                                <span className="text-sm">Pro: {analytics.proUsers}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-gray-600"></div>
                                <span className="text-sm">Free: {analytics.freeUsers}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-400">Monthly Recurring</span>
                            <span className="text-xl font-bold text-green-400">${analytics.revenueEstimate}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-400">Annual Projection</span>
                            <span className="text-xl font-bold text-blue-400">${analytics.revenueEstimate * 12}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-400">Avg. Revenue/User</span>
                            <span className="text-xl font-bold text-purple-400">
                                ${analytics.totalUsers > 0 ? (analytics.revenueEstimate / analytics.totalUsers).toFixed(2) : 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="text-purple-400" />
                    Admin Settings
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="font-medium">Subscription Price</p>
                            <p className="text-sm text-gray-400">Current monthly subscription rate</p>
                        </div>
                        <span className="text-2xl font-bold text-green-400">$49/mo</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="font-medium">Affiliate Reward</p>
                            <p className="text-sm text-gray-400">Credits given per successful referral (both parties)</p>
                        </div>
                        <span className="text-2xl font-bold text-purple-400">3 credits each</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="font-medium">Free Plan Credits</p>
                            <p className="text-sm text-gray-400">Monthly credits for free users</p>
                        </div>
                        <span className="text-2xl font-bold text-yellow-400">3/month</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="font-medium">Admin Email</p>
                            <p className="text-sm text-gray-400">Primary admin account</p>
                        </div>
                        <code className="bg-gray-800 px-3 py-1 rounded text-sm text-purple-400">
                            samadly728@gmail.com
                        </code>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
                <div>
                    <p className="font-medium text-yellow-400">Development Notice</p>
                    <p className="text-sm text-gray-400">Settings changes require code updates. Contact your developer for modifications.</p>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverview();
            case 'users': return renderUsers();
            case 'affiliates': return renderAffiliates();
            case 'analytics': return renderAnalytics();
            case 'settings': return renderSettings();
            default: return renderOverview();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-6 pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-3 rounded-xl">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-gray-400">Manage users, track analytics, and monitor affiliates</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSwitchView}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-lg transition-all font-medium"
                        >
                            <Eye size={18} /> View as Client
                        </button>
                        <button
                            onClick={logout}
                            className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {renderContent()}
            </div>
        </div>
    );
}
