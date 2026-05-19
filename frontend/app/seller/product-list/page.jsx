'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import apiService from "@/services/api";

const ProductList = () => {

  const { router, fetchProductData } = useAppContext()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchSellerProduct = async () => {
    try {
      const allProducts = await apiService.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    setDeletingId(productId);
    try {
      await apiService.adminDeleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
      await fetchProductData();
    } catch (error) {
      alert(error.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    fetchSellerProduct();
  }, [])

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : (
        <div className="w-full md:p-10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">All Products <span className="text-gray-400 font-normal text-base">({products.length})</span></h2>
          </div>
          <div className="flex flex-col items-start max-w-5xl w-full overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-600 text-sm bg-gray-50">
                <tr>
                  <th className="w-2/5 px-4 py-3 font-medium text-left truncate">Product</th>
                  <th className="px-4 py-3 font-medium text-left truncate max-sm:hidden">Category</th>
                  <th className="px-4 py-3 font-medium text-left truncate max-sm:hidden">Stock</th>
                  <th className="px-4 py-3 font-medium text-left truncate">Price</th>
                  <th className="px-4 py-3 font-medium text-left truncate">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                {products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="md:px-4 pl-2 md:pl-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 rounded-lg p-1.5 flex-shrink-0">
                          <Image
                            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                            alt={product.name}
                            className="w-12 h-12 object-contain"
                            width={48}
                            height={48}
                          />
                        </div>
                        <span className="font-medium text-gray-800 line-clamp-2 text-xs md:text-sm">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        product.stock === 0 ? 'bg-red-100 text-red-700' :
                        product.stock < 10 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} units`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-gray-900">${product.offerPrice}</span>
                        {product.price > product.offerPrice && (
                          <span className="block text-xs text-gray-400 line-through">${product.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="flex items-center gap-1 px-2 md:px-3 py-1.5 bg-orange-600 text-white rounded-md text-xs hover:bg-orange-700 transition"
                        >
                          <span className="hidden md:block">View</span>
                          <Image className="h-3.5 w-3.5" src={assets.redirect_icon} alt="view" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deletingId === product._id}
                          className="flex items-center gap-1 px-2 md:px-3 py-1.5 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {deletingId === product._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="w-full py-16 text-center text-gray-400">
                <p className="text-lg font-medium">No products yet</p>
                <p className="text-sm mt-1">Add products using the "Add Product" panel</p>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
