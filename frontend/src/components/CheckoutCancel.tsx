import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutCancel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-yellow-100">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Cancelled</h2>
                <p className="text-gray-600 mb-8">You have cancelled the checkout process. Your cart items are still saved.</p>
                <button 
                    onClick={() => navigate('/cart')}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-medium shadow-md"
                >
                    Return to Cart
                </button>
            </div>
        </div>
    );
};

export default CheckoutCancel;
