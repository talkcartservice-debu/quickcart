const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ userId }).populate('products');
    
    if (!wishlist) {
      // Create a new wishlist if it doesn't exist
      wishlist = new Wishlist({ userId, products: [] });
      await wishlist.save();
      wishlist = await wishlist.populate('products');
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist', error: error.message });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
      await wishlist.save();
    } else {
      // Add product if not already in wishlist
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    // Populate and return updated wishlist
    wishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist', error: error.message });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Find wishlist for user
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    // Populate and return updated wishlist
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(updatedWishlist);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist', error: error.message });
  }
};

// Check if product is in wishlist
const isInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find wishlist for user
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(200).json({ inWishlist: false });
    }

    const inWishlist = wishlist.products.some(id => id.toString() === productId);
    res.status(200).json({ inWishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error while checking wishlist', error: error.message });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find and clear wishlist for user
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error while clearing wishlist', error: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist
};