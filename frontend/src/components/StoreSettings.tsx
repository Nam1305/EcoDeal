import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storeService from '../services/storeService';

const StoreSettings: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        storeEmail: '',
        storePhone: '',
        address: '',
        imageUrl: ''
    });

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const store = await storeService.getMyStore();
                setFormData({
                    storeName: store.storeName || '',
                    description: store.description || '',
                    storeEmail: store.storeEmail || '',
                    storePhone: store.storePhone || '',
                    address: store.address || '',
                    imageUrl: store.imageUrl || ''
                });
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch store details');
                setLoading(false);
            }
        };

        fetchStore();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            await storeService.updateMyStore(formData);
            setSuccess(true);
            setSaving(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update store');
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-emerald-600 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white">Store Settings</h2>
                    <p className="text-emerald-100 mt-2">Manage your professional store appearance</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 animate-shake">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 flex items-center gap-3 animate-fade-in">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Store information updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Store Name</label>
                                <input
                                    type="text"
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Store Email</label>
                                <input
                                    type="email"
                                    name="storeEmail"
                                    value={formData.storeEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Store Phone</label>
                                <input
                                    type="text"
                                    name="storePhone"
                                    value={formData.storePhone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Store Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Store Link Logo/Image (Full URL)</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-xl text-white font-bold transition-all ${
                                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg active:scale-95'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Saving Changes...
                                    </>
                                ) : (
                                    'Save Settings'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/store-owner-dashboard')}
                                className="px-8 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoreSettings;
