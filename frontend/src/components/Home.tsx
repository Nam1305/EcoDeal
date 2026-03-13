import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchFilter from './SearchFilter';
import CategoryList from './CategoryList';
import ProductDeal from './ProductDeal';
import Footer from './Footer';
import productService from '../services/productService';
import storeService from '../services/storeService';
import type { Product, Store } from '../types';

const Home: React.FC = () => {
    const [productResults, setProductResults] = useState<Product[] | null>(null);
    const [storeResults, setStoreResults] = useState<Store[] | null>(null);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (name: string) => {
        if (!name.trim()) {
            setProductResults(null);
            setStoreResults(null);
            return;
        }
        setSearching(true);
        try {
            const [pResults, sResults] = await Promise.all([
                productService.searchByName(name),
                storeService.search(name)
            ]);
            setProductResults(pResults);
            setStoreResults(sResults);
        } catch (error) {
            console.error('Error searching:', error);
            setProductResults([]);
            setStoreResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleCategoryClick = async (categoryId: number) => {
        setSearching(true);
        try {
            const pResults = await productService.getByCategoryId(categoryId);
            setProductResults(pResults);
            setStoreResults([]); // Clear stores when filtering by category
        } catch (error) {
            console.error('Error fetching category products:', error);
            setProductResults([]);
        } finally {
            setSearching(false);
        }
    };

    const hasResults = (productResults && productResults.length > 0) || (storeResults && storeResults.length > 0);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <header className="bg-gradient-to-br from-green-600 to-teal-700 text-white py-24 pb-32">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        Save Food, <span className="text-green-300">Save Earth.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-green-50 max-w-2xl mx-auto leading-relaxed opacity-90">
                        Join our mission to reduce food waste. Get high-quality products from your favorite local stores at a fraction of the price.
                    </p>
                </div>
            </header>

            {/* Search and Filter */}
            <div className="container mx-auto px-4">
                <SearchFilter onSearch={handleSearch} />
            </div>

            {/* Content Sections */}
            <main>
                {searching ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-medium">Looking for matches...</p>
                    </div>
                ) : (productResults || storeResults) ? (
                    <section className="py-12 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-800 tracking-tight">Search Results</h2>
                                    <p className="text-gray-500 mt-1">We found some matches that might interest you.</p>
                                </div>
                                <button
                                    onClick={() => { setProductResults(null); setStoreResults(null); }}
                                    className="text-green-600 font-bold hover:underline flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back to Home
                                </button>
                            </div>

                            {!hasResults ? (
                                <div className="text-center py-24 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="text-7xl mb-6">🔍</div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No matches found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">Try searching for something else or browse our curated categories.</p>
                                </div>
                            ) : (
                                <div className="space-y-16">
                                    {/* Stores Results */}
                                    {storeResults && storeResults.length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                                <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </span>
                                                Matching Stores ({storeResults.length})
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {storeResults.map((store) => (
                                                    <Link
                                                        key={store.storeId}
                                                        to={`/store/${store.storeId}`}
                                                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition duration-300 flex items-center gap-4 group"
                                                    >
                                                        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 border border-green-50 group-hover:scale-110 transition-transform">
                                                            <span className="text-2xl font-black text-green-700">{store.storeName?.substring(0, 1)}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 group-hover:text-green-600 transition">{store.storeName}</h4>
                                                            <p className="text-gray-400 text-sm line-clamp-1">{store.address}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Products Results */}
                                    {productResults && productResults.length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                                <span className="bg-teal-100 text-teal-700 p-2 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </span>
                                                Matching Eco-Deals ({productResults.length})
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {productResults.map((product) => (
                                                    <Link
                                                        key={product.productId}
                                                        to={`/product/${product.productId}`}
                                                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 border border-gray-100 group"
                                                    >
                                                        <div className="relative h-64 overflow-hidden bg-gray-50">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No Image</div>
                                                            )}
                                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-black text-green-700 shadow-sm border border-white">
                                                                {Math.round((1 - (product.discountedPrice || product.originalPrice) / product.originalPrice) * 100)}% OFF
                                                            </div>
                                                        </div>
                                                        <div className="p-6">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{product.categoryName}</span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.storeName}</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-1">{product.productName}</h3>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-2xl font-black text-green-700">${product.discountedPrice || product.originalPrice}</span>
                                                                <span className="text-xs text-gray-400 font-bold">{product.stockQuantity} left</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <>
                        <CategoryList onCategoryClick={handleCategoryClick} />
                        <ProductDeal />

                        {/* Extra Value Proposition Section */}
                        <section className="py-20 bg-white">
                            <div className="container mx-auto px-4 text-center">
                                <h2 className="text-4xl font-black text-gray-800 mb-16 tracking-tight">Why Choose EcoDeal?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="p-10 rounded-[3rem] bg-green-50/50 border border-green-100/50 group hover:bg-green-100 transition duration-500">
                                        <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">💰</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Unbeatable Savings</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed italic">"Save up to 80% on perfectly good food nearby that would otherwise go to waste."</p>
                                    </div>
                                    <div className="p-10 rounded-[3rem] bg-teal-50/50 border border-teal-100/50 group hover:bg-teal-100 transition duration-500">
                                        <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">🌍</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Zero Waste Hero</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed italic">"Every purchase you make directly reduces CO2 emissions and saves water and land resources."</p>
                                    </div>
                                    <div className="p-10 rounded-[3rem] bg-orange-50/50 border border-orange-100/50 group hover:bg-orange-100 transition duration-500">
                                        <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">🏢</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Support Local</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed italic">"Build a stronger community by supporting local businesses and independent stores in your neighborhood."</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Home;
