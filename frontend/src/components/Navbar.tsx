import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
