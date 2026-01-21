'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const AllProducts = () => {

    const { products } = useAppContext();

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 py-8">
                <div className="flex flex-col items-center mb-12">
                    <div className="flex flex-col items-center w-full max-w-4xl">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Products</h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                        <p className="mt-4 text-gray-600 text-center max-w-2xl">
                            Discover our wide range of high-quality products designed to meet your needs
                        </p>
                    </div>
                </div>
                
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 w-full max-w-7xl mx-auto">
                        {products.map((product, index) => (
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
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No products available</h3>
                        <p className="text-gray-500">We're working on adding new products soon!</p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
