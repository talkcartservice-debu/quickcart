"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";

const Product = () => {

    const { id } = useParams();
    const { products, router, addToCart, updateCartQuantity, cartItems, currency } = useAppContext();

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const fetchProductData = async () => {
        const product = products.find(product => product._id === id);
        setProductData(product);
    }

    useEffect(() => {
        fetchProductData();
    }, [id, products.length])
    
    useEffect(() => {
        if (productData && productData.images && productData.images.length > 0) {
            setMainImage(productData.images[0]);
        } else {
            setMainImage('/placeholder.svg');
        }
        setQuantity(1);
    }, [productData]);

    const handleAddToCart = async () => {
        const currentQty = cartItems[id] || 0;
        if (currentQty === 0) {
            for (let i = 0; i < quantity; i++) {
                await addToCart(productData._id);
            }
        } else {
            await updateCartQuantity(productData._id, currentQty + quantity);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        router.push('/cart');
    };

    const rating = productData?.averageRating || 0;
    const totalReviews = productData?.totalReviews || 0;
    const inStock = productData?.stock > 0;

    return productData ? (<>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
                        <Image
                            src={mainImage || (productData.images && productData.images.length > 0 ? productData.images[0] : '/placeholder.svg')}
                            alt={productData.name}
                            className="w-full h-auto object-cover mix-blend-multiply"
                            width={1280}
                            height={720}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productData.images && productData.images.length > 0 ? productData.images.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 border-2 transition ${mainImage === image ? 'border-orange-500' : 'border-transparent'}`}
                            >
                                <Image
                                    src={image}
                                    alt={productData.name}
                                    className="w-full h-auto object-cover mix-blend-multiply"
                                    width={1280}
                                    height={720}
                                />
                            </div>
                        )) : <p>No images available</p>}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, index) => (
                                <svg
                                    key={index}
                                    className={`h-4 w-4 ${index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-600 text-sm">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</p>
                    </div>

                    <div className="mt-2">
                        {inStock ? (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                In Stock ({productData.stock} left)
                            </span>
                        ) : (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 mt-3">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-medium mt-6">
                        {currency}{productData.offerPrice}
                        {productData.price && productData.price > productData.offerPrice && (
                            <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                                {currency}{productData.price}
                            </span>
                        )}
                    </p>

                    <div className="mt-5 flex items-center gap-3">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                                disabled={quantity <= 1}
                            >
                                <Image src={assets.decrease_arrow} alt="decrease" className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-gray-800 font-medium min-w-[2.5rem] text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(productData.stock || 99, q + 1))}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                                disabled={quantity >= (productData.stock || 99)}
                            >
                                <Image src={assets.increase_arrow} alt="increase" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center mt-6 gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock}
                            className="px-6 py-2.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!inStock}
                            className="px-8 py-2.5 bg-gray-800 text-white hover:bg-gray-900 rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>
                    </div>
                    
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium py-1 pr-6">Category</td>
                                    <td className="text-gray-800/70">{productData.category}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium py-1 pr-6">Rating</td>
                                    <td className="text-gray-800/70">{rating > 0 ? `${rating.toFixed(1)} / 5` : 'No ratings yet'}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium py-1 pr-6">Stock</td>
                                    <td className="text-gray-800/70">{productData.stock || 0} units</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-3xl font-medium">Featured <span className="font-medium text-orange-600">Products</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                    {products.filter(p => p._id !== id).slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
                <button onClick={() => router.push('/all-products')} className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                    See more
                </button>
            </div>
        </div>
        <Footer />
    </>
    ) : <Loading />
};

export default Product;
