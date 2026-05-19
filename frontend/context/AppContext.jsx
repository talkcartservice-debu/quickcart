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
    const [isAdmin, setIsAdmin] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [guestCartItems, setGuestCartItems] = useState({})
    const [isGuest, setIsGuest] = useState(true)
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
            setIsSeller(data.role === 'seller' || data.role === 'admin');
            setIsAdmin(data.role === 'admin');
            setCartItems(data.cartItems || {});
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            
            // If it's specifically an invalid token error, the API service should have already cleared the token
            // But we double-check to make sure
            if (error.message.includes('Invalid token signature') || error.message.includes('token failed')) {
                // Token has been cleared by API service, just update state
                console.log('User token was invalid and has been cleared. User needs to log in again.');
            }
            
            setUserData(null);
            setIsSeller(false);
            setIsAdmin(false);
            setCartItems({});
        } finally {
            setLoading(false);
        }
    }

    const addToCart = async (itemId) => {
        try {
            if (userData) {
                const updatedCart = await apiService.addToCart(itemId);
                setCartItems(updatedCart.cartItems || updatedCart);
            } else {
                const updatedCart = await apiService.addToGuestCart(itemId);
                setGuestCartItems(updatedCart.cart || {});
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        try {
            if (userData) {
                let updatedCart;
                if (quantity === 0) {
                    updatedCart = await apiService.removeFromCart(itemId);
                } else {
                    updatedCart = await apiService.updateCartItem(itemId, quantity);
                }
                setCartItems(updatedCart.cartItems || updatedCart);
            } else {
                // User is a guest, use guest cart
                if (quantity === 0) {
                    const updatedCart = await apiService.removeFromGuestCart(itemId);
                    setGuestCartItems(updatedCart.cart || {});
                } else {
                    const updatedCart = await apiService.updateGuestCartItem(itemId, quantity);
                    setGuestCartItems(updatedCart.cart || {});
                }
            }
        } catch (error) {
            console.error('Failed to update cart quantity:', error);
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        const itemsToCheck = userData ? cartItems : guestCartItems;
        
        for (const items in itemsToCheck) {
            if (itemsToCheck[items] > 0) {
                totalCount += itemsToCheck[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        const itemsToCheck = userData ? cartItems : guestCartItems;
        
        for (const items in itemsToCheck) {
            let itemInfo = products.find((product) => product._id === items);
            if (itemsToCheck[items] > 0 && itemInfo) {
                totalAmount += itemInfo.offerPrice * itemsToCheck[items];
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
    
    // Guest cart functions
    const getGuestCart = async () => {
        try {
            const data = await apiService.getGuestCart();
            setGuestCartItems(data);
            return data;
        } catch (error) {
            console.error('Failed to get guest cart:', error);
            return {};
        }
    };
    
    const addToGuestCart = async (itemId) => {
        try {
            const updatedCart = await apiService.addToGuestCart(itemId);
            setGuestCartItems(updatedCart.cart || {});
            return updatedCart;
        } catch (error) {
            console.error('Failed to add to guest cart:', error);
            return null;
        }
    };
    
    const updateGuestCartQuantity = async (itemId, quantity) => {
        try {
            if (quantity === 0) {
                const updatedCart = await apiService.removeFromGuestCart(itemId);
                setGuestCartItems(updatedCart.cart || {});
            } else {
                const updatedCart = await apiService.updateGuestCartItem(itemId, quantity);
                setGuestCartItems(updatedCart.cart || {});
            }
        } catch (error) {
            console.error('Failed to update guest cart quantity:', error);
        }
    };
    
    const mergeGuestCartToUserCart = async () => {
        try {
            const result = await apiService.mergeGuestCartToUserCart();
            // Update user cart with merged data
            if (userData) {
                setCartItems(result.cart || {});
            }
            // Clear guest cart
            setGuestCartItems({});
            return result;
        } catch (error) {
            console.error('Failed to merge guest cart:', error);
            return null;
        }
    };
    
    const validateCart = async () => {
        try {
            const result = await apiService.validateCart();
            if (result.cartItems) {
                setCartItems(result.cartItems);
            }
            return result;
        } catch (error) {
            console.error('Failed to validate cart:', error);
            return null;
        }
    };
    


    useEffect(() => {
        fetchProductData();
        fetchUserData();
        // Load guest cart if user is not logged in
        if (!userData) {
            getGuestCart();
        }
    }, [userData]); // Run once on mount and when userData changes
    
    // Fetch wishlist when userData is available
    useEffect(() => {
        if (userData) {
            fetchWishlistData();
        }
    }, [userData]);

    const value = {
        currency,
        router,
        isSeller, setIsSeller,
        isAdmin,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        guestCartItems, setGuestCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlistItems, fetchWishlistData,
        addToWishlist, removeFromWishlist,
        isInWishlist, getWishlistCount,
        // Guest cart functions
        getGuestCart,
        addToGuestCart,
        updateGuestCartQuantity,
        mergeGuestCartToUserCart,
        validateCart,
        loading
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}