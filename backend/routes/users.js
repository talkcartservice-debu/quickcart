const express = require('express');
const router = express.Router();
const { 
  getUserCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart,
  validateCart 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/cart')
  .get(protect, getUserCart)
  .post(protect, addToCart);

router.route('/cart/:productId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

// Cart validation endpoint
router.post('/cart/validate', protect, validateCart);

module.exports = router;