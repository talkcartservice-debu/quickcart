'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import apiService from "@/services/api";

// Create context with default value
const AppContext = createContext({
  currency: '$',
  router: null,
  isSeller: false,
  setIsSeller: () => {},
  userData: null,
  fetchUserData: async () => {},
  products: [],
  fetchProductData: async () => {},
  cartItems: {},
  setCartItems: () => {},
  addToCart: async () => {},
  updateCartQuantity: async () => {},
  getCartCount: () => 0,
  getCartAmount: () => 0,
  loading: true
});

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = ({ router, children }) => {
    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [wishlistItems, setWishlistItems] = useState([])
    const [loading, setLoading] = useState(true)

    // Note: Router will be passed from parent component in client wrapper

    const currency = process.env.NEXT_PUBLIC_CURRENCY || '$';

    const fetchProductData = async () => {
        try {
            const data = await apiService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    }

    const fetchUserData = async () => {
        try {
            const data = await apiService.getProfile();
            setUserData(data);
            setIsSeller(data.role === 'seller');
            setCartItems(data.cartItems || {});
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setUserData(null);
            setIsSeller(false);
            setCartItems({});
        } finally {
            setLoading(false);
        }
    }

    const addToCart = async (itemId) => {
        try {
            const updatedCart = await apiService.addToCart(itemId);
            setCartItems(updatedCart);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        try {
            if (quantity === 0) {
                const updatedCart = await apiService.removeFromCart(itemId);
                setCartItems(updatedCart);
            } else {
                const updatedCart = await apiService.updateCartItem(itemId, quantity);
                setCartItems(updatedCart);
            }
        } catch (error) {
            console.error('Failed to update cart quantity:', error);
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const fetchWishlistData = async () => {
        try {
            const data = await apiService.getWishlist();
            setWishlistItems(data.products || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            setWishlistItems([]);
        }
    }

    const addToWishlist = async (productId) => {
        try {
            const updatedWishlist = await apiService.addToWishlist(productId);
            setWishlistItems(updatedWishlist.products || []);
            return true;
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            return false;
        }
    }

    const removeFromWishlist = async (productId) => {
        try {
            const updatedWishlist = await apiService.removeFromWishlist(productId);
            setWishlistItems(updatedWishlist.products || []);
            return true;
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            return false;
        }
    }

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId);
    }

    const getWishlistCount = () => {
        return wishlistItems.length;
    }

    useEffect(() => {
        fetchProductData();
        fetchUserData();
        if (userData) {
            fetchWishlistData();
        }
    }, [userData])

    const value = {
        currency,
        router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlistItems, fetchWishlistData,
        addToWishlist, removeFromWishlist,
        isInWishlist, getWishlistCount,
        loading
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}