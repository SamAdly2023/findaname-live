import React, { useState } from 'react';
import HeroParticles from '../components/HeroParticles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Check, ArrowRight, Zap, Target, BarChart, Shield, Search, Globe, Award, Star, Users, TrendingUp, Quote, ChevronDown, ChevronUp, Mail, Lock, Code, FileText, Server, Link2, AtSign, Cpu, Bot } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function LandingPage() {
    const navigate = useNavigate();
    const { login, user, upgradePlan } = useAuth();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

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

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
        }
    };

    // All available tools
    const allTools = [
        { name: 'AI Domain Generator', icon: '🤖', desc: 'Generate brandable names with AI', href: '/dashboard', color: 'from-blue-500 to-cyan-500' },
        { name: 'Domain Value Calculator', icon: '💰', desc: 'AI-powered domain valuation', href: '/domain-value-calculator.html', color: 'from-green-500 to-emerald-500' },
        { name: 'SEO Score Checker', icon: '📊', desc: 'Core Web Vitals & SEO audit', href: '/seo-checker.html', color: 'from-purple-500 to-pink-500' },
        { name: 'WHOIS Lookup', icon: '🔐', desc: 'Domain ownership & history', href: '/whois-lookup.html', color: 'from-red-500 to-rose-500' },
        { name: 'DNS Lookup', icon: '🌐', desc: 'Complete DNS record check', href: '/dns-lookup.html', color: 'from-indigo-500 to-violet-500' },
        { name: 'SSL Checker', icon: '🔒', desc: 'SSL certificate validation', href: '/ssl-checker.html', color: 'from-teal-500 to-cyan-500' },
        { name: 'Meta Tag Analyzer', icon: '🏷️', desc: 'Title & meta optimization', href: '/meta-analyzer.html', color: 'from-orange-500 to-amber-500' },
        { name: 'Redirect Checker', icon: '🔀', desc: 'HTTP redirect chain analysis', href: '/redirect-checker.html', color: 'from-pink-500 to-rose-500' },
        { name: 'Email Deliverability', icon: '📧', desc: 'SPF, DKIM, DMARC checker', href: '/email-checker.html', color: 'from-yellow-500 to-orange-500' },
        { name: 'Social Handle Checker', icon: '📱', desc: 'Username availability on 10+ platforms', href: '/social-checker.html', color: 'from-blue-400 to-indigo-500' },
        { name: 'Tech Stack Detector', icon: '⚙️', desc: 'Detect website technologies', href: '/tech-stack-detector.html', color: 'from-gray-500 to-slate-500' },
        { name: 'Robots.txt Validator', icon: '🤖', desc: 'Validate crawler rules', href: '/robots-validator.html', color: 'from-lime-500 to-green-500' },
        { name: 'Nameserver Lookup', icon: '🖥️', desc: 'Check nameserver configuration', href: '/nameserver-lookup.html', color: 'from-cyan-500 to-blue-500' },
        { name: 'Hosting Lookup', icon: '☁️', desc: 'Identify hosting provider', href: '/hosting-lookup.html', color: 'from-violet-500 to-purple-500' },
        { name: 'Website Status Checker', icon: '✅', desc: 'Check if site is up or down', href: '/website-down-checker.html', color: 'from-emerald-500 to-teal-500' },
    ];

    // FAQ Data
    const faqs = [
        { q: 'What is FindAName.live?', a: 'FindAName.live is an AI-powered domain name generator and SEO toolkit with 15+ free tools. Generate brandable names, check availability instantly, analyze domain value, audit SEO metrics, verify SSL certificates, check email deliverability, and much more - all in one platform.' },
        { q: 'How much does FindAName cost?', a: 'FindAName offers a generous free plan with 3 AI searches per month and full access to all 15+ SEO tools. The Pro plan costs $49/month and includes unlimited AI searches, advanced valuation reports, bulk analysis, API access, and priority 24/7 support.' },
        { q: 'How does the AI domain generator work?', a: 'Our AI, powered by Google Gemini, analyzes your keywords, industry, and brand requirements to generate thousands of creative, brandable domain suggestions. It considers factors like memorability, pronunciation, length, keyword relevance, and real-time availability across 50+ TLDs.' },
        { q: 'What SEO tools are included for free?', a: 'All tools are free: AI Domain Generator, Domain Value Calculator, SEO Score Checker (Core Web Vitals), WHOIS Lookup, DNS Lookup, SSL Checker, Meta Tag Analyzer, Redirect Checker, Email Deliverability (SPF/DKIM/DMARC), Social Handle Checker, Tech Stack Detector, Robots.txt Validator, Nameserver Lookup, Hosting Lookup, and Website Status Checker.' },
        { q: 'How accurate is the domain value calculator?', a: 'Our AI-powered calculator analyzes domain length, keywords, TLD popularity, historical sales data (500K+ transactions), brandability, existing traffic/backlinks, and market trends. Valuations provide accurate estimates for most domains, though premium and rare domains may vary.' },
        { q: 'Can I check social media username availability?', a: 'Yes! Our Social Handle Checker verifies username availability across 10+ platforms: Twitter/X, Instagram, TikTok, YouTube, GitHub, LinkedIn, Facebook, Pinterest, Reddit, and Twitch - all in one search.' },
        { q: 'What is email deliverability checking?', a: 'Email deliverability checking verifies your domain has proper email authentication records. We check SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), DMARC policies, and MX records to ensure emails reach inboxes, not spam folders.' },
        { q: 'Do you offer an API for bulk analysis?', a: 'Pro subscribers get API access for programmatic domain analysis, bulk WHOIS lookups, and automated SEO audits. Perfect for agencies and domain investors managing large portfolios.' },
    ];

    return (
        <PayPalScriptProvider options={{ clientId: "AarwkYK4lzBjwzF7OCgJeoRBnGAZehBAsNrEyrQZSdzu7yyPH3P7qEm0qtm-VNj_SvYFPpKA9PjZqO2G" }}>
            <div className="bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white">

                {/* HERO SECTION */}
                <header className="relative h-screen flex items-center justify-center overflow-hidden">
                    <HeroParticles />

                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-pink-900/50 border border-pink-500/30 text-pink-300 text-sm font-semibold tracking-wide backdrop-blur-sm animate-fade-in-up">
                            🚀 15+ FREE AI-POWERED SEO TOOLS
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-100 to-pink-400 drop-shadow-lg animate-pulse-slow">
                            Find the Perfect Name <br /> Build Your Digital Empire.
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                            AI-powered domain generator, instant availability checking, SEO audit, WHOIS lookup, SSL verification, email deliverability, and 10+ more professional tools - <strong className="text-white">100% FREE</strong>.
                        </p>

                        {/* Trust badges */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-sm text-gray-400">
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> No credit card required</span>
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Instant results</span>
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 50K+ domains analyzed</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => user ? navigate('/dashboard') : googleLogin()}
                                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2"
                            >
                                {user ? 'Go to Dashboard' : 'Start Free - No Signup Required'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a
                                href="#all-tools"
                                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-medium text-lg transition-all border border-gray-700"
                            >
                                Explore All 15+ Tools
                            </a>
                        </div>
                    </div>
                </header>

                {/* SOCIAL PROOF BAR */}
                <section className="py-6 bg-gray-800/50 border-y border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
                        <div><span className="text-2xl font-bold text-white">50,000+</span><span className="text-gray-400 block text-sm">Domains Analyzed</span></div>
                        <div><span className="text-2xl font-bold text-white">12,000+</span><span className="text-gray-400 block text-sm">Happy Users</span></div>
                        <div><span className="text-2xl font-bold text-white">15+</span><span className="text-gray-400 block text-sm">Free Tools</span></div>
                        <div><span className="text-2xl font-bold text-white">98%</span><span className="text-gray-400 block text-sm">Satisfaction Rate</span></div>
                        <div><span className="text-2xl font-bold text-white">24/7</span><span className="text-gray-400 block text-sm">Support</span></div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="py-20 bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-1 rounded-full bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-sm font-semibold mb-4">HOW IT WORKS</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: '1', title: 'Enter Keywords', desc: 'Type your business keywords, niche, or brand ideas into our AI generator.' },
                                { step: '2', title: 'Get AI Suggestions', desc: 'Our AI analyzes millions of possibilities and returns brandable, available domains.' },
                                { step: '3', title: 'Analyze & Register', desc: 'Use our SEO tools to evaluate, then register your perfect domain.' },
                            ].map((item, i) => (
                                <div key={i} className="relative text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{item.step}</div>
                                    <h3 className="text-xl font-bold mt-4 mb-3">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section className="py-24 bg-gray-900 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-4">POWERFUL FEATURES</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose FindAName?</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Professional grade tools for domain investors, agencies, and webmasters looking to dominate their niche.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: <Zap className="w-8 h-8 text-yellow-500" />, title: "Instant Analysis", desc: "Get real-time feedback on domain value, availability, and keyword strength in seconds." },
                                { icon: <Target className="w-8 h-8 text-red-500" />, title: "SEO Score Checker", desc: "Deep dive into technical SEO metrics, on-page optimization, and ranking factors." },
                                { icon: <BarChart className="w-8 h-8 text-green-500" />, title: "Market Valuation", desc: "AI-driven price estimation based on historical sales data and market trends." },
                                { icon: <Award className="w-8 h-8 text-purple-500" />, title: "Authority Score", desc: "Analyze domain authority, backlink profiles, and competitive positioning." },
                                { icon: <Shield className="w-8 h-8 text-cyan-500" />, title: "WHOIS & DNS Lookup", desc: "Complete domain intelligence with ownership history and DNS records." },
                                { icon: <Search className="w-8 h-8 text-pink-500" />, title: "AI Domain Generator", desc: "Generate brandable, memorable domain names with our AI-powered suggestions." }
                            ].map((f, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-gray-800 hover:bg-gray-800/80 border border-gray-700 hover:border-indigo-500/50 transition-all hover:-translate-y-1 shadow-lg group">
                                    <div className="mb-4 bg-gray-900/50 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TOOLS SHOWCASE - ALL 15 TOOLS */}
                <section className="py-24 bg-gradient-to-b from-gray-900 via-gray-900 to-indigo-950/30 relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />
                    <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1 rounded-full bg-pink-900/50 border border-pink-500/30 text-pink-300 text-sm font-semibold mb-4">15+ FREE SEO TOOLS</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete SEO & Domain Toolkit</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Professional-grade tools for domain research, technical SEO analysis, and website optimization — all completely free.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {allTools.map((tool, i) => (
                                <a
                                    key={i}
                                    href={tool.href}
                                    className="group relative bg-gray-800/80 backdrop-blur border border-gray-700 rounded-xl p-5 hover:border-indigo-500/50 transition-all hover:-translate-y-1 cursor-pointer text-center"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                                    <div className="text-3xl mb-3">{tool.icon}</div>
                                    <h4 className="font-semibold text-white text-sm">{tool.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{tool.desc}</p>
                                </a>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <p className="text-gray-400 mb-4">All tools are <span className="text-green-400 font-semibold">100% FREE</span> — No registration required</p>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section className="py-24 bg-gray-900 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1 rounded-full bg-green-900/50 border border-green-500/30 text-green-300 text-sm font-semibold mb-4">TESTIMONIALS</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Trusted by Thousands</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Join domain investors and entrepreneurs who use FindAName to build their digital empires.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    quote: "FindAName helped me discover undervalued domains that I flipped for 10x profit. The SEO score tool alone is worth the subscription!",
                                    name: "Marcus Chen",
                                    role: "Domain Investor",
                                    avatar: "MC",
                                    rating: 5
                                },
                                {
                                    quote: "The authority score feature gave me insights I couldn't find anywhere else. I've improved my clients' domain selection process significantly.",
                                    name: "Sarah Williams",
                                    role: "Digital Agency Owner",
                                    avatar: "SW",
                                    rating: 5
                                },
                                {
                                    quote: "As a startup founder, finding the right domain was crucial. FindAName's AI suggestions helped me land the perfect brandable name.",
                                    name: "Alex Rodriguez",
                                    role: "Tech Entrepreneur",
                                    avatar: "AR",
                                    rating: 5
                                }
                            ].map((testimonial, i) => (
                                <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-indigo-500/30 transition-all relative">
                                    <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-500/20" />
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, j) => (
                                            <Star key={j} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                            <p className="text-sm text-gray-400">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats Bar */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-indigo-900/30 rounded-2xl border border-indigo-500/20">
                            {[
                                { value: '50K+', label: 'Domains Analyzed' },
                                { value: '12K+', label: 'Happy Users' },
                                { value: '98%', label: 'Satisfaction Rate' },
                                { value: '24/7', label: 'Support Available' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                                    <div className="text-gray-400 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* LEAD MAGNET SECTION */}
                <section className="py-20 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-30" />
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm text-white/80 mb-6">
                            <Mail className="w-4 h-4" />
                            <span>Free SEO Resources</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Get Our Free Domain Investment Checklist
                        </h2>
                        <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
                            Join 10,000+ domain investors. Get exclusive tips, market insights, and a comprehensive 50-point checklist for evaluating domain purchases.
                        </p>

                        {subscribed ? (
                            <div className="flex items-center justify-center gap-3 text-green-400 text-lg">
                                <Check className="w-6 h-6" />
                                <span>Thanks! Check your inbox for the checklist.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-5 h-5" />
                                    Get Free Checklist
                                </button>
                            </form>
                        )}

                        <p className="mt-4 text-sm text-indigo-300/70">
                            🔒 No spam, ever. Unsubscribe anytime.
                        </p>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section className="py-24 bg-gray-900 relative">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1 rounded-full bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-sm font-semibold mb-4">FAQ</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to know about FindAName and our SEO tools.</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className="text-lg font-semibold text-white pr-4">{faq.q}</span>
                                        {openFaq === i ? (
                                            <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-gray-700/50 pt-4">
                                            {faq.a}
                                        </div>
                                    )}
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
                                <div className="text-5xl font-extrabold mb-6 text-white">$49<span className="text-xl text-indigo-200 font-medium">/mo</span></div>
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
                                                            value: "49.00"
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
