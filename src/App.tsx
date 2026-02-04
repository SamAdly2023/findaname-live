
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
import { DomainGeneratorTool } from './components/DomainGeneratorTool';

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
