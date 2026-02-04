
// ==========================================
// BRAND IDENTITY SUITE - QUICK-START MODULE
// Domain Intelligence Hub v2.0
// ==========================================

import React, { useState, useCallback } from 'react';
import { checkSocialHandles } from '../services/socialCheckAPI';
import { SocialCheckResult, SocialPlatform, AILogoPrompt } from '../types';
import { useAuth } from '../context/AuthContext';
import {
    Instagram,
    Twitter,
    Youtube,
    Video,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ExternalLink,
    Palette,
    Sparkles,
    Download,
    RefreshCw,
    Github,
    Linkedin,
    Facebook,
    MessageCircle,
    Zap,
    Copy,
    Check,
    AlertTriangle
} from 'lucide-react';

interface Props {
    domain: string;
    onCreditsUsed?: () => void;
}

// Platform icon mapping
const PlatformIcon: React.FC<{ platform: SocialPlatform; size?: number }> = ({ platform, size = 18 }) => {
    const icons: Record<SocialPlatform, React.ReactNode> = {
        'X': <Twitter size={size} />,
        'Instagram': <Instagram size={size} />,
        'TikTok': <Video size={size} />,
        'YouTube': <Youtube size={size} />,
        'LinkedIn': <Linkedin size={size} />,
        'Facebook': <Facebook size={size} />,
        'GitHub': <Github size={size} />,
        'Reddit': <MessageCircle size={size} />,
    };
    return <>{icons[platform] || <HelpCircle size={size} />}</>;
};

// Availability status badge
const StatusBadge: React.FC<{ available: boolean | 'unknown' }> = ({ available }) => {
    if (available === true) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                <CheckCircle2 size={12} /> Available
            </span>
        );
    }
    if (available === false) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                <XCircle size={12} /> Taken
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-medium">
            <HelpCircle size={12} /> Check
        </span>
    );
};

// Color palette component
const ColorPalette: React.FC<{ colors: string[] }> = ({ colors }) => (
    <div className="flex gap-2">
        {colors.map((color, i) => (
            <div key={i} className="group relative">
                <div
                    className="w-10 h-10 rounded-lg shadow-lg border border-gray-600 cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {color}
                </span>
            </div>
        ))}
    </div>
);

// Logo style options
const LOGO_STYLES: Array<{ id: AILogoPrompt['style']; label: string; description: string }> = [
    { id: 'modern', label: 'Modern', description: 'Clean lines, geometric shapes' },
    { id: 'classic', label: 'Classic', description: 'Timeless, elegant design' },
    { id: 'playful', label: 'Playful', description: 'Fun, vibrant, energetic' },
    { id: 'professional', label: 'Professional', description: 'Corporate, trustworthy' },
    { id: 'minimalist', label: 'Minimalist', description: 'Simple, refined, essential' },
];

// Generate AI logo prompt
const generateLogoPrompt = (brandName: string, style: AILogoPrompt['style']): AILogoPrompt => {
    const stylePrompts: Record<AILogoPrompt['style'], string> = {
        modern: `A modern, sleek logo for "${brandName}". Clean geometric shapes, gradient colors, minimalistic yet impactful. Suitable for a tech startup or digital brand. High contrast, scalable design.`,
        classic: `A classic, timeless logo for "${brandName}". Elegant typography, refined aesthetic, heritage-inspired elements. Suitable for a luxury or established brand. Rich colors, sophisticated feel.`,
        playful: `A playful, energetic logo for "${brandName}". Vibrant colors, friendly shapes, approachable design. Suitable for a creative or consumer-facing brand. Fun, memorable, youthful vibe.`,
        professional: `A professional, corporate logo for "${brandName}". Strong typography, trustworthy feel, balanced composition. Suitable for B2B or financial services. Blue tones, structured design.`,
        minimalist: `A minimalist logo for "${brandName}". Ultra-clean, essential elements only, maximum white space. Suitable for a premium brand. Single color, iconic mark, highly versatile.`,
    };

    return {
        brandName,
        style,
        generatedPrompt: stylePrompts[style],
    };
};

// Generate brand color palette based on name
const generateColorPalette = (name: string): string[] => {
    // Simple hash function for consistent colors
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;

    return [
        `hsl(${hue}, 70%, 50%)`,
        `hsl(${(hue + 30) % 360}, 65%, 55%)`,
        `hsl(${(hue + 180) % 360}, 60%, 45%)`,
        `hsl(${hue}, 15%, 20%)`,
        `hsl(${hue}, 10%, 95%)`,
    ];
};

