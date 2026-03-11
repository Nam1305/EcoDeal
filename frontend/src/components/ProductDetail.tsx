import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const productData = await productService.getById(Number(id));
                setProduct(productData);

                // MOCK: Get similar products using the cheapest products API
                const similarData = await productService.getCheapest(4);
                // Filter out the current product from recommendations if it's there
                setSimilarProducts(similarData.filter(p => p.productId !== Number(id)).slice(0, 3));
            } catch (err) {
                console.error('Error fetching product details:', err);
                setError('Could not load product details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!product) return;
        
        setAdding(true);
        try {
            await addToCart(product.productId, 1);
            alert(`${product.productName} added to cart successfully!`);
        } catch (err) {
            alert('Failed to add product to cart.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg">Loading amazing deal...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center max-w-md bg-white p-10 rounded-3xl shadow-xl">
                    <div className="text-6xl mb-6">🏜️</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-8">{error || "The product you're looking for doesn't exist or has been removed."}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const discountPercentage = product.originalPrice > 0
        ? Math.round((1 - (product.discountedPrice || 0) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-green-600 transition font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <div className="ml-6 text-sm text-gray-400">
                        Products / {product.categoryName} / <span className="text-gray-600 font-medium">{product.productName}</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Middle: Product Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Product Image */}
                                <div className="space-y-4">
                                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-50 relative group">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center italic text-gray-400">No Image Available</div>
                                        )}
                                        {discountPercentage > 0 && (
                                            <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-xl font-black text-lg shadow-lg">
                                                -{discountPercentage}%
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex flex-col">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                            {product.categoryName}
                                        </span>
                                        <span className="text-gray-400 text-sm">•</span>
                                        <span className="text-orange-600 text-sm font-bold flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Limited Stock
                                        </span>
                                    </div>

                                    <h1 className="text-4xl font-black text-gray-800 mb-4 leading-tight">
                                        {product.productName}
                                    </h1>

                                    <div className="flex items-center mb-8">
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="text-sm text-gray-500 mb-1 font-medium">Eco-Price</div>
                                            <div className="flex items-baseline">
                                                <span className="text-5xl font-black text-green-600">${product.discountedPrice || product.originalPrice}</span>
                                                {product.discountedPrice && (
                                                    <span className="text-xl text-gray-400 line-through ml-3 font-medium">${product.originalPrice}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-10">
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 font-medium">Store Location</p>
                                                <p className="text-gray-800 font-bold">{product.storeName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mr-4 shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 font-medium">Expires On</p>
                                                <p className="text-gray-800 font-bold">
                                                    {product.expireDate ? new Date(product.expireDate).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4 shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 font-medium">Available Quantity</p>
                                                <p className="text-gray-800 font-bold">{product.stockQuantity} units available</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={adding || product.stockQuantity === 0}
                                        className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition duration-300 flex items-center justify-center group disabled:bg-gray-400 disabled:shadow-none disabled:transform-none"
                                    >
                                        <span>{adding ? 'ADDING...' : (product.stockQuantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART')}</span>
                                        {!adding && product.stockQuantity > 0 && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-6 w-6 group-hover:translate-x-1 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Product Details</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                This {product.productName.toLowerCase()} is sourced from {product.storeName}. At EcoDeal, we work with local vendors to bring you perfectly good food and products that are nearing their expiration date or are excess inventory.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-gray-700 mb-2 font-display">Why is it discounted?</h4>
                                    <p className="text-sm text-gray-600">This product is reaching its expiration date soon but is still of excellent quality and safe for consumption.</p>
                                </div>
                                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-50">
                                    <h4 className="font-bold text-green-800 mb-2 font-display">Environmental Impact</h4>
                                    <p className="text-sm text-green-700">Buying this product prevents roughly 0.5kg of waste and saves the resources used in its production.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Similar Products */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Similar Eco-Deals</h3>
                            <div className="space-y-6">
                                {similarProducts.map((p) => (
                                    <Link key={p.productId} to={`/product/${p.productId}`} className="flex group">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 mr-4 shrink-0 border border-gray-50">
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center italic text-xs text-gray-400">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h4 className="font-bold text-gray-800 group-hover:text-green-600 transition truncate mb-1">{p.productName}</h4>
                                            <p className="text-xs text-gray-400 mb-2">{p.storeName}</p>
                                            <div className="flex items-center">
                                                <span className="font-bold text-green-600 mr-2">${p.discountedPrice || p.originalPrice}</span>
                                                {p.discountedPrice && (
                                                    <span className="text-xs text-gray-400 line-through">${p.originalPrice}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                <button className="w-full py-4 mt-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-green-200 hover:text-green-600 transition">
                                    View More Deals
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetail;
