import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';

// Mock types for our "lightsql" simulation
export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'pro';

interface AffiliateStats {
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    pendingReferrals: number;
    creditsEarned: number;
    referredUsers: string[]; // User IDs
}

interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    role: UserRole;
    plan: PlanType;
    credits: number; // For free plan
    lastResetDate: string; // ISO date string for monthly reset
    searches: SearchRecord[];
    // Affiliate system
    affiliateStats: AffiliateStats;
    referredBy?: string; // User ID of referrer
    joinedAt: string;
}

interface SearchRecord {
    id: string;
    term: string;
    tool: string;
    date: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: any, referralCode?: string) => void;
    logout: () => void;
    isAdmin: boolean;
    canSearch: () => boolean;
    recordSearch: (term: string, tool: string) => void;
    upgradePlan: (paymentDetails?: any) => void;
    addCredits: (amount: number) => void;
    // Admin functions
    getAllUsers: () => User[];
    updateUserPlan: (userId: string, plan: PlanType) => void;
    updateUserCredits: (userId: string, credits: number) => void;
    deleteUser: (userId: string) => void;
    getAnalytics: () => DashboardAnalytics;
    switchViewMode: () => void;
    viewMode: 'admin' | 'client';
    // Affiliate functions
    processReferral: (referralCode: string) => void;
    getAffiliateLeaderboard: () => AffiliateLeaderboardEntry[];
}

interface DashboardAnalytics {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    totalSearches: number;
    totalCreditsUsed: number;
    revenueEstimate: number;
    newUsersThisMonth: number;
    activeUsersToday: number;
    topTools: { tool: string; count: number }[];
    userGrowth: { date: string; count: number }[];
}

