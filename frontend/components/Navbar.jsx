"use client"
import React from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {

  const { isSeller, isAdmin, router, userData, getCartCount } = useAppContext();
  const cartCount = getCartCount();

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          Contact
        </Link>

        {isAdmin && (
          <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full bg-orange-50 border-orange-400 text-orange-700 font-medium">
            Admin Panel
          </button>
        )}

      </div>

      <ul className="hidden md:flex items-center gap-4 ">
        <Image className="w-4 h-4 cursor-pointer" src={assets.search_icon} alt="search icon" onClick={() => router.push('/all-products')} />
        <button
          onClick={() => router.push('/cart')}
          className="relative hover:text-gray-900 transition"
          aria-label="Cart"
        >
          <Image src={assets.cart_icon} alt="cart" className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
        <button 
          className="flex items-center gap-2 hover:text-gray-900 transition"
          onClick={() => {
            if (userData) {
              router.push('/account');
            } else {
              router.push('/login');
            }
          }}
        >
          <Image src={assets.user_icon} alt="user icon" />
          {userData ? `Hi, ${userData.name}` : 'Account'}
        </button>
      </ul>

      <div className="flex items-center md:hidden gap-3">
        {isAdmin && (
          <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full bg-orange-50 border-orange-400 text-orange-700 font-medium">
            Admin Panel
          </button>
        )}
        <button
          onClick={() => router.push('/cart')}
          className="relative hover:text-gray-900 transition"
          aria-label="Cart"
        >
          <Image src={assets.cart_icon} alt="cart" className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
        <button 
          className="flex items-center gap-2 hover:text-gray-900 transition"
          onClick={() => {
            if (userData) {
              router.push('/account');
            } else {
              router.push('/login');
            }
          }}
        >
          <Image src={assets.user_icon} alt="user icon" />
          {userData ? `Hi, ${userData.name}` : 'Account'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;