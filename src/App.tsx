
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleOneTapLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages & Components
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserGuide from './pages/UserGuide';

// Existing App Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DomainCard } from './components/DomainCard';
import { WhoisModal } from './components/WhoisModal';
import { ProgressBar } from './components/ProgressBar';
import { generateDomains, checkAvailability, getWhoisInfo } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DomainInfo, WhoisData } from './types';
import { SearchIcon, LoaderIcon } from './components/icons/Icons';

// --- MAIN TOOL COMPONENT (Wrapped in old App logic) ---
const DomainGeneratorTool: React.FC = () => {
    const [keyword, setKeyword] = useState<string>('');
    const [domains, setDomains] = useState<DomainInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteDomains', []);
    const [selectedDomain, setSelectedDomain] = useState<DomainInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
    const [isLoadingWhois, setIsLoadingWhois] = useState<boolean>(false);
    const [whoisError, setWhoisError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const progressInterval = useRef<any>(null);

    const { canSearch, recordSearch } = useAuth(); // Use Auth Context

    useEffect(() => {
        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, []);

    const startProgress = () => {
        setProgress(0);
        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 500);
    };

    const stopProgress = () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
        setProgress(100);
        setTimeout(() => setProgress(0), 1000);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        // Check Credits
        if (!canSearch()) {
            alert("You have reached your search limit for this month. Please upgrade to Pro!");
            return;
        }

        setIsLoading(true);
        setError(null);
        setDomains([]);
        startProgress();

        try {
            const results = await generateDomains(keyword.trim());
            setDomains(results);
            recordSearch(keyword, "Domain Generator"); // Record usage
        } catch (err: any) {
            console.error(err);
            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (err.message.includes('VITE_GEMINI_API_KEY')) {
                errorMessage = 'Configuration Error: Gemini API Key is missing. Please check your settings.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            stopProgress();
        }
    };

    const handleApply = async () => {
        if (domains.length === 0) return;
        setIsLoading(true);
        try {
            const updatedDomains = await checkAvailability(domains);
            setDomains(updatedDomains);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }


    const toggleFavorite = (domain: string) => {
        setFavorites(prev =>
            prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
        );
    };

    const handleWhoisCheck = async (domain: string) => {
        setSelectedDomain(domains.find(d => d.name === domain) || { name: domain, available: false, description: '' });
        setIsModalOpen(true);
        setIsLoadingWhois(true);
        setWhoisError(null);
        setWhoisData(null);

        try {
            const data = await getWhoisInfo(domain);
            setWhoisData(data);
        } catch (err: any) {
            console.error("Whois Error", err);
            setWhoisError("Failed to fetch WHOIS data. " + (err.message || ""));
        } finally {
            setIsLoadingWhois(false);
        }
    };


    return (
        <div className="bg-gray-900 text-white flex flex-col min-h-[calc(100vh-64px)]">
            <div className="flex-grow container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Domain Generator</h1>
                    <p className="text-gray-400">Enter a keyword to generate brandable domain names using AI.</p>
                </div>

                <form onSubmit={handleGenerate} className="max-w-2xl mx-auto mb-12 relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Enter a keyword (e.g., 'crypto', 'fitness', 'travel')"
                            className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-full text-lg focus:outline-none focus:border-indigo-500 transition-colors pl-14"
                        />
                        <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <LoaderIcon className="animate-spin" /> : 'Generate'}
                        </button>
                    </div>
                    {error && <p className="text-red-400 mt-4 text-center bg-red-900/20 p-3 rounded-lg border border-red-500/20">{error}</p>}
                </form>

                <ProgressBar progress={progress} isVisible={isLoading} />

                {domains.length > 0 && (
                    <div className="mb-8 flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <span className="text-gray-300">{domains.length} suggestions found</span>
                        <button onClick={handleApply} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-bold transition-colors">
                            Check Availability
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {domains.map((domain) => (
                        <DomainCard
                            key={domain.name}
                            domain={domain}
                            isFavorite={favorites.includes(domain.name)}
                            onToggleFavorite={() => toggleFavorite(domain.name)}
                            onWhois={() => handleWhoisCheck(domain.name)}
                        />
                    ))}
                </div>

                <WhoisModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    domain={selectedDomain?.name || ''}
                    data={whoisData}
                    isLoading={isLoadingWhois}
                    error={whoisError}
                />

            </div>
        </div>
    );
}

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element, requireAdmin?: boolean }) => {
    const { user, isAdmin } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
};



function AppContent() {
    const { login, user } = useAuth();

    useGoogleOneTapLogin({
        onSuccess: (credentialResponse) => {
            if (credentialResponse.credential) {
                try {
                    const decoded = jwtDecode(credentialResponse.credential);
                    console.log("One Tap Success", decoded);
                    login(decoded);
                } catch (error) {
                    console.error("Token decoding failed", error);
                }
            }
        },
        onError: () => console.log('One Tap Login Failed'),
        disabled: !!user, // Disable if already logged in
    });

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/guide" element={<UserGuide />} />

                {/* Protected Dashboard - Redirects based on role */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardDispatcher />
                    </ProtectedRoute>
                } />

                {/* Protected Admin */}
                <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Domain Generator Tool */}
                <Route path="/tool/generator" element={
                    <ProtectedRoute>
                        <DomainGeneratorTool />
                    </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
        </div>
    );
}

// Dispatcher to show Client or Admin view based on 'viewMode'
const DashboardDispatcher = () => {
    const { viewMode } = useAuth();
    return viewMode === 'admin' ? <AdminDashboard /> : <ClientDashboard />;
};

function App() {
    // NOTE: Replace this Client ID with the one you provide later
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "Please-Replace-With-Your-Google-Client-ID";

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}


export default App;
