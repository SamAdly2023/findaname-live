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
    ArrowLeft
} from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Link } from 'react-router-dom';
import { DomainGeneratorTool } from '../components/DomainGeneratorTool';
import UserGuide from './UserGuide'; // Importing UserGuide component

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
            <div className="flex justify-between items-center bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                    <p className="text-gray-400 mt-2">Welcome back, {user.name}!</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900 to-gray-800 p-6 rounded-xl border border-indigo-500/30 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-indigo-300 mb-1 text-sm font-medium uppercase tracking-wider">Current Plan</p>
                            <h3 className="text-2xl font-bold flex items-center gap-2 mt-2">
                                {isPro ? <Crown className="text-yellow-400 w-6 h-6" /> : <Zap className="text-gray-400 w-6 h-6" />}
                                <span className="capitalize">{user.plan}</span>
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 mb-1 text-sm font-medium uppercase tracking-wider">Credits Remaining</p>
                            <h3 className={`text-4xl font-bold mt-2 ${!isPro && user.credits === 0 ? 'text-red-400' : 'text-white'}`}>
                                {isPro ? '∞' : user.credits}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Resets monthly</p>
                        </div>
                        <Search className="text-gray-600 w-8 h-8 opacity-50" />
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 mb-1 text-sm font-medium uppercase tracking-wider">Total Searches</p>
                            <h3 className="text-4xl font-bold text-white mt-2">
                                {user.searches?.length || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">All time activity</p>
                        </div>
                        <Clock className="text-gray-600 w-8 h-8 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Upgrade Section */}
            {!isPro && (
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-8 rounded-2xl border border-purple-500/30 text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Unlock Unlimited Power</h2>
                        <p className="text-gray-300 mb-6">You've hit the limits of the free tier. Upgrade to Pro for $27/month to get unlimited searches, deeper analytics, and priority support.</p>

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
                                                    value: "27.00"
                                                },
                                                description: "Pro Plan Subscription"
                                            }]
                                        });
                                    }}
                                    onApprove={async (data, actions) => {
                                        if (actions.order) {
                                            const details = await actions.order.capture();
                                            console.log("Payment successful!", details);
                                            upgradePlan(details);
                                            alert("Payment successful! Welcome to Pro.");
                                            // Reloading might be needed if state update isn't immediate in complex apps
                                            // window.location.reload(); 
                                        }
                                    }}
                                />
                            </PayPalScriptProvider>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Settings Component ---
const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-2 border-indigo-500" />
                        <div>
                            <h3 className="text-xl font-bold">{user.name}</h3>
                            <p className="text-gray-400">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-gray-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm">Current Plan</p>
                                <p className="font-medium text-white capitalize">{user.plan}</p>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm">Member Since</p>
                                <p className="font-medium text-white">{new Date().toLocaleDateString()}</p> 
                                {/* In a real app, user object would have createdAt */}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                        <button 
                            onClick={logout}
                            className="bg-red-900/50 hover:bg-red-900 text-red-200 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'guide' | 'settings'>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return <div className="p-10 text-center text-white">Please log in to view dashboard.</div>;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'generator', label: 'Domain Generator', icon: Search },
        { id: 'guide', label: 'User Guide', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardHome />;
            case 'generator': return <DomainGeneratorTool />;
            case 'guide': return <div className="bg-gray-800 rounded-xl p-6 border border-gray-700"><UserGuide /></div>;
            case 'settings': return <Settings />;
            default: return <DashboardHome />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
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
                w-64 bg-gray-800 border-r border-gray-700
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

                <div className="flex-1 py-6 space-y-2 px-3">
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
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                                    ${isActive 
                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }
                                `}
                            >
                                <Icon size={20} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{user.plan} Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-400">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold">Dashboard</span>
                    <div className="w-6" /> {/* Spacer */}
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
