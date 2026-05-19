'use client'
import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const CATEGORIES = ['All', 'Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

const AllProducts = () => {
    const { products } = useAppContext();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const filtered = useMemo(() => {
        let list = [...products];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
            );
        }

        if (selectedCategory !== 'All') {
            list = list.filter(p => p.category === selectedCategory);
        }

        if (minPrice !== '') {
            list = list.filter(p => p.offerPrice >= parseFloat(minPrice));
        }

        if (maxPrice !== '') {
            list = list.filter(p => p.offerPrice <= parseFloat(maxPrice));
        }

        switch (sortBy) {
            case 'price-low':
                list.sort((a, b) => a.offerPrice - b.offerPrice);
                break;
            case 'price-high':
                list.sort((a, b) => b.offerPrice - a.offerPrice);
                break;
            case 'rating':
                list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            case 'name-asc':
                list.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return list;
    }, [products, search, selectedCategory, sortBy, minPrice, maxPrice]);

    const handleReset = () => {
        setSearch('');
        setSelectedCategory('All');
        setSortBy('newest');
        setMinPrice('');
        setMaxPrice('');
    };

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 py-8">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Products</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                    <p className="mt-4 text-gray-600 text-center max-w-2xl">
                        Discover our wide range of high-quality products designed to meet your needs
                    </p>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                        selectedCategory === cat
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <input
                                type="number"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                placeholder="Min $"
                                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-gray-500">–</span>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                placeholder="Max $"
                                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            {(search || selectedCategory !== 'All' || minPrice || maxPrice) && (
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-orange-600 hover:text-orange-700 underline"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
                
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 w-full max-w-7xl mx-auto">
                        {filtered.map((product, index) => (
                            <div key={index} className="transition-all duration-300 hover:scale-105">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-6">
                            <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                        <button onClick={handleReset} className="text-orange-600 hover:text-orange-700 underline text-sm">
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
