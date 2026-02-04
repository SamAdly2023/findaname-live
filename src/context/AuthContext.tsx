import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';

// Mock types for our "lightsql" simulation
export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'pro';

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
}

interface SearchRecord {
    id: string;
    term: string;
    tool: string;
    date: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: any) => void;
    logout: () => void;
    isAdmin: boolean;
    canSearch: () => boolean;
    recordSearch: (term: string, tool: string) => void;
    upgradePlan: (paymentDetails?: any) => void;
    // Admin functions
    getAllUsers: () => User[];
    updateUserPlan: (userId: string, plan: PlanType) => void;
    switchViewMode: () => void; // For admin to toggle views
    viewMode: 'admin' | 'client';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persistent storage key
const STORAGE_KEY = 'findaname_db_v2';
const ADMIN_EMAIL = 'samadly728@gmail.com';

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

    const login = (googleData: any) => {
        // Data from Google might vary slightly depending on the wrapper
        // We expect: email, name, picture
        const email = googleData.email;
        const name = googleData.name;
        const picture = googleData.picture;

        // Check if user exists in our "db"
        let existingUser = db.users.find(u => u.email === email);

        if (!existingUser) {
            // Create new user
            const newUser: User = {
                id: crypto.randomUUID(),
                email,
                name,
                picture,
                role: email === ADMIN_EMAIL ? 'admin' : 'user',
                plan: 'free',
                credits: 3,
                lastResetDate: new Date().toISOString(),
                searches: []
            };

            setDb(prev => ({ ...prev, users: [...prev.users, newUser] }));
            existingUser = newUser;
        } else {
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
                // Update DB with reset credits
                setDb(prev => ({
                    users: prev.users.map(u => u.email === email ? existingUser! : u)
                }));
            }
        }

        setUser(existingUser);
        // Default admin to admin view on login
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

    // Strict admin check
    const isAdmin = user?.email === ADMIN_EMAIL;

    const canSearch = () => {
        if (!user) return false; // Must be logged in
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
    const getAllUsers = () => {
        return db.users;
    };

    const updateUserPlan = (userId: string, plan: PlanType) => {
        // Prevent updating if not admin (double check)
        if (!isAdmin) return;

        setDb(prev => ({
            users: prev.users.map(u => u.id === userId ? { ...u, plan } : u)
        }));
    };

    const switchViewMode = () => {
        if (!isAdmin) return;
        setViewMode(prev => prev === 'admin' ? 'client' : 'admin');
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
            getAllUsers,
            updateUserPlan,
            switchViewMode,
            viewMode
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