interface AffiliateLeaderboardEntry {
    userId: string;
    userName: string;
    userPicture: string;
    totalReferrals: number;
    creditsEarned: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persistent storage key
const STORAGE_KEY = 'findaname_db_v3';
const ADMIN_EMAIL = 'samadly728@gmail.com';
const AFFILIATE_CREDIT_REWARD = 3;
const BASE_URL = 'https://findaname.live';

// Generate unique referral code
const generateReferralCode = (userId: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FAN-${code}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [db, setDb] = useState<{ users: User[] }>({ users: [] });
    const [viewMode, setViewMode] = useState<'admin' | 'client'>('client');

    // Load "Database" from localStorage
    useEffect(() => {
        const storedDb = localStorage.getItem(STORAGE_KEY);
        if (storedDb) {
            setDb(JSON.parse(storedDb));
        }
    }, []);

    // Save "Database" to localStorage whenever it changes
    useEffect(() => {
        if (db.users.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        }
    }, [db]);

    // Update current user state if db changes (e.g. admin updates plan)
    useEffect(() => {
        if (user) {
            const upToDateUser = db.users.find(u => u.email === user.email);
            if (upToDateUser && JSON.stringify(upToDateUser) !== JSON.stringify(user)) {
                setUser(upToDateUser);
            }
        }
    }, [db, user]);

    // Check for referral code in URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            sessionStorage.setItem('pendingReferral', refCode);
        }
    }, []);

    const login = (googleData: any, referralCode?: string) => {
        const email = googleData.email;
        const name = googleData.name;
        const picture = googleData.picture;

        // Check for pending referral from URL
        const pendingRef = referralCode || sessionStorage.getItem('pendingReferral');

        let existingUser = db.users.find(u => u.email === email);

        if (!existingUser) {
            const newUserId = crypto.randomUUID();
            const refCode = generateReferralCode(newUserId);

            // Create new user with affiliate system
            const newUser: User = {
                id: newUserId,
                email,
                name,
                picture,
                role: email === ADMIN_EMAIL ? 'admin' : 'user',
                plan: 'free',
                credits: 3,
                lastResetDate: new Date().toISOString(),
                searches: [],
                joinedAt: new Date().toISOString(),
                affiliateStats: {
                    referralCode: refCode,
                    referralLink: `${BASE_URL}?ref=${refCode}`,
                    totalReferrals: 0,
                    pendingReferrals: 0,
                    creditsEarned: 0,
                    referredUsers: []
                }
            };

            // Process referral if there's a valid code
            if (pendingRef) {
                const referrer = db.users.find(u => u.affiliateStats?.referralCode === pendingRef);
                if (referrer && referrer.id !== newUserId) {
                    // Give bonus credits to new user
                    newUser.credits += AFFILIATE_CREDIT_REWARD;
                    newUser.referredBy = referrer.id;

                    // Update referrer's stats and credits
                    const updatedReferrer = {
                        ...referrer,
                        credits: referrer.credits + AFFILIATE_CREDIT_REWARD,
                        affiliateStats: {
                            ...referrer.affiliateStats,
                            totalReferrals: referrer.affiliateStats.totalReferrals + 1,
                            creditsEarned: referrer.affiliateStats.creditsEarned + AFFILIATE_CREDIT_REWARD,
                            referredUsers: [...referrer.affiliateStats.referredUsers, newUserId]
                        }
                    };

                    setDb(prev => ({
                        users: [...prev.users.map(u => u.id === referrer.id ? updatedReferrer : u), newUser]
                    }));
                } else {
                    setDb(prev => ({ ...prev, users: [...prev.users, newUser] }));
                }
                sessionStorage.removeItem('pendingReferral');
            } else {
                setDb(prev => ({ ...prev, users: [...prev.users, newUser] }));
            }

            existingUser = newUser;
        } else {
            // Migrate existing user to have affiliate stats if missing
            if (!existingUser.affiliateStats) {
                const refCode = generateReferralCode(existingUser.id);
                existingUser = {
                    ...existingUser,
                    joinedAt: existingUser.joinedAt || new Date().toISOString(),
                    affiliateStats: {
                        referralCode: refCode,
                        referralLink: `${BASE_URL}?ref=${refCode}`,
                        totalReferrals: 0,
                        pendingReferrals: 0,
                        creditsEarned: 0,
                        referredUsers: []
                    }
                };
                setDb(prev => ({
                    users: prev.users.map(u => u.email === email ? existingUser! : u)
                }));
            }

            // Check if monthly reset is needed
            const lastReset = new Date(existingUser.lastResetDate);
            const now = new Date();
            const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

            if (isNewMonth && existingUser.plan === 'free') {
                existingUser = {
                    ...existingUser,
                    credits: 3,
                    lastResetDate: now.toISOString()
                };
                setDb(prev => ({
                    users: prev.users.map(u => u.email === email ? existingUser! : u)
                }));
            }
        }

        setUser(existingUser);
        if (existingUser.role === 'admin') {
            setViewMode('admin');
        } else {
            setViewMode('client');
        }
    };

    const logout = () => {
        googleLogout();
        setUser(null);
        setViewMode('client');
    };

    const isAdmin = user?.email === ADMIN_EMAIL;

    const canSearch = () => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (user.plan === 'pro') return true;
        return user.credits > 0;
    };

    const recordSearch = (term: string, tool: string) => {
        if (!user) return;

        const newRecord: SearchRecord = {
            id: crypto.randomUUID(),
            term,
            tool,
            date: new Date().toISOString()
        };

        const updatedUser = {
            ...user,
            searches: [newRecord, ...user.searches],
            credits: user.plan === 'free' ? Math.max(0, user.credits - 1) : user.credits
        };

        setUser(updatedUser);
        setDb(prev => ({
            users: prev.users.map(u => u.id === user.id ? updatedUser : u)
        }));
    };

    const addCredits = (amount: number) => {
        if (!user) return;
        const updatedUser = { ...user, credits: user.credits + amount };
        setUser(updatedUser);
        setDb(prev => ({
            users: prev.users.map(u => u.id === user.id ? updatedUser : u)
        }));
    };

    const upgradePlan = (paymentDetails?: any) => {
        if (!user) return;
        const updatedUser: User = { ...user, plan: 'pro' };
        setUser(updatedUser);
        setDb(prev => ({
            users: prev.users.map(u => u.id === user.id ? updatedUser : u)
        }));
        console.log("Plan upgraded for user:", user.email, "Payment:", paymentDetails);
    };

    // Admin Functions
    const getAllUsers = () => db.users;

    const updateUserPlan = (userId: string, plan: PlanType) => {
        if (!isAdmin) return;
        setDb(prev => ({
            users: prev.users.map(u => u.id === userId ? { ...u, plan } : u)
        }));
    };

    const updateUserCredits = (userId: string, credits: number) => {
        if (!isAdmin) return;
        setDb(prev => ({
            users: prev.users.map(u => u.id === userId ? { ...u, credits } : u)
        }));
    };

    const deleteUser = (userId: string) => {
        if (!isAdmin) return;
        if (db.users.find(u => u.id === userId)?.email === ADMIN_EMAIL) return; // Can't delete admin
        setDb(prev => ({
            users: prev.users.filter(u => u.id !== userId)
        }));
    };

    const getAnalytics = (): DashboardAnalytics => {
        const users = db.users;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const today = now.toDateString();

        const proUsers = users.filter(u => u.plan === 'pro').length;
        const freeUsers = users.filter(u => u.plan === 'free').length;
        const totalSearches = users.reduce((acc, u) => acc + (u.searches?.length || 0), 0);

        const newUsersThisMonth = users.filter(u => {
            const joinDate = new Date(u.joinedAt || u.lastResetDate);
            return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
        }).length;

        const activeUsersToday = users.filter(u => {
            const lastSearch = u.searches?.[0];
            return lastSearch && new Date(lastSearch.date).toDateString() === today;
        }).length;

        // Tool usage analytics
        const toolCounts: Record<string, number> = {};
        users.forEach(u => {
            u.searches?.forEach(s => {
                toolCounts[s.tool] = (toolCounts[s.tool] || 0) + 1;
            });
        });
        const topTools = Object.entries(toolCounts)
            .map(([tool, count]) => ({ tool, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // User growth (last 7 days simulation)
        const userGrowth = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count: Math.floor(users.length * (0.8 + Math.random() * 0.4) / 7 * (i + 1))
            };
        });

        return {
            totalUsers: users.length,
            proUsers,
            freeUsers,
            totalSearches,
            totalCreditsUsed: totalSearches,
            revenueEstimate: proUsers * 49, // $49/month
            newUsersThisMonth,
            activeUsersToday,
            topTools,
            userGrowth
        };
    };

    const switchViewMode = () => {
        if (!isAdmin) return;
        setViewMode(prev => prev === 'admin' ? 'client' : 'admin');
    };

    const processReferral = (referralCode: string) => {
        // This is called when processing a manual referral
        const referrer = db.users.find(u => u.affiliateStats?.referralCode === referralCode);
        if (referrer && user && referrer.id !== user.id && !user.referredBy) {
            // Update current user
            const updatedUser = {
                ...user,
                credits: user.credits + AFFILIATE_CREDIT_REWARD,
                referredBy: referrer.id
            };

            // Update referrer
            const updatedReferrer = {
                ...referrer,
                credits: referrer.credits + AFFILIATE_CREDIT_REWARD,
                affiliateStats: {
                    ...referrer.affiliateStats,
                    totalReferrals: referrer.affiliateStats.totalReferrals + 1,
                    creditsEarned: referrer.affiliateStats.creditsEarned + AFFILIATE_CREDIT_REWARD,
                    referredUsers: [...referrer.affiliateStats.referredUsers, user.id]
                }
            };

            setUser(updatedUser);
            setDb(prev => ({
                users: prev.users.map(u => {
                    if (u.id === user.id) return updatedUser;
                    if (u.id === referrer.id) return updatedReferrer;
                    return u;
                })
            }));
        }
    };

    const getAffiliateLeaderboard = (): AffiliateLeaderboardEntry[] => {
        return db.users
            .filter(u => u.affiliateStats && u.affiliateStats.totalReferrals > 0)
            .map(u => ({
                userId: u.id,
                userName: u.name,
                userPicture: u.picture,
                totalReferrals: u.affiliateStats.totalReferrals,
                creditsEarned: u.affiliateStats.creditsEarned
            }))
            .sort((a, b) => b.totalReferrals - a.totalReferrals)
            .slice(0, 10);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAdmin,
            canSearch,
            recordSearch,
            upgradePlan,
            addCredits,
            getAllUsers,
            updateUserPlan,
            updateUserCredits,
            deleteUser,
            getAnalytics,
            switchViewMode,
            viewMode,
            processReferral,
            getAffiliateLeaderboard
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
