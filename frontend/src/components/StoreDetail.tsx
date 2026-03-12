import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../services/storeService';
import productService from '../services/productService';
import type { Store, Product } from '../types';
import Footer from './Footer';

const StoreDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [store, setStore] = useState<Store | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStoreData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const storeData = await storeService.getById(Number(id));
                setStore(storeData);

                const storeProducts = await productService.getByStoreId(Number(id));
                setProducts(storeProducts);
            } catch (err) {
                console.error('Error fetching store detail:', err);
                setError('Failed to load store details.');
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center shadow-sm">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-500 mb-6">{error || 'Store not found.'}</p>
                    <Link to="/stores" className="text-green-600 font-bold hover:underline">
                        Back to stores
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Store Header */}
            <div className="bg-white border-b border-gray-100 pt-12 pb-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link to="/stores" className="inline-flex items-center text-gray-400 hover:text-green-600 font-bold mb-8 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        All Stores
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-3xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                            <span className="text-5xl font-black text-green-700">{store.storeName?.substring(0, 1)}</span>
                        </div>

                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-4xl font-black text-gray-800">{store.storeName}</h1>
                                {store.isApproved && (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-xl text-gray-500 font-medium mb-4">{store.address}</p>

                            <div className="flex flex-wrap gap-4 mt-6">
                                <button 
                                    onClick={() => {
                                        const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-emerald-200"
                                >
                                    <span className="mr-2">📍</span> Get Directions
                                </button>
                                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                    <span className="text-gray-400 mr-2 text-sm uppercase tracking-wider font-bold">Owner</span>
                                    <span className="text-gray-700 font-bold">{store.ownerName}</span>
                                </div>
                                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                    <span className="text-gray-400 mr-2 text-sm uppercase tracking-wider font-bold">Active Deals</span>
                                    <span className="text-gray-700 font-bold">{products.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div className="container mx-auto px-4 max-w-6xl py-12">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-gray-800 mb-2">Available Eco-Deals</h2>
                    <p className="text-gray-500 font-medium">Flash sales and surplus items from this store.</p>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <Link
                                to={`/product/${product.productId}`}
                                key={product.productId}
                                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-green-100 transition duration-300 group"
                            >
                                <div className="relative h-48 bg-gray-50 overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.productName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-black text-green-700 shadow-sm border border-white">
                                        {Math.round((1 - (product.discountedPrice || product.originalPrice) / product.originalPrice) * 100)}% OFF
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="text-xs text-green-600 font-black uppercase tracking-widest mb-1">
                                        {product.categoryName}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition">{product.productName}</h3>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl font-black text-green-600">
                                            ${product.discountedPrice || product.originalPrice}
                                        </span>
                                        {product.discountedPrice && (
                                            <span className="text-gray-400 line-through text-sm font-medium">
                                                ${product.originalPrice}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stock</span>
                                            <span className="text-gray-600 font-bold">{product.stockQuantity} left</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Expires</span>
                                            <span className="text-orange-500 font-bold text-sm">
                                                {product.expireDate ? new Date(product.expireDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
                        <div className="text-6xl mb-4">🧊</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Cooling down!</h3>
                        <p className="text-gray-500">This store currently has no active eco-deals. Check back later!</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default StoreDetail;
