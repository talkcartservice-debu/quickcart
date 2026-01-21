const express = require('express');
const router = express.Router();
const { 
  getUserCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/cart')
  .get(protect, getUserCart)
  .post(protect, addToCart);

router.route('/cart/:productId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

module.exports = router;