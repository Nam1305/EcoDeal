import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';

const ProductDeal: React.FC = () => {
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const data = await productService.getCheapest(3);
                setDeals(data);
            } catch (error) {
                console.error('Error fetching deals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            navigate('/login');
            return;
        }

        setAddingId(productId);
        try {
            await addToCart(productId, 1);
            // Optionally could add a small toast here if desired
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAddingId(null);
        }
    };

    if (loading) return <div className="text-center py-10">Hunting for the best deals...</div>;

    return (
        <section className="py-12 bg-green-50/50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Hot Deals Today</h2>
                        <p className="text-gray-600 mt-2">Grab these eco-friendly products at unbeatable prices.</p>
                    </div>
                    <button className="text-green-600 font-bold hover:underline mb-1">View All Deals →</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {deals.map((product) => (
                        <div key={product.productId} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 border border-transparent hover:border-green-100 group">
                            <Link to={`/product/${product.productId}`} className="block">
                                <div className="relative h-64 overflow-hidden">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center italic text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg">
                                        {Math.round((1 - (product.discountedPrice || 0) / product.originalPrice) * 100)}% OFF
                                    </div>
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
                                    <button 
                                        onClick={(e) => handleAddToCart(e, product.productId)}
                                        disabled={addingId === product.productId || product.stockQuantity === 0}
                                        className="bg-gray-100 hover:bg-green-600 hover:text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={product.stockQuantity === 0 ? "Out of stock" : "Add to Cart"}
                                    >
                                        {addingId === product.productId ? (
                                            <div className="h-6 w-6 rounded-full border-2 border-green-600 border-t-transparent animate-spin"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Expires: {product.expireDate ? new Date(product.expireDate).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductDeal;
