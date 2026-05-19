const express = require('express');
const router = express.Router();
const { 
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  mergeGuestCartToUserCart
} = require('../controllers/guestCartController');
const { protect } = require('../middleware/auth');

// Guest cart routes (no authentication required)
router.route('/')
  .get(getGuestCart)
  .post(addToGuestCart);

router.route('/:productId')
  .put(updateGuestCartItem)
  .delete(removeFromGuestCart);

// Protected route to merge guest cart to user cart
router.post('/merge', protect, mergeGuestCartToUserCart);

module.exports = router;