const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist } = require('../controllers/wishlistController');
const { protect: auth } = require('../middleware/auth');

// Get user's wishlist
router.get('/', auth, getWishlist);

// Add product to wishlist
router.post('/add', auth, addToWishlist);

// Remove product from wishlist
router.post('/remove', auth, removeFromWishlist);

// Check if product is in wishlist
router.get('/:productId/is-in-wishlist', auth, isInWishlist);

// Clear wishlist
router.delete('/clear', auth, clearWishlist);

module.exports = router;