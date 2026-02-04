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
                            <div className="bg-white p-1 rounded-lg">
                                <img
                                    src="/Find-a-name-logo.png"
                                    alt="FindAName"
                                    className="h-8 w-auto"
                                />
                            </div>
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
                            <Link
                                to="/"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Start Now for Free
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
