import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import type { AdminStats, AdminStore } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { UserProfileDto } from '../types';
import api from '../services/api';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WithdrawalAdminItem {
    requestId: number;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    status: string;
    adminNote?: string;
    createdAt: string;
    userFullName?: string;
    userEmail?: string;
}

const AdminDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [pendingStores, setPendingStores] = useState<AdminStore[]>([]);
    const [users, setUsers] = useState<UserProfileDto[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalAdminItem[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'users' | 'withdrawals'>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [growthData, setGrowthData] = useState<{ month: string; orders: number; revenue: number }[]>([]);

    useEffect(() => {
        if (authLoading) return;

        if (user === null) {
            navigate('/login');
            return;
        }
        if (user.role !== 'Admin') {
            navigate('/');
            return;
        }

        const fetchAdminData = async () => {
            try {
                const [statsData, pendingData, usersData, growthRes] = await Promise.all([
                    adminService.getStats(),
                    adminService.getPendingStores(),
                    adminService.getAllUsers(),
                    api.get('/Admin/growth?months=6')
                ]);

                setStats(statsData);
                setPendingStores(pendingData);
                setUsers(usersData);
                setGrowthData(growthRes.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load admin data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [user, navigate, authLoading]);

    const handleApprove = async (storeId: number) => {
        if (!window.confirm('Are you sure you want to approve this store?')) return;
        try {
            await adminService.approveStore(storeId);
            setPendingStores(pendingStores.filter(s => s.storeId !== storeId));
            // Refresh stats
            const statsData = await adminService.getStats();
            setStats(statsData);
        } catch (err) {
            alert('Failed to approve store');
        }
    };

    const handleReject = async (storeId: number) => {
        if (!window.confirm('Are you sure you want to reject this store?')) return;
        try {
            await adminService.rejectStore(storeId);
            setPendingStores(pendingStores.filter(s => s.storeId !== storeId));
            // Refresh stats
            const statsData = await adminService.getStats();
            setStats(statsData);
        } catch (err) {
            alert('Failed to reject store');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (authLoading || loading) return <div className="p-8 text-center text-gray-600">Loading Admin Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Admin Control Panel</h1>
                    <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'overview' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('stores')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'stores' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Stores {pendingStores.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingStores.length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'users' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            👥 Users
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('withdrawals');
                                api.get('/Withdrawal/all').then(r => setWithdrawals(r.data)).catch(console.error);
                            }}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'withdrawals' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            💸 Rút tiền
                            {withdrawals.filter(w => w.status === 'Pending').length > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-black">
                                    {withdrawals.filter(w => w.status === 'Pending').length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-green-200 transition duration-300">
                                <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Users</div>
                                <div className="text-4xl font-black text-gray-800">{stats?.totalUsers}</div>
                                <div className="mt-4 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg inline-block">System Wide</div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-blue-200 transition duration-300">
                                <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Stores</div>
                                <div className="text-4xl font-black text-gray-800">{stats?.totalStores}</div>
                                <div className="mt-4 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block">{stats?.pendingStoreApprovals} pending</div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-purple-200 transition duration-300">
                                <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Orders</div>
                                <div className="text-4xl font-black text-gray-800">{stats?.totalOrders}</div>
                                <div className="mt-4 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg inline-block">All Time</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-600 to-teal-700 p-8 rounded-[2rem] shadow-xl text-white group hover:scale-[1.02] transition duration-300">
                                <div className="text-green-100 text-xs font-black uppercase tracking-widest mb-2">Total Revenue</div>
                                <div className="text-3xl font-black">{formatCurrency(stats?.totalRevenue || 0)}</div>
                                <div className="mt-4 text-[10px] font-bold text-white/80 bg-white/10 px-2 py-1 rounded-lg inline-block flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                                    Live Data
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Placeholder */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-800 mb-6">Quick Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">📊 Đơn hàng & Doanh thu theo tháng</h3>
                                    <div className="h-[250px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={growthData}
                                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="month" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: number, name: string) => [name === 'revenue' ? `${value.toLocaleString()} VND` : value, name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']}
                                                />
                                                <Area yAxisId="left" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                                                <Area yAxisId="right" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Alerts & Notifications</h3>
                                    <div className="space-y-3">
                                        {pendingStores.length > 0 ? (
                                            <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">⚠️</div>
                                                <div>
                                                    <div className="font-bold text-orange-950">Store Registration Pending</div>
                                                    <div className="text-xs text-orange-800 font-medium">{pendingStores.length} stores are waiting for your approval.</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-2xl">
                                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✅</div>
                                                <div>
                                                    <div className="font-bold text-green-950">System healthy</div>
                                                    <div className="text-xs text-green-800 font-medium">All store approvals are up to date.</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stores' && (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-800">Pending Approvals</h2>
                            <span className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-black text-gray-500 uppercase tracking-widest">
                                {pendingStores.length} stores
                            </span>
                        </div>
                        <div className="p-4">
                            {pendingStores.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="text-6xl mb-6 opacity-20">🏪</div>
                                    <h3 className="text-xl font-bold text-gray-400">No stores pending approval</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {pendingStores.map(store => (
                                        <div key={store.storeId} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl font-black text-green-600">
                                                    {store.storeName[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-800 leading-tight">{store.storeName}</h3>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Owner: {store.ownerName}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-xs flex items-center gap-2 text-gray-500">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    {store.storeEmail}
                                                </div>
                                                <div className="text-xs flex items-center gap-2 text-gray-500">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    {store.storePhone}
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => handleApprove(store.storeId)}
                                                    className="flex-grow bg-green-600 text-white font-black py-3 rounded-2xl hover:bg-green-700 transition active:scale-95 text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(store.storeId)}
                                                    className="px-6 bg-red-50 text-red-600 font-black py-3 rounded-2xl hover:bg-red-100 transition active:scale-95 text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-10 py-8 border-b border-gray-50">
                            <h2 className="text-2xl font-black text-gray-800">User Directory</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">
                                        <th className="px-10 py-6">User</th>
                                        <th className="px-10 py-6">Contact</th>
                                        <th className="px-10 py-6">Role</th>
                                        <th className="px-10 py-6">Address</th>
                                        <th className="px-10 py-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map(u => (
                                        <tr key={u.userId} className="hover:bg-gray-50/50 transition duration-150 group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-black text-gray-500 text-sm">
                                                        {u.fullName?.[0] || u.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800 group-hover:text-green-600 transition">{u.fullName || 'Anonymous'}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold">ID: #{u.userId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="text-sm font-medium text-gray-600">{u.email}</div>
                                                <div className="text-xs text-gray-400">{u.phoneNumber || 'No phone'}</div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                    ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                        u.role === 'StoreOwner' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                    {u.role || 'User'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="text-xs text-gray-500 max-w-[200px] line-clamp-1">{u.address || 'Not set'}</div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <button className="text-gray-300 hover:text-gray-600 transition p-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-10 py-8 border-b border-gray-50">
                            <h2 className="text-2xl font-black text-gray-800">💸 Quản lý yêu cầu rút tiền</h2>
                            <p className="text-gray-400 text-sm mt-1">Xem xét và duyệt/từ chối các yêu cầu rút tiền của người dùng.</p>
                        </div>
                        <div className="p-8 space-y-4">
                            {withdrawals.length === 0 ? (
                                <p className="text-center text-gray-400 py-10">Chưa có yêu cầu rút tiền nào.</p>
                            ) : (
                                withdrawals.map(w => (
                                    <div key={w.requestId} className={`rounded-2xl border p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${w.status === 'Pending' ? 'border-yellow-200 bg-yellow-50' :
                                        w.status === 'Approved' ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'
                                        }`}>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-black text-xl text-gray-800">{w.amount.toLocaleString()} VND</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${w.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                                                    w.status === 'Approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                                    }`}>{w.status === 'Pending' ? '⏳ Đang xử lý' : w.status === 'Approved' ? '✅ Đã duyệt' : '❌ Từ chối'}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium">{w.userFullName} ({w.userEmail})</p>
                                            <p className="text-sm text-gray-500">Ngân hàng: <strong>{w.bankName}</strong> • STK: <strong>{w.accountNumber}</strong> • Chủ TK: <strong>{w.accountHolder}</strong></p>
                                            <p className="text-xs text-gray-400 mt-1">Gửi lúc: {new Date(w.createdAt).toLocaleString()}</p>
                                            {w.adminNote && <p className="text-xs text-gray-500 italic mt-1">Ghi chú: {w.adminNote}</p>}
                                        </div>
                                        {w.status === 'Pending' && (
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm(`Duyệt yêu cầu rút ${w.amount.toLocaleString()} VND của ${w.userFullName}? Tiền sẽ bị trừ khỏi ví ngay.`)) return;
                                                        try {
                                                            await api.post(`/Withdrawal/${w.requestId}/approve`, { note: 'Đã chuyển khoản thành công.' });
                                                            const r = await api.get('/Withdrawal/all');
                                                            setWithdrawals(r.data);
                                                        } catch (e: any) { alert(e.response?.data?.message || 'Lỗi'); }
                                                    }}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition"
                                                >
                                                    ✅ Duyệt
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const note = window.prompt('Lý do từ chối (tuỳ chọn):');
                                                        if (note === null) return; // cancelled
                                                        try {
                                                            await api.post(`/Withdrawal/${w.requestId}/reject`, { note: note || 'Yêu cầu không hợp lệ.' });
                                                            const r = await api.get('/Withdrawal/all');
                                                            setWithdrawals(r.data);
                                                        } catch (e: any) { alert(e.response?.data?.message || 'Lỗi'); }
                                                    }}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition"
                                                >
                                                    ❌ Từ chối
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
