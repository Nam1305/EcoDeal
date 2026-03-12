import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storeService from '../services/storeService';

const RegisterStore: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        storeEmail: '',
        storePhone: '',
        storeAddress: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await storeService.register(formData);
            // Hack: To refresh the role in the app, we might need a better way.
            // For now, let's suggest the user to re-login or use a context update if available.
            alert('Store registered successfully! Please re-login to access your dashboard.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register store.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-green-600 to-teal-500 px-8 py-10 text-white">
                    <h1 className="text-3xl font-bold mb-2">Register Your Store</h1>
                    <p className="opacity-90">Fill in the details below to start selling on EcoDeal.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name *</label>
                        <input
                            type="text"
                            name="storeName"
                            required
                            value={formData.storeName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                            placeholder="Enter your unique store name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                            placeholder="What do you sell?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Store Email</label>
                            <input
                                type="email"
                                name="storeEmail"
                                value={formData.storeEmail}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                                placeholder="contact@yourstore.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Store Phone</label>
                            <input
                                type="text"
                                name="storePhone"
                                value={formData.storePhone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                                placeholder="0123 456 789"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
                        <input
                            type="text"
                            name="storeAddress"
                            value={formData.storeAddress}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                            placeholder="123 Street, City, Country"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Store Logo URL</label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                            placeholder="https://example.com/logo.png"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition transform hover:-translate-y-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Registering...' : 'Open My Store'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            By clicking "Open My Store", you agree to our Seller Terms and Conditions.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterStore;
