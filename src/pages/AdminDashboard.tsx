import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PlanType } from '../context/AuthContext';
import { Shield, Search, CheckCircle, XCircle, Layout, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user, getAllUsers, updateUserPlan, switchViewMode, logout } = useAuth();
    const navigate = useNavigate();
    const allUsers = getAllUsers();

    if (user?.role !== 'admin') {
        return <div className="p-10 text-center text-red-400">Access Denied. Admin only.</div>;
    }

    const handleSwitchView = () => {
        switchViewMode();
        navigate('/dashboard'); // Go to client dashboard route (AuthContext will display Client view logic if viewMode is 'client')
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="text-purple-500" /> Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Manage users, view activity, and adjust plans. (Only visible to {user.email})</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={handleSwitchView}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                            <Layout size={18} /> View as Client
                        </button>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <span className="text-2xl font-bold text-purple-400">{allUsers.length}</span>
                            <span className="ml-2 text-gray-400">Total Users</span>
                        </div>
                        <button onClick={logout} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="p-4 font-semibold text-gray-300">User</th>
                                <th className="p-4 font-semibold text-gray-300">Plan</th>
                                <th className="p-4 font-semibold text-gray-300">Usage</th>
                                <th className="p-4 font-semibold text-gray-300">Role</th>
                                <th className="p-4 font-semibold text-gray-300">Recent Activity</th>
                                <th className="p-4 font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {allUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-750 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {u.picture && <img src={u.picture} alt="" className="w-10 h-10 rounded-full" />}
                                            <div>
                                                <div className="font-medium">{u.name}</div>
                                                <div className="text-xs text-gray-400">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.plan === 'pro' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {u.plan.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <span className={u.credits === 0 && u.plan === 'free' ? 'text-red-400' : 'text-gray-300'}>
                                                {u.plan === 'pro' ? '∞' : u.credits}
                                            </span>
                                            <span className="text-gray-500"> / {u.plan === 'pro' ? '∞' : '3'} credits</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="capitalize text-gray-400">{u.role}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-gray-400 max-w-[200px]">
                                            {u.searches && u.searches.length > 0 ? (
                                                <>
                                                    <div className="truncate text-white">Latest: "{u.searches[0].term}"</div>
                                                    <div>{new Date(u.searches[0].date).toLocaleDateString()} via {u.searches[0].tool}</div>
                                                </>
                                            ) : (
                                                'No activity'
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-purple-500 outline-none hover:bg-gray-800 cursor-pointer"
                                                value={u.plan}
                                                onChange={(e) => updateUserPlan(u.id, e.target.value as PlanType)}
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
