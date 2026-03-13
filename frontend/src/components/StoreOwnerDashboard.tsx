import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import walletService from '../services/walletService';

interface DashboardOverviewDto {
    totalRevenue: number;
    totalOrders: number;
    activeProducts: number;
}

interface RecentOrderDto {
    orderId: number;
    orderDate: string;
    customerName: string;
    storeTotalAmount: number;
    status: string;
    paymentMethod: string;
}

interface TopProductDto {
    productId: number;
    productName: string;
    imageUrl: string;
    quantitySold: number;
    revenue: number;
}

const StoreOwnerDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrderDto[]>([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [topProducts, setTopProducts] = useState<TopProductDto[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (user === null) {
            navigate('/login');
            return;
        }
        if (user.role !== 'StoreOwner') {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const [overviewData, ordersData, productsData, walletData] = await Promise.all([
                    dashboardService.getOverviewMetrics(),
                    orderService.getStoreOrders(),
                    dashboardService.getTopProducts(),
                    walletService.getWallet()
                ]);

                setOverview(overviewData);
                setRecentOrders(ordersData);
                setTopProducts(productsData);
                setWalletBalance(walletData.balance);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load dashboard data. Ensure you have registered a store.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate, authLoading]);

    if (authLoading || loading) return <div className="p-8 text-center text-gray-600">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getFilteredOrders = () => {
        if (filterStatus === 'All') return recentOrders;
        return recentOrders.filter(o => o.status === filterStatus);
    };

    const handleUpdateStatus = async (orderId: number, status: string) => {
        if (!window.confirm(`Are you sure you want to change order #${orderId} status to ${status}?`)) return;
        try {
            await orderService.updateStoreOrderStatus(orderId, status);
            // Refresh orders
            const ordersData = await orderService.getStoreOrders();
            setRecentOrders(ordersData);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Store Owner Dashboard</h1>
                    <button
                        onClick={() => navigate('/store-settings')}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg font-bold active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Store Settings
                    </button>
                </div>

                {/* Overview KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-gray-800">{overview ? formatCurrency(overview.totalRevenue) : 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-gray-800">{overview?.totalOrders || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Active Products</h3>
                        <p className="text-3xl font-bold text-gray-800">{overview?.activeProducts || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-teal-500 rounded-xl shadow p-6 text-white cursor-pointer hover:opacity-90 transition" onClick={() => navigate('/wallet')}>
                        <h3 className="text-green-100 text-sm font-semibold uppercase tracking-wider mb-2">Wallet Balance</h3>
                        <p className="text-3xl font-bold">{formatCurrency(walletBalance)}</p>
                        <p className="text-xs mt-2 text-green-100 italic">Click to view/withdraw</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders Table */}
                    <div className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Order Management</h2>
                            <div className="flex gap-2">
                                {['All', 'Pending', 'Paid', 'Approved', 'Shipped', 'Cancelled'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-3 py-1 rounded-md text-xs font-semibold transition ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto flex-grow">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                                        <th className="px-6 py-3 font-semibold">Order ID</th>
                                        <th className="px-6 py-3 font-semibold">Customer</th>
                                        <th className="px-6 py-3 font-semibold">Amount</th>
                                        <th className="px-6 py-3 font-semibold">Status</th>
                                        <th className="px-6 py-3 font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {getFilteredOrders().length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found in this category</td></tr>
                                    ) : (
                                        getFilteredOrders().map((order) => (
                                            <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 cursor-pointer hover:text-green-600" onClick={() => navigate(`/order/${order.orderId}`)}>#{order.orderId}</td>
                                                <td className="px-6 py-4 text-gray-600">{order.customerName || 'Guest'}</td>
                                                <td className="px-6 py-4 text-green-600 font-semibold">{formatCurrency(order.storeTotalAmount)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'}`}>
                                                        {order.status || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {(order.status === 'Paid' || (order.status === 'Pending' && order.paymentMethod === 'COD')) && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(order.orderId, 'Approved')}
                                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {order.status === 'Approved' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(order.orderId, 'Shipped')}
                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                                                            >
                                                                Ship
                                                            </button>
                                                        )}
                                                        {(order.status === 'Paid' || order.status === 'Approved') && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(order.orderId, 'Cancelled')}
                                                                className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Products List */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Top Selling Products</h2>
                        </div>
                        <div className="p-6">
                            {topProducts.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">No product data available</div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {topProducts.map((product) => (
                                        <li key={product.productId} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.productName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">🛍️</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{product.productName}</p>
                                                    <p className="text-sm text-gray-500">{product.quantitySold} units sold</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreOwnerDashboard;
