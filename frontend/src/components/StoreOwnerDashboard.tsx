import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
}

interface TopProductDto {
    productId: number;
    productName: string;
    imageUrl: string;
    quantitySold: number;
    revenue: number;
}

const StoreOwnerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrderDto[]>([]);
    const [topProducts, setTopProducts] = useState<TopProductDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
                const [overviewData, ordersData, productsData] = await Promise.all([
                    dashboardService.getOverviewMetrics(),
                    dashboardService.getRecentOrders(),
                    dashboardService.getTopProducts()
                ]);

                setOverview(overviewData);
                setRecentOrders(ordersData);
                setTopProducts(productsData);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load dashboard data. Ensure you have registered a store.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    if (loading) return <div className="p-8 text-center text-gray-600">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Store Owner Dashboard</h1>

                {/* Overview KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders Table */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Recent Orders (Action Needed)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                                        <th className="px-6 py-3 font-semibold">Order ID</th>
                                        <th className="px-6 py-3 font-semibold">Customer</th>
                                        <th className="px-6 py-3 font-semibold">Amount</th>
                                        <th className="px-6 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent orders</td></tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">#{order.orderId}</td>
                                                <td className="px-6 py-4 text-gray-600">{order.customerName || 'Guest'}</td>
                                                <td className="px-6 py-4 text-green-600 font-semibold">{formatCurrency(order.storeTotalAmount)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {order.status || 'Unknown'}
                                                    </span>
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
