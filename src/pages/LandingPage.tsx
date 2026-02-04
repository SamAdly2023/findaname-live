import React from 'react';
import HeroParticles from '../components/HeroParticles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Check, ArrowRight, Zap, Target, BarChart } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function LandingPage() {
    const navigate = useNavigate();
    const { login, user, upgradePlan } = useAuth();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                login(userInfo);
                navigate('/dashboard');
            } catch (err) {
                console.error("Login failed", err);
            }
        },
    });

    const handlePayPalSuccess = (details: any) => {
        alert("Payment successful! Welcome to Pro.");
        upgradePlan(details);
        navigate('/dashboard');
    };

    return (
        <PayPalScriptProvider options={{ clientId: "AarwkYK4lzBjwzF7OCgJeoRBnGAZehBAsNrEyrQZSdzu7yyPH3P7qEm0qtm-VNj_SvYFPpKA9PjZqO2G" }}>
            <div className="bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white">

                {/* HERO SECTION */}
                <header className="relative h-screen flex items-center justify-center overflow-hidden">
                    <HeroParticles />

                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-sm font-semibold tracking-wide backdrop-blur-sm animate-fade-in-up">
                            AI-POWERED DOMAIN INTELLIGENCE
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-400 drop-shadow-lg">
                            Find the Perfect Name <br /> Build Your Digital Empire.
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Instantly appraise domains, analyze SEO potential, and discover available names with our professional suite of AI tools.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => user ? navigate('/dashboard') : googleLogin()}
                                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2"
                            >
                                {user ? 'Go to Dashboard' : 'Get Started for Free'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/guide')}
                                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-medium text-lg transition-all border border-gray-700"
                            >
                                View Documentation
                            </button>
                        </div>
                    </div>
                </header>

                {/* FEATURES GRID */}
                <section className="py-24 bg-gray-900 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose FindAName?</h2>
                            <p className="text-gray-400">Professional grade tools for domain investors and webmasters.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: <Zap className="w-8 h-8 text-yellow-500" />, title: "Instant Analysis", desc: "Get real-time feedback on domain value, availability, and keyword strength." },
                                { icon: <Target className="w-8 h-8 text-red-500" />, title: "SEO Optimization", desc: "Deep dive into technical SEO metrics to ensure your site ranks #1." },
                                { icon: <BarChart className="w-8 h-8 text-green-500" />, title: "Market Valuation", desc: "AI-driven price estimation based on historical sales data." }
                            ].map((f, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500/50 transition-all hover:-translate-y-1 shadow-lg">
                                    <div className="mb-4 bg-gray-900/50 w-16 h-16 rounded-xl flex items-center justify-center">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRICING TABLE */}
                <section className="py-24 bg-gradient-to-b from-gray-900 to-indigo-950/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
                            <p className="text-xl text-gray-400">Start for free, upgrade for power.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Free Plan */}
                            <div className="rounded-3xl p-8 bg-gray-800 border border-gray-700">
                                <h3 className="text-2xl font-bold text-gray-400 mb-2">Starter</h3>
                                <div className="text-5xl font-extrabold mb-6">$0<span className="text-xl text-gray-500 font-medium">/mo</span></div>
                                <p className="text-gray-400 mb-8 border-b border-gray-700 pb-8">Perfect for hobbyists and first-time buyers.</p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-gray-300"><Check className="text-green-500" /> 3 Searches per month</li>
                                    <li className="flex items-center gap-3 text-gray-300"><Check className="text-green-500" /> Basic Domain Appraisal</li>
                                    <li className="flex items-center gap-3 text-gray-300"><Check className="text-green-500" /> Standard Support</li>
                                </ul>
                                <button
                                    onClick={() => googleLogin()}
                                    className="w-full py-4 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                >
                                    Start Free
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className="relative rounded-3xl p-8 bg-gradient-to-b from-indigo-900 to-gray-800 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20">
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                                    Most Popular
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                                <div className="text-5xl font-extrabold mb-6 text-white">$27<span className="text-xl text-indigo-200 font-medium">/mo</span></div>
                                <p className="text-indigo-200 mb-8 border-b border-indigo-500/30 pb-8">For serious investors and agencies.</p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-white"><Check className="text-cyan-400" /> <strong>Unlimited</strong> Searches</li>
                                    <li className="flex items-center gap-3 text-white"><Check className="text-cyan-400" /> Advanced AI Valuation</li>
                                    <li className="flex items-center gap-3 text-white"><Check className="text-cyan-400" /> Deep SEO Audit Reports</li>
                                    <li className="flex items-center gap-3 text-white"><Check className="text-cyan-400" /> Priority 24/7 Support</li>
                                </ul>

                                {!user || user.plan === 'free' ? (
                                    <div className="z-10 relative mt-4">
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
                                                    handlePayPalSuccess(details);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <button disabled className="w-full py-4 bg-green-600 text-white font-bold rounded-xl cursor-default">
                                        You are on Pro Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PayPalScriptProvider>
    );
}
