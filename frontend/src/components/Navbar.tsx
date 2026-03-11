import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
                        EcoDeal
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition">Home</Link>
                    <Link to="/stores" className="text-gray-700 hover:text-green-600 font-medium transition">Stores</Link>
                    <Link to="/deals" className="text-gray-700 hover:text-green-600 font-medium transition">Hot Deals</Link>
                </div>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            {user.role === 'StoreOwner' && (
                                <>
                                    <Link to="/store-owner-dashboard" className="text-gray-700 hover:text-green-600 font-medium transition">Dashboard</Link>
                                    <Link to="/manage-products" className="text-gray-700 hover:text-green-600 font-medium transition">Manage Products</Link>
                                </>
                            )}
                            <Link to="/profile" className="text-gray-700 hover:text-green-600 font-medium transition cursor-pointer">
                                My Profile ({user.fullName})
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link to="/login" className="text-green-600 px-4 py-2 hover:bg-green-50 rounded-lg transition font-medium">
                                Login
                            </Link>
                            <Link to="/register" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow-md font-medium">
                                Register
                            </Link>
                        </div>
                    )}
                    
                    {/* Cart Icon */}
                    {user && (
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cart && cart.items.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                                    {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
