import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';

const CheckoutSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
            return;
        }

        const confirmOrder = async () => {
            try {
                // Call backend to verify and mark order as Paid
                await orderService.confirmPayment(sessionId);
                await fetchCart(); // Re-fetch cart, will be empty now
                setStatus('success');
            } catch (error) {
                console.error("Payment confirmation failed", error);
                setStatus('error');
            }
        };

        confirmOrder();
    }, [sessionId, navigate, fetchCart]);

    return (
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
            {status === 'loading' && (
                <div>
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Verifying your payment...</h2>
                    <p className="text-gray-500 mt-2">Please do not close this window.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
                    <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been confirmed and is being processed.</p>
                    <button 
                        onClick={() => navigate('/orders')}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-medium shadow-md"
                    >
                        View My Orders
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="block w-full text-green-600 hover:text-green-800 mt-4 transition font-medium"
                    >
                        Continue Shopping
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Verification Failed</h2>
                    <p className="text-gray-600 mb-8">We could not confirm your payment. If you were charged, please contact support.</p>
                    <button 
                        onClick={() => navigate('/cart')}
                        className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition font-medium shadow-md"
                    >
                        Return to Cart
                    </button>
                </div>
            )}
        </div>
    );
};

export default CheckoutSuccess;
