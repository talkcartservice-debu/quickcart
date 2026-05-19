const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Get user and product
    const [user, product] = await Promise.all([
      User.findById(req.user._id),
      Product.findById(productId)
    ]);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check product stock availability
    const cartItems = Object.fromEntries(user.cartItems);
    const currentQuantity = cartItems[productId] || 0;
    const requestedQuantity = currentQuantity + 1;
    
    if (requestedQuantity > product.stock) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock`,
        availableStock: product.stock
      });
    }
    
    cartItems[productId] = requestedQuantity;
    user.cartItems = cartItems;
    await user.save();
    
    res.json({
      cartItems,
      message: 'Item added to cart successfully',
      productInfo: {
        name: product.name,
        stock: product.stock,
        requestedQuantity
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/users/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    
    // Get user and product
    const [user, product] = await Promise.all([
      User.findById(req.user._id),
      Product.findById(productId)
    ]);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check stock availability if increasing quantity
    const cartItems = Object.fromEntries(user.cartItems);
    const currentQuantity = cartItems[productId] || 0;
    
    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock`,
        availableStock: product.stock
      });
    }
    
    if (quantity === 0) {
      delete cartItems[productId];
    } else {
      cartItems[productId] = quantity;
    }
    
    user.cartItems = cartItems;
    await user.save();
    
    res.json({
      cartItems,
      message: 'Cart updated successfully',
      productInfo: {
        name: product.name,
        stock: product.stock,
        requestedQuantity: quantity
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const cartItems = Object.fromEntries(user.cartItems);
    
    // Check if item exists in cart before removal
    if (cartItems[productId]) {
      delete cartItems[productId];
      user.cartItems = cartItems;
      await user.save();
      
      res.json({
        cartItems,
        message: 'Item removed from cart successfully'
      });
    } else {
      res.json({
        cartItems,
        message: 'Item was not in cart'
      });
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Validate cart items
// @route   POST /api/users/cart/validate
// @access  Private
const validateCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const cartItems = Object.fromEntries(user.cartItems);
    const updatedCartItems = {};
    const validationIssues = [];
    
    // Get all products in the cart
    const productIds = Object.keys(cartItems);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Validate each cart item
    for (const [productId, quantity] of Object.entries(cartItems)) {
      const product = products.find(p => p._id.toString() === productId);
      
      if (!product) {
        // Product no longer exists
        validationIssues.push({
          productId,
          issue: 'Product no longer exists',
          action: 'removed'
        });
        continue; // Skip adding this item to the updated cart
      }
      
      // Check stock availability
      if (quantity > product.stock) {
        const correctedQuantity = product.stock;
        if (correctedQuantity > 0) {
          updatedCartItems[productId] = correctedQuantity;
          validationIssues.push({
            productId,
            issue: 'Quantity exceeds available stock',
            originalQuantity: quantity,
            correctedQuantity,
            action: 'adjusted'
          });
        } else {
          validationIssues.push({
            productId,
            issue: 'Product out of stock',
            action: 'removed'
          });
        }
      } else {
        // Item is valid, add to updated cart
        updatedCartItems[productId] = quantity;
      }
    }
    
    // Update user cart with valid items only
    if (Object.keys(updatedCartItems).length !== Object.keys(cartItems).length || validationIssues.length > 0) {
      user.cartItems = updatedCartItems;
      await user.save();
    }
    
    res.json({
      cartItems: updatedCartItems,
      validationIssues,
      isValid: validationIssues.length === 0,
      message: validationIssues.length === 0 ? 'Cart is valid' : `${validationIssues.length} validation issues found and resolved`
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  validateCart
};