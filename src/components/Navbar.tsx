import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                                FindAName
                            </span>
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/guide" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Documentation</Link>
                                {user && (
                                    <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                )}
                                {isAdmin && (
                                    <Link to="/admin" className="text-purple-400 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                                        <LayoutDashboard size={14} /> Admin
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <img className="h-8 w-8 rounded-full border border-gray-600" src={user.picture} alt="" />
                                    <span className="text-sm font-medium text-gray-200 hidden sm:block">{user.name}</span>
                                </div>
                                <button
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Sign in to access tools
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
