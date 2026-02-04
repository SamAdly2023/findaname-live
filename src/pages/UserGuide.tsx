import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Search, Shield, Zap, Globe, Database,
    BarChart, Map, Server, Lock
} from 'lucide-react';

export default function UserGuide() {
    const sections = [
        {
            id: "getting-started",
            title: "Getting Started",
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            content: (
                <div className="space-y-4">
                    <p>Welcome to FindAName.live! This platform provides a suite of professional tools for domain analysis, SEO checking, and digital asset valuation.</p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                        <li><strong>Sign Up/Login:</strong> Use your Google account to instantly access the dashboard.</li>
                        <li><strong>Free Credits:</strong> New users receive 3 free monthly analysis credits.</li>
                        <li><strong>Upgrade:</strong> Subscribe to the Pro plan for unlimited access and deep insights.</li>
                    </ol>
                </div>
            )
        },
        {
            id: "domain-value",
            title: "Domain Value Calculator",
            icon: <BarChart className="w-6 h-6 text-green-400" />,
            content: (
                <div className="space-y-4">
                    <p>Our flagship AI-powered appraisal tool. It analyzes over 15 factors including:</p>
                    <ul className="list-disc pl-5 grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                        <li>Keyword search volume</li>
                        <li>Brandability score</li>
                        <li>TLD extensions (.com vs .xyz)</li>
                        <li>Domain age & history</li>
                        <li>Comparable sales data</li>
                    </ul>
                    <div className="bg-gray-800 p-4 rounded text-sm border-l-4 border-green-500">
                        <strong>Pro Tip:</strong> Enter domains without "http://" or "www" for the best results (e.g., "example.com").
                    </div>
                </div>
            )
        },
        {
            id: "technical-tools",
            title: "Technical Tools",
            icon: <Server className="w-6 h-6 text-blue-400" />,
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Globe size={16} /> DNS Lookup</h4>
                        <p className="text-sm text-gray-400">View A, MX, NS, and TXT records to debug website connectivity.</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Database size={16} /> WHOIS</h4>
                        <p className="text-sm text-gray-400">Find out who owns a domain and when it expires.</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Map size={16} /> Hosting Checker</h4>
                        <p className="text-sm text-gray-400">Identify the hosting provider and server location of any website.</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Lock size={16} /> SSL Check</h4>
                        <p className="text-sm text-gray-400">Verify security certificates and encryption standards.</p>
                    </div>
                </div>
            )
        },
        {
            id: "seo-checker",
            title: "SEO Analysis",
            icon: <Search className="w-6 h-6 text-purple-400" />,
            content: (
                <p>
                    Our SEO tool runs a full Lighthouse audit on any URL. It checks for Performance, Accessibility, Best Practices, and SEO meta tags.
                    Scores are color-coded (Green = Good, Red = Needs Improvement) and include actionable advice on how to fix issues.
                </p>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Header */}
            <div className="bg-gray-800 border-b border-gray-700 py-16 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                    User Guide & Documentation
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Master the tools to appraise, analyze, and optimize your digital assets.
                </p>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="sticky top-24 space-y-1">
                        {sections.map(section => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                            >
                                {section.icon}
                                <span className="text-sm font-medium">{section.title}</span>
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-12">
                    {sections.map((section, index) => (
                        <motion.section
                            key={section.id}
                            id={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="scroll-mt-24"
                        >
                            <div className="border border-gray-700 bg-gray-800/40 rounded-2xl p-6 md:p-8 hover:bg-gray-800/60 transition-colors">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gray-700/50 rounded-lg">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold">{section.title}</h2>
                                </div>
                                <div className="text-gray-300 leading-relaxed text-lg">
                                    {section.content}
                                </div>
                            </div>
                        </motion.section>
                    ))}

                    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-2xl text-center">
                        <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
                        <Link to="/" className="inline-block bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
                            Go to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
