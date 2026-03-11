import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

interface Order {
    orderId: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
}

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const data = await orderService.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading your orders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">My Orders</h1>
            
            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <Link to="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center sm:items-start border-b border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order Placed</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="mt-3 sm:mt-0 text-center sm:text-right">
                                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                    <p className="font-bold text-green-600">{order.totalAmount.toLocaleString()} VND</p>
                                </div>
                                <div className="mt-3 sm:mt-0">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'Paid' || order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="mt-3 sm:mt-0">
                                    <Link to={`/orders/${order.orderId}`} className="text-green-600 hover:text-green-800 font-medium text-sm transition">
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
