import React, { useEffect, useState, useCallback } from 'react';
import storeService from '../services/storeService';
import type { Store, PagedResponse } from '../types';

const StoreList: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isApprovedFilter, setIsApprovedFilter] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const pageSize = 3;

    const fetchStores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data: Store[] | PagedResponse<Store>;

            if (searchTerm.trim()) {
                data = await storeService.search(searchTerm);
                setStores(data as Store[]);
                setTotalPages(1); // Search API doesn't seem to support paging in the current implementation
            } else if (isApprovedFilter !== null) {
                data = await storeService.filterByApproval(isApprovedFilter);
                setStores(data as Store[]);
                setTotalPages(1); // Filter API also doesn't seem to support paging
            } else {
                const pagedData = await storeService.getPaged(currentPage, pageSize);
                setStores(pagedData.items);
                setTotalPages(pagedData.totalPages);
            }
        } catch (err) {
            console.error('Error fetching stores:', err);
            setError('Failed to load stores. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, isApprovedFilter]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (status: boolean | null) => {
        setIsApprovedFilter(status);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Eco-Stores</h1>
                        <p className="text-gray-500 mt-1 font-medium">Discover local businesses making a difference.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search stores..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500 outline-none w-64 transition-all"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Filter Status */}
                        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                            <button
                                onClick={() => handleFilterChange(null)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${isApprovedFilter === null ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterChange(true)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${isApprovedFilter === true ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => handleFilterChange(false)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${isApprovedFilter === false ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Pending
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl mb-8 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 h-48 animate-pulse border border-gray-50 shadow-sm"></div>
                        ))}
                    </div>
                ) : stores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 mb-10">
                        {stores.map((store) => (
                            <div key={store.storeId} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition duration-300 flex flex-col md:flex-row gap-6 group">
                                {/* Mock Store Logo */}
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border border-gray-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <div className="text-4xl font-black text-green-700 opacity-80">
                                        {store.storeName?.substring(0, 1) || 'S'}
                                    </div>
                                </div>

                                <div className="flex-grow flex flex-col justify-center">
                                    <div className="flex items-center mb-2">
                                        <h2 className="text-2xl font-bold text-gray-800">{store.storeName}</h2>
                                        {store.isApproved ? (
                                            <span className="ml-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="ml-3 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Pending Review</span>
                                        )}
                                    </div>

                                    <p className="text-gray-500 font-medium flex items-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {store.address}
                                    </p>

                                    <div className="flex items-center text-sm text-gray-400">
                                        <span className="mr-4">Owner: <span className="font-bold text-gray-600">{store.ownerName}</span></span>
                                        <span className="flex items-center italic">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Trusted Partner
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <button className="bg-gray-50 hover:bg-green-600 hover:text-white text-green-600 px-6 py-3 rounded-2xl font-bold transition flex items-center border border-gray-100 group-hover:border-transparent">
                                        Visit Store
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
                        <div className="text-7xl mb-6">🏬</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No stores found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setIsApprovedFilter(null); }}
                            className="mt-8 text-green-600 font-bold hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !searchTerm && isApprovedFilter === null && (
                    <div className="flex justify-center items-center gap-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-600 hover:text-green-600 disabled:opacity-30 disabled:hover:text-gray-600 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-12 h-12 rounded-2xl font-bold transition ${currentPage === i + 1 ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-600 hover:text-green-600 disabled:opacity-30 disabled:hover:text-gray-600 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreList;
