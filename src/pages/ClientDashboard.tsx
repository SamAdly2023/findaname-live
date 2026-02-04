import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Clock, Zap, Crown, ExternalLink, ArrowLeft } from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
    const { user, upgradePlan, isAdmin, viewMode, switchViewMode } = useAuth();

    if (!user) return <div className="p-10 text-center">Please log in to view dashboard.</div>;

    const isPro = user.plan === 'pro';

    // PayPal Configuration
    const initialOptions = {
        "clientId": "AarwkYK4lzBjwzF7OCgJeoRBnGAZehBAsNrEyrQZSdzu7yyPH3P7qEm0qtm-VNj_SvYFPpKA9PjZqO2G",
        currency: "USD",
        intent: "capture"
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div>
                        <h1 className="text-2xl font-bold">Client Dashboard</h1>
                        <p className="text-gray-400">Welcome, {user.name}</p>
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

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-gray-800 p-6 rounded-xl border border-indigo-500/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-indigo-300 mb-1">Current Plan</p>
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    {isPro ? <Crown className="text-yellow-400 w-6 h-6" /> : <Zap className="text-gray-400 w-6 h-6" />}
                                    <span className="capitalize">{user.plan}</span>
                                </h3>
                            </div>
                        </div>
                        {!isPro && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-2">Upgrade to Pro for unlimited searches</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 mb-1">Credits Remaining</p>
                                <h3 className={`text-4xl font-bold ${!isPro && user.credits === 0 ? 'text-red-400' : 'text-white'}`}>
                                    {isPro ? '∞' : user.credits}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Resets monthly</p>
                            </div>
                            <Search className="text-gray-600 w-8 h-8" />
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 mb-1">Total Searches</p>
                                <h3 className="text-4xl font-bold text-white">
                                    {user.searches?.length || 0}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">All time activity</p>
                            </div>
                            <Clock className="text-gray-600 w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Upgrade Section (Only if Free) */}
                {!isPro && (
                    <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-8 rounded-2xl border border-purple-500/30 text-center relative overflow-hidden">
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
                                                    description: "FindAName Pro Subscription"
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

                {/* Recent History Table */}
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <div className="p-6 border-b border-gray-700 font-semibold text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" /> Search History
                        </div>
                        <Link to="/tool/generator" className="text-sm text-indigo-400 hover:text-indigo-300">
                            New Search
                        </Link>
                    </div>

                    {user.searches && user.searches.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 text-gray-400 text-sm">
                                    <tr>
                                        <th className="p-4">Search Term</th>
                                        <th className="p-4">Tool Used</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {user.searches.slice(0, 10).map((s) => (
                                        <tr key={s ? s.id : Math.random()} className="hover:bg-gray-750">
                                            <td className="p-4 font-medium text-white">{s.term}</td>
                                            <td className="p-4 text-gray-300">{s.tool}</td>
                                            <td className="p-4 text-gray-400 text-sm">{new Date(s.date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <Link to={`/tool/generator?q=${s.term}`} className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-blue-400 text-sm flex items-center gap-1 w-fit">
                                                    <ExternalLink size={14} /> Re-run
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            No search history yet. Start exploring!
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
