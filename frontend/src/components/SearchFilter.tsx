import React, { useState } from 'react';

interface SearchFilterProps {
    onSearch: (name: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg -mt-12 relative z-10 max-w-4xl mx-auto border border-green-50">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                    <input
                        type="text"
                        placeholder="Search for eco-friendly products..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="md:w-48">
                    <select className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition text-gray-700">
                        <option>All Filters</option>
                        <option>Price: Low to High</option>
                        <option>Discount %</option>
                        <option>Nearest Expiry</option>
                    </select>
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition font-bold shadow-lg shadow-green-200"
                >
                    Find Deals
                </button>
            </div>
        </div>
    );
};

export default SearchFilter;
