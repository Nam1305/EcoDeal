import React, { useEffect, useState } from 'react';
import productManagementService from '../services/productManagementService';
import type { ProductDto, CreateProductRequest, UpdateProductRequest } from '../services/productManagementService';
import storeService from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Store } from '../types';

const ProductManagement: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [store, setStore] = useState<Store | null>(null);
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        productName: '',
        categoryId: 1,
        originalPrice: 0,
        discountedPrice: 0,
        expireDate: '',
        stockQuantity: 0,
        imageUrl: '',
        isActive: true
    });

    const fetchData = async () => {
        try {
            const myStore = await storeService.getMyStore();
            setStore(myStore);
            const myProducts = await productManagementService.getStoreProducts(myStore.storeId);
            setProducts(myProducts);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load store or products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;

        if (user === null || user.role !== 'StoreOwner') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate, authLoading]);

    const handleOpenModal = (product?: ProductDto) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                productName: product.productName || '',
                categoryId: product.categoryId || 1,
                originalPrice: product.originalPrice || 0,
                discountedPrice: product.discountedPrice || 0,
                expireDate: product.expireDate ? product.expireDate.substring(0, 16) : '',
                stockQuantity: product.stockQuantity || 0,
                imageUrl: product.imageUrl || '',
                isActive: product.isActive ?? true
            });
        } else {
            setEditingProduct(null);
            setFormData({
                productName: '',
                categoryId: 1, // Default Bakery
                originalPrice: 0,
                discountedPrice: 0,
                expireDate: '',
                stockQuantity: 0,
                imageUrl: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: any = value;
        if (type === 'number') parsedValue = Number(value);
        if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store) return;

        try {
            if (editingProduct) {
                // Update
                const updateReq: UpdateProductRequest = {
                    ...formData,
                    storeId: store.storeId,
                    isActive: formData.isActive
                };
                await productManagementService.updateProduct(editingProduct.productId, updateReq);
            } else {
                // Create
                const createReq: CreateProductRequest = {
                    ...formData,
                    storeId: store.storeId
                };
                await productManagementService.createProduct(createReq);
            }
            handleCloseModal();
            fetchData(); // Refresh list
        } catch (err: any) {
            alert('Operation failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productManagementService.deleteProduct(id);
                fetchData();
            } catch (err) {
                alert('Failed to delete product.');
            }
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center text-gray-600">Loading Product Management...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
                        <p className="text-gray-500 mt-1">Manage inventory for <span className="font-semibold">{store?.storeName}</span></p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors flex items-center gap-2"
                    >
                        <span>+ Add New Product</span>
                    </button>
                </div>

                {/* Product Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold">Price</th>
                                    <th className="px-6 py-4 font-semibold">Stock</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products found. Start by adding one!</td></tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden border">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.productName} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs text-center p-1">No Img</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{product.productName}</p>
                                                        <p className="text-xs text-gray-500">Exp: {new Date(product.expireDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{product.categoryName || `ID: ${product.categoryId}`}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-green-600">{formatCurrency(product.discountedPrice)}</span>
                                                    <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-semibold ${product.stockQuantity <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                                                    {product.stockQuantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.isActive ? (
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.productId)}
                                                    className="text-red-600 hover:text-red-800 font-semibold text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Product Name</label>
                                    <input required type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Fresh Bread" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Category ID</label>
                                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                                        <option value={1}>Bakery (1)</option>
                                        <option value={2}>Dairy (2)</option>
                                        <option value={3}>Vegetables (3)</option>
                                        <option value={4}>Beverages (4)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Stock Quantity</label>
                                    <input required type="number" name="stockQuantity" min="0" value={formData.stockQuantity} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Original Price (VND)</label>
                                    <input required type="number" name="originalPrice" min="0" value={formData.originalPrice} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Discounted Price (VND)</label>
                                    <input required type="number" name="discountedPrice" min="0" value={formData.discountedPrice} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Expiry Date & Time</label>
                                    <input required type="datetime-local" name="expireDate" value={formData.expireDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Image URL</label>
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="https://..." />
                                </div>

                                {editingProduct && (
                                    <div className="flex items-center gap-2 pt-2 md:col-span-2">
                                        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                        <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">Product is active and visible to customers</label>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                            <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button type="submit" form="productForm" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors">
                                {editingProduct ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
