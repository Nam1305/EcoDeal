import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
    const { cart, loading, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading cart...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any eco-friendly deals yet.</p>
                <Link to="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Shopping Cart</h1>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        {cart.items.map(item => (
                            <div key={item.cartItemId} className="flex flex-col sm:flex-row items-center gap-4 p-6 border-b border-gray-100 last:border-b-0">
                                <img 
                                    src={item.imageUrl || 'https://via.placeholder.com/150'} 
                                    alt={item.productName} 
                                    className="w-24 h-24 object-cover rounded-md"
                                />
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="font-semibold text-lg text-gray-800">{item.productName}</h3>
                                    <p className="text-green-600 font-medium mt-1">{item.price.toLocaleString()} VND</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-bold transition"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-bold transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-right min-w-[100px] mt-4 sm:mt-0">
                                    <p className="font-bold text-gray-800">{item.subTotal.toLocaleString()} VND</p>
                                    <button 
                                        onClick={() => removeFromCart(item.cartItemId)}
                                        className="text-red-500 hover:text-red-700 text-sm mt-2 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">Order Summary</h2>
                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                            <span>{cart.totalAmount.toLocaleString()} VND</span>
                        </div>
                        <div className="flex justify-between mb-6 text-gray-600">
                            <span>Shipping estimate</span>
                            <span className="text-green-600 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-gray-800 mb-8 pt-4 border-t">
                            <span>Total</span>
                            <span className="text-green-600">{cart.totalAmount.toLocaleString()} VND</span>
                        </div>
                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition shadow-lg"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
