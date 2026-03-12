import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import type { Product } from '../types';

const HotDeals: React.FC = () => {
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const dealsPerPage = 8;

    useEffect(() => {
        const fetchDeals = async () => {
            setLoading(true);
            try {
                const response = await productService.getPagedHotDeals(currentPage, dealsPerPage);
                setDeals(response.items);
                setTotalPages(response.totalPages);
            } catch (err) {
                setError('Failed to load hot deals.');
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [currentPage]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-20 text-red-500">
            {error}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 flex items-center gap-2">
                    <span className="text-4xl">🔥</span> Hot Deals
                </h1>
            </div>

            {deals.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500 text-lg">No active deals right now. Check back later!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deals.map(product => {
                            const discountPercent = Math.round(((product.originalPrice - (product.discountedPrice || product.originalPrice)) / product.originalPrice) * 100);

                            return (
                                <div key={product.productId} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-red-100 overflow-hidden group">
                                    <div className="relative">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.productName} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md animate-pulse">
                                            -{discountPercent}%
                                        </div>
                                    </div>
                                    
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1 group-hover:text-red-600 transition">{product.productName}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-1 h-5">Store: {product.storeName}</p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xl font-black text-red-600">{formatCurrency(product.discountedPrice || product.originalPrice)}</span>
                                                <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(product.originalPrice)}</span>
                                            </div>
                                        </div>
                                        
                                        <Link 
                                            to={`/product/${product.productId}`}
                                            className="mt-4 w-full block text-center bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold py-2 px-4 rounded-xl transition duration-300 border border-red-200 hover:border-red-500"
                                        >
                                            View Deal
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:bg-gray-400"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HotDeals;
