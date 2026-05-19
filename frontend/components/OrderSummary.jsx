'use client';
import React, { useEffect, useState } from "react";
import apiService from "@/services/api";
import { useAppContext } from "@/context/AppContext";

const VALID_PROMO_CODES = { 'SAVE10': 0.10, 'QUICK20': 0.20 };

const OrderSummary = () => {

  const { currency, router, getCartCount, getCartAmount, cartItems, setCartItems } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const [userAddresses, setUserAddresses] = useState([]);

  const fetchUserAddresses = async () => {
    try {
      const addresses = await apiService.getAddresses();
      setUserAddresses(addresses);
      
      // Set first address as default if none selected
      if (addresses.length > 0 && !selectedAddress) {
        setSelectedAddress(addresses[0]);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setUserAddresses([]);
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_PROMO_CODES[code]) {
      setPromoDiscount(VALID_PROMO_CODES[code]);
      setPromoApplied(code);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try SAVE10 or QUICK20.');
      setPromoDiscount(0);
      setPromoApplied('');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied('');
    setPromoError('');
  };

  const createOrder = async () => {
    if (!selectedAddress) {
      alert('Please select an address');
      return;
    }

    const items = Object.keys(cartItems).map(productId => ({
      productId,
      quantity: cartItems[productId]
    })).filter(item => item.quantity > 0);

    if (items.length === 0) {
      alert('Cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderData = {
        items,
        address: selectedAddress
      };

      const order = await apiService.createOrder(orderData);
      setCartItems({});
      router.push(`/checkout?orderId=${order._id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }

  useEffect(() => {
    fetchUserAddresses();
  }, [])

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          {promoApplied ? (
            <div className="flex items-center justify-between p-2.5 border border-green-300 bg-green-50 rounded">
              <span className="text-green-700 text-sm font-medium">{promoApplied} applied — {Math.round(promoDiscount * 100)}% off!</span>
              <button onClick={handleRemovePromo} className="text-green-700 hover:text-red-600 text-xs underline ml-2">Remove</button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                  placeholder="Enter promo code"
                  className="flex-grow outline-none p-2.5 text-gray-600 border"
                />
                <button onClick={handleApplyPromo} className="bg-orange-600 text-white px-6 py-2 hover:bg-orange-700 whitespace-nowrap">
                  Apply
                </button>
              </div>
              {promoError && <p className="text-red-500 text-xs">{promoError}</p>}
            </div>
          )}
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{currency}{getCartAmount().toFixed(2)}</p>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <p>Discount ({Math.round(promoDiscount * 100)}%)</p>
              <p className="font-medium">-{currency}{(getCartAmount() * promoDiscount).toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{(getCartAmount() * 0.02).toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{currency}{(getCartAmount() * (1 - promoDiscount) + getCartAmount() * 0.02).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={placingOrder}
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {placingOrder ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
};

export default OrderSummary;