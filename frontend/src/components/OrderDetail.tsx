import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import reviewService from '../services/reviewService';

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

interface ReviewingItem {
    productId: number;
    productName: string;
    orderId: number;
}

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
                <svg className={`h-8 w-8 transition-colors ${value >= star ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
            </button>
        ))}
    </div>
);

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Review modal state
    const [reviewingItem, setReviewingItem] = useState<ReviewingItem | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(new Set());

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

    const openReviewModal = (item: OrderDetailItem) => {
        setReviewingItem({ productId: item.productId, productName: item.productName, orderId: order!.orderId });
        setReviewRating(5);
        setReviewComment('');
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewingItem) return;
        setSubmitting(true);
        try {
            await reviewService.addReview({
                productId: reviewingItem.productId,
                orderId: reviewingItem.orderId,
                rating: reviewRating,
                comment: reviewComment
            });
            setReviewedProductIds(prev => new Set([...prev, reviewingItem.productId]));
            setReviewingItem(null);
            alert('Cảm ơn bạn đã đánh giá sản phẩm! 🎉');
        } catch (err: any) {
            alert(err.response?.data || 'Không thể gửi đánh giá. Có thể bạn đã đánh giá sản phẩm này rồi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading order details...</div>;

    if (error || !order) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || "Order not found."}</p>
                <Link to="/orders" className="text-green-600 hover:underline">Back to Orders</Link>
            </div>
        );
    }

    const isCompleted = order.status === 'Completed' || order.status === 'Received';

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
                                order.status === 'Received' || order.status === 'Completed' ? 'bg-indigo-100 text-indigo-700' :
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
                    {isCompleted && (
                        <p className="text-sm text-green-600 mb-4 bg-green-50 px-4 py-2 rounded-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đơn hàng đã hoàn tất! Hãy đánh giá sản phẩm để giúp đỡ người mua khác nhé.
                        </p>
                    )}
                    <div className="space-y-4 mb-8">
                        {order.orderDetails.map(item => (
                            <div key={item.orderDetailId} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-b-0">
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
                                <div className="text-right flex flex-col items-end gap-2">
                                    <span className="font-bold text-gray-800">
                                        {((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()} VND
                                    </span>
                                    {isCompleted && (
                                        reviewedProductIds.has(item.productId) ? (
                                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Đã đánh giá
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => openReviewModal(item)}
                                                className="text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                </svg>
                                                Đánh giá
                                            </button>
                                        )
                                    )}
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

            {/* Review Modal */}
            {reviewingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setReviewingItem(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-800">Đánh giá sản phẩm</h2>
                                <p className="text-sm text-gray-500 mt-1">{reviewingItem.productName}</p>
                            </div>
                            <button onClick={() => setReviewingItem(null)} className="text-gray-400 hover:text-gray-600 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Chọn số sao</label>
                                <StarRating value={reviewRating} onChange={setReviewRating} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nhận xét của bạn</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm resize-none"
                                    placeholder="Sản phẩm có tốt không? Bạn cảm thấy thế nào sau khi sử dụng?"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReviewingItem(null)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white font-bold transition shadow-lg shadow-yellow-100 disabled:opacity-60"
                                >
                                    {submitting ? 'Đang gửi...' : '⭐ Gửi đánh giá'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
