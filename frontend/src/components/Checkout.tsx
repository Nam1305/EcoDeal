import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';

const Checkout: React.FC = () => {
    const { cart } = useCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!cart || cart.items.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const domain = window.location.origin;
            const data = await orderService.checkout({
                shippingAddress: address,
                shippingPhone: phone,
                successUrl: `${domain}/checkout/success`,
                cancelUrl: `${domain}/checkout/cancel`
            });

            if (data.sessionUrl) {
                window.location.href = data.sessionUrl; // Redirect to Stripe
            } else {
                setError('Failed to initiate checkout with Stripe.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred during checkout.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Checkout</h1>
            
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Order Summary</h2>
                    <p className="text-gray-600">Total Items: <span className="font-bold">{cart.items.reduce((acc, item) => acc + item.quantity, 0)}</span></p>
                    <p className="text-gray-600 text-xl mt-2">Total Amount: <span className="font-bold text-green-600">{cart.totalAmount.toLocaleString()} VND</span></p>
                </div>

                <form onSubmit={handleCheckout} className="space-y-6">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                    
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Shipping Address</label>
                        <input 
                            type="text" 
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none"
                            placeholder="123 Eco Street, District 1, HCMC"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                        <input 
                            type="tel" 
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none"
                            placeholder="0912345678"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition shadow-lg mt-4 flex items-center justify-center"
                    >
                        {loading ? (
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        ) : (
                            'Pay with Stripe'
                        )}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-2">You will be securely redirected to Stripe for payment.</p>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
