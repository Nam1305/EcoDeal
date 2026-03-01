import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchFilter from './SearchFilter';
import CategoryList from './CategoryList';
import ProductDeal from './ProductDeal';
import Footer from './Footer';
import productService from '../services/productService';
import type { Product } from '../types';

const Home: React.FC = () => {
    const [searchResults, setSearchResults] = useState<Product[] | null>(null);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (name: string) => {
        if (!name.trim()) {
            setSearchResults(null);
            return;
        }
        setSearching(true);
        try {
            const results = await productService.searchByName(name);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

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
                        <p className="mt-4 text-gray-600 font-medium">Searching for deals...</p>
                    </div>
                ) : searchResults ? (
                    <section className="py-12 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Search Results ({searchResults.length})
                                </h2>
                                <button
                                    onClick={() => setSearchResults(null)}
                                    className="text-green-600 font-bold hover:underline"
                                >
                                    Back to Home
                                </button>
                            </div>
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {searchResults.map((product) => (
                                        <div key={product.productId} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 border border-gray-100 group">
                                            <Link to={`/product/${product.productId}`} className="block">
                                                <div className="relative h-64 overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center italic text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{product.categoryName}</span>
                                                    <span className="text-xs font-medium text-gray-500">{product.storeName}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-1">{product.productName}</h3>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-2xl font-black text-green-700">${product.discountedPrice || product.originalPrice}</span>
                                                        {product.discountedPrice && (
                                                            <span className="text-sm text-gray-400 line-through ml-2">${product.originalPrice}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                                    <div className="text-6xl mb-6">🔍</div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                                    <p className="text-gray-600">Try searching for something else or browse categories.</p>
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <>
                        <CategoryList />
                        <ProductDeal />

                        {/* Extra Value Proposition Section */}
                        <section className="py-20 bg-white">
                            <div className="container mx-auto px-4 text-center">
                                <h2 className="text-3xl font-bold text-gray-800 mb-12">Why Choose EcoDeal?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="p-8 rounded-3xl bg-green-50/30 border border-green-50">
                                        <div className="text-4xl mb-6">💰</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Unbeatable Savings</h3>
                                        <p className="text-gray-600">Save up to 80% on perfectly good food nearby that would otherwise go to waste.</p>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-teal-50/30 border border-teal-50">
                                        <div className="text-4xl mb-6">🌍</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Zero Waste Hero</h3>
                                        <p className="text-gray-600">Every purchase you make directly reduces CO2 emissions and saves water and land resources.</p>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-orange-50/30 border border-orange-50">
                                        <div className="text-4xl mb-6">🏢</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Support Local</h3>
                                        <p className="text-gray-600">Build a stronger community by supporting local businesses and independent stores in your neighborhood.</p>
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
