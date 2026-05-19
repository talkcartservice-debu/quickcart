const Product = require('../models/Product');
const mongoose = require('mongoose');

// Import shared guest cart storage
const { guestCarts } = require('../utils/cartStorage');

// @desc    Get guest cart
// @route   GET /api/guest-cart
// @access  Public
const getGuestCart = (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(200).json({});
    }
    
    const cart = guestCarts.get(sessionId) || {};
    res.json(cart);
  } catch (error) {
    console.error('Get guest cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to guest cart
// @route   POST /api/guest-cart
// @access  Public
const addToGuestCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get or initialize guest cart
    let cart = guestCarts.get(sessionId) || {};
    
    // Check stock availability
    const currentQuantity = cart[productId] || 0;
    const requestedQuantity = currentQuantity + quantity;
    
    if (requestedQuantity > product.stock) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock`,
        availableStock: product.stock
      });
    }
    
    cart[productId] = requestedQuantity;
    guestCarts.set(sessionId, cart);
    
    res.json({
      cart,
      message: 'Item added to cart successfully',
      productInfo: {
        name: product.name,
        stock: product.stock,
        requestedQuantity
      }
    });
  } catch (error) {
    console.error('Add to guest cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update guest cart item quantity
// @route   PUT /api/guest-cart/:productId
// @access  Public
const updateGuestCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get guest cart
    let cart = guestCarts.get(sessionId) || {};
    
    // Check stock availability
    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock`,
        availableStock: product.stock
      });
    }
    
    if (quantity === 0) {
      delete cart[productId];
    } else {
      cart[productId] = quantity;
    }
    
    guestCarts.set(sessionId, cart);
    
    res.json({
      cart,
      message: 'Cart updated successfully',
      productInfo: {
        name: product.name,
        stock: product.stock,
        requestedQuantity: quantity
      }
    });
  } catch (error) {
    console.error('Update guest cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from guest cart
// @route   DELETE /api/guest-cart/:productId
// @access  Public
const removeFromGuestCart = (req, res) => {
  try {
    const { productId } = req.params;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    let cart = guestCarts.get(sessionId) || {};
    
    // Check if item exists in cart before removal
    if (cart[productId]) {
      delete cart[productId];
      guestCarts.set(sessionId, cart);
      
      res.json({
        cart,
        message: 'Item removed from cart successfully'
      });
    } else {
      res.json({
        cart,
        message: 'Item was not in cart'
      });
    }
  } catch (error) {
    console.error('Remove from guest cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Merge guest cart to user cart
// @route   POST /api/guest-cart/merge
// @access  Private
const mergeGuestCartToUserCart = async (req, res) => {
  try {
    const User = require('../models/User'); // Require here to avoid circular dependency
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get guest cart
    const guestCart = guestCarts.get(sessionId) || {};
    
    // Merge guest cart to user cart
    const userCart = Object.fromEntries(user.cartItems);
    
    for (const [productId, quantity] of Object.entries(guestCart)) {
      const product = await Product.findById(productId);
      
      if (product && quantity <= product.stock) {
        // Check if adding this quantity exceeds stock
        const currentQuantity = userCart[productId] || 0;
        const newQuantity = currentQuantity + quantity;
        
        if (newQuantity <= product.stock) {
          userCart[productId] = newQuantity;
        }
      }
    }
    
    user.cartItems = userCart;
    await user.save();
    
    // Clear the guest cart after merging
    guestCarts.delete(sessionId);
    
    res.json({
      cart: userCart,
      message: 'Guest cart merged to user cart successfully'
    });
  } catch (error) {
    console.error('Merge guest cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  mergeGuestCartToUserCart
};