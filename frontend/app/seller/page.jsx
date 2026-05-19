'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import apiService from "@/services/api";
import { useAppContext } from "@/context/AppContext";

const CATEGORIES = ['Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories'];

const AddProduct = () => {
  const { fetchProductData } = useAppContext();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Smartphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [stock, setStock] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name || !description || !price || !offerPrice || !stock) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (parseFloat(offerPrice) > parseFloat(price)) {
      setErrorMsg('Offer price cannot exceed original price.');
      return;
    }

    const placeholderImages = [
      'https://placehold.co/600x400/EEE/31343C?text=Product+Image+1',
      'https://placehold.co/600x400/EEE/31343C?text=Product+Image+2',
      'https://placehold.co/600x400/EEE/31343C?text=Product+Image+3',
      'https://placehold.co/600x400/EEE/31343C?text=Product+Image+4'
    ];

    const productData = {
      name: name.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      offerPrice: parseFloat(offerPrice),
      stock: parseInt(stock),
      images: placeholderImages
    };

    setSubmitting(true);
    try {
      await apiService.adminCreateProduct(productData);
      await fetchProductData();
      setSuccessMsg(`"${name}" has been added successfully!`);
      setName('');
      setDescription('');
      setPrice('');
      setOfferPrice('');
      setStock('');
      setFiles([]);
      setCategory('Smartphone');
    } catch (error) {
      setErrorMsg(error.message || 'Failed to add product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Add New Product</h2>
          <p className="text-sm text-gray-500">Electronics catalog — admin only</p>
        </div>

        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Product Images</p>
          <div className="flex flex-wrap items-center gap-3">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`} className="cursor-pointer">
                <input onChange={(e) => {
                  const updatedFiles = [...files];
                  updatedFiles[index] = e.target.files[0];
                  setFiles(updatedFiles);
                }} type="file" id={`image${index}`} accept="image/*" hidden />
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                  {files[index] ? (
                    <img src={URL.createObjectURL(files[index])} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image src={assets.upload_area} alt="upload" width={40} height={40} className="opacity-50" />
                  )}
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Upload product images (preview only — stored as placeholders)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="product-name">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="e.g. Samsung Galaxy S24 Ultra"
              className="w-full outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="product-description">
              Product Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="product-description"
              rows={4}
              className="w-full outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder="Describe the product features, specs, and benefits..."
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="category">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              className="w-full outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 bg-white"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="stock">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              placeholder="0"
              className="w-full outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onChange={(e) => setStock(e.target.value)}
              value={stock}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="product-price">
              Original Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="offer-price">
              Sale Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="offer-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>
        </div>

        {price && offerPrice && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Discount:</span>
            <span className="font-medium text-green-600">
              {price > 0 ? `${Math.round((1 - offerPrice / price) * 100)}% off` : '—'}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-10 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
