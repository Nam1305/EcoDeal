import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';

interface OrderDetailItem {
    orderDetailId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl: string;
}

interface Order {
    orderId: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    shippingAddress: string;
    shippingPhone: string;
    orderDetails: OrderDetailItem[];
}

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const data = await orderService.getOrderById(Number(id));
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order details", err);
                setError("Could not load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleMarkReceived = async () => {
        if (!window.confirm("Are you sure you have received this order?")) return;
        try {
            await orderService.markAsReceived(Number(id));
            const data = await orderService.getOrderById(Number(id));
            setOrder(data);
        } catch (err) {
            console.error("Failed to mark as received", err);
            alert("Failed to mark as received");
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading order details...</div>;
    }

    if (error || !order) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || "Order not found."}</p>
                <Link to="/orders" className="text-green-600 hover:underline">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
            <Link to="/orders" className="text-green-600 hover:text-green-800 flex items-center mb-6 transition font-medium">
                &larr; Back to Order History
            </Link>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderId}</h1>
                            <p className="text-gray-500 mt-2 text-sm">Placed on {new Date(order.orderDate).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                                order.status === 'Paid' ? 'bg-blue-100 text-blue-700' : 
                                order.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                order.status === 'Received' ? 'bg-indigo-100 text-indigo-700' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {order.status}
                            </span>
                            {(order.status === 'Approved' || order.status === 'Shipped') && (
                                <button 
                                    onClick={handleMarkReceived}
                                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm"
                                >
                                    Mark as Received
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Shipping Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 mb-1"><span className="font-medium text-gray-500">Address:</span> {order.shippingAddress || 'N/A'}</p>
                                <p className="text-gray-700"><span className="font-medium text-gray-500">Phone:</span> {order.shippingPhone || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Payment Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 mb-1"><span className="font-medium text-gray-500">Method:</span> {order.paymentMethod}</p>
                                <p className="text-gray-700"><span className="font-medium text-gray-500">Status:</span> {order.paymentStatus}</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Order Items</h3>
                    <div className="space-y-4 mb-8">
                        {order.orderDetails.map(item => (
                            <div key={item.orderDetailId} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-b-0">
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                    alt={item.productName} 
                                    className="w-16 h-16 object-cover rounded shadow-sm border border-gray-100"
                                />
                                <div className="flex-grow">
                                    <Link to={`/product/${item.productId}`} className="font-semibold text-gray-800 hover:text-green-600 transition">
                                        {item.productName}
                                    </Link>
                                    <p className="text-sm text-gray-500">{item.unitPrice?.toLocaleString()} VND x {item.quantity}</p>
                                </div>
                                <div className="font-bold text-gray-800">
                                    {((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()} VND
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <div className="text-right">
                            <p className="text-gray-500 mb-1">Total Amount</p>
                            <p className="text-2xl font-black text-green-600">{order.totalAmount.toLocaleString()} VND</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
