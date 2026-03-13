import React, { useEffect, useState } from 'react';
import categoryService from '../services/categoryService';
import type { Category } from '../types';

interface CategoryListProps {
    onCategoryClick?: (categoryId: number) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onCategoryClick }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <div className="text-center py-10">Loading categories...</div>;

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                    <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
                    Browse by Category
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.categoryId}
                            onClick={() => onCategoryClick?.(category.categoryId)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-center group"
                        >
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition">
                                <span className="text-2xl text-green-600">🌿</span>
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-green-600 transition">
                                {category.categoryName}
                            </span>
                        </div>
                    ))}
                    {/* Placeholder categories if API yields none for demo */}
                    {categories.length === 0 && ["Vegetables", "Fruits", "Bakery", "Meat", "Dairy", "Frozen"].map((c, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-center group"
                        >
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition">
                                <span className="text-2xl text-green-600">🌿</span>
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-green-600 transition">
                                {c}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryList;