export const BrandIdentitySuite: React.FC<Props> = ({ domain, onCreditsUsed }) => {
    const { canSearch, recordSearch, user } = useAuth();

    // Social check state
    const [loading, setLoading] = useState(false);
    const [socialResult, setSocialResult] = useState<SocialCheckResult | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['X', 'Instagram', 'TikTok', 'YouTube']);

    // Logo generator state
    const [selectedStyle, setSelectedStyle] = useState<AILogoPrompt['style']>('modern');
    const [logoPrompt, setLogoPrompt] = useState<AILogoPrompt | null>(null);
    const [showLogoPreview, setShowLogoPreview] = useState(false);

    // Misc state
    const [copied, setCopied] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState(false);

    const name = domain.split('.')[0];
    const colorPalette = generateColorPalette(name);

    // Check social handles
    const handleCheckSocials = useCallback(async () => {
        if (!canSearch()) return;

        setLoading(true);
        try {
            const results = await checkSocialHandles(domain, selectedPlatforms);
            setSocialResult(results);
            recordSearch(domain, 'Social Handle Check');
            onCreditsUsed?.();
        } catch (error) {
            console.error('Error checking social handles:', error);
        } finally {
            setLoading(false);
        }
    }, [domain, selectedPlatforms, canSearch, recordSearch, onCreditsUsed]);

    // Generate logo prompt
    const handleGenerateLogo = useCallback(() => {
        const prompt = generateLogoPrompt(name, selectedStyle);
        setLogoPrompt(prompt);
        setShowLogoPreview(true);
    }, [name, selectedStyle]);

    // Copy handle to clipboard
    const copyHandle = () => {
        navigator.clipboard.writeText(`@${name}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Copy logo prompt
    const copyPrompt = () => {
        if (logoPrompt) {
            navigator.clipboard.writeText(logoPrompt.generatedPrompt);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2000);
        }
    };

    // Toggle platform selection
    const togglePlatform = (platform: SocialPlatform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-8 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Brand Identity Suite
                </h2>
                <p className="text-gray-400 mt-1">Quick-start your brand presence for <span className="text-white font-medium">{domain}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ===== SOCIAL HANDLE SYNC ===== */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-700">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-purple-400">#</span> Social Handle Sync
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">Check availability for <strong className="text-white">@{name}</strong></p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Platform Selection */}
                        <div>
                            <p className="text-sm text-gray-400 mb-3">Select platforms to check:</p>
                            <div className="flex flex-wrap gap-2">
                                {(['X', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'GitHub', 'Reddit'] as SocialPlatform[]).map(platform => (
                                    <button
                                        key={platform}
                                        onClick={() => togglePlatform(platform)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${selectedPlatforms.includes(platform)
                                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        <PlatformIcon platform={platform} size={14} />
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Check Button or Results */}
                        {!socialResult ? (
                            <div className="space-y-4">
                                {!canSearch() && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <p className="text-yellow-400 text-sm flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            Credits required. Upgrade to Pro for unlimited checks.
                                        </p>
                                    </div>
                                )}
                                <button
                                    onClick={handleCheckSocials}
                                    disabled={loading || !canSearch() || selectedPlatforms.length === 0}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-purple-500/20"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} /> Checking endpoints...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={18} /> Check {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                {/* Overall Score */}
                                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                    <div>
                                        <p className="text-sm text-gray-400">Overall Availability</p>
                                        <p className="text-2xl font-bold text-white">{socialResult.overallAvailability}%</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={copyHandle}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Copy handle"
                                        >
                                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-gray-400" />}
                                        </button>
                                        <button
                                            onClick={handleCheckSocials}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Refresh"
                                        >
                                            <RefreshCw size={18} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Platform Results */}
                                <div className="space-y-2">
                                    {socialResult.platforms.map((platform) => (
                                        <a
                                            key={platform.platform}
                                            href={platform.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:scale-[1.02] ${platform.available === true
                                                    ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                                                    : platform.available === false
                                                        ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                                                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${platform.available === true ? 'bg-green-500/20 text-green-400' :
                                                        platform.available === false ? 'bg-red-500/20 text-red-400' :
                                                            'bg-gray-700 text-gray-400'
                                                    }`}>
                                                    <PlatformIcon platform={platform.platform} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{platform.platform}</p>
                                                    <p className="text-sm text-gray-400">@{platform.handle}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge available={platform.available} />
                                                <ExternalLink size={14} className="text-gray-500" />
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                {/* Recommendations */}
                                {socialResult.recommendations.length > 0 && (
                                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                        <p className="text-sm font-medium text-purple-300 mb-2">Recommendations</p>
                                        <ul className="space-y-1">
                                            {socialResult.recommendations.map((rec, i) => (
                                                <li key={i} className="text-sm text-gray-300">{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== AI LOGO GENERATOR ===== */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-600/20 to-orange-600/20 px-6 py-4 border-b border-gray-700">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ImageIcon className="text-pink-400" /> AI Brand Preview
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">Visualize your brand identity</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Style Selection */}
                        <div>
                            <p className="text-sm text-gray-400 mb-3">Select logo style:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {LOGO_STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`p-3 rounded-lg border text-left transition-all ${selectedStyle === style.id
                                                ? 'bg-pink-500/20 border-pink-500/50'
                                                : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <p className={`font-medium ${selectedStyle === style.id ? 'text-pink-300' : 'text-white'}`}>
                                            {style.label}
                                        </p>
                                        <p className="text-xs text-gray-400">{style.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logo Preview Area */}
                        <div className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all ${showLogoPreview ? 'border-pink-500/50 bg-gray-900/30' : 'border-gray-700 bg-gray-900/20'
                            }`}>
                            {showLogoPreview && logoPrompt ? (
                                <div className="text-center space-y-4 animate-fade-in w-full">
                                    {/* Generated Logo Concept */}
                                    <div className="relative">
                                        <div
                                            className="text-white font-bold text-5xl h-28 w-28 rounded-2xl flex items-center justify-center mx-auto shadow-2xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${colorPalette[0]}, ${colorPalette[1]})`
                                            }}
                                        >
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-gray-800 border border-gray-600 rounded-full p-1">
                                            <Sparkles size={14} className="text-yellow-400" />
                                        </div>
                                    </div>
                                    <p className="text-xl font-semibold text-white">{name}</p>
                                    <p className="text-sm text-gray-400 capitalize">{selectedStyle} Style</p>

                                    {/* Color Palette */}
                                    <div className="pt-4 border-t border-gray-700">
                                        <p className="text-xs text-gray-500 mb-3">Suggested Color Palette</p>
                                        <div className="flex justify-center">
                                            <ColorPalette colors={colorPalette} />
                                        </div>
                                    </div>

                                    {/* AI Prompt for external generators */}
                                    <div className="pt-4 text-left">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">AI Generation Prompt</p>
                                            <button
                                                onClick={copyPrompt}
                                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                            >
                                                {copiedPrompt ? <Check size={12} /> : <Copy size={12} />}
                                                {copiedPrompt ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                            <p className="text-xs text-gray-300 leading-relaxed">{logoPrompt.generatedPrompt}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Use this prompt with DALL-E, Midjourney, or any AI image generator
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-700/50 flex items-center justify-center mb-4">
                                        <Palette size={28} className="text-gray-500" />
                                    </div>
                                    <p className="text-gray-500 mb-4">Generate a logo concept for your brand</p>
                                    <button
                                        onClick={handleGenerateLogo}
                                        className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-pink-500/20 flex items-center gap-2 mx-auto"
                                    >
                                        <Sparkles size={16} /> Generate Concept
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Regenerate Button */}
                        {showLogoPreview && (
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={handleGenerateLogo}
                                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <RefreshCw size={14} /> Regenerate
                                </button>
                                <button
                                    onClick={copyPrompt}
                                    className="flex items-center gap-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 px-4 py-2 rounded-lg text-sm font-medium text-pink-300 transition-colors"
                                >
                                    <Download size={14} /> Copy Prompt
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tagline Suggestions */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="text-yellow-400" /> AI Tagline Suggestions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        `${name} - Where Innovation Meets Excellence`,
                        `Discover the Power of ${name}`,
                        `${name}: Your Success, Our Mission`,
                        `Transform with ${name}`,
                        `${name} - Built for Tomorrow`,
                        `Experience ${name} Differently`,
                    ].map((tagline, i) => (
                        <div key={i} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-yellow-500/30 transition-colors">
                            <p className="text-sm text-gray-300 italic">"{tagline}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
