const express = require('express');
const router = express.Router();
const { 
  sendWelcome,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendDeliveryNotificationEmail,
  sendPasswordResetEmail,
  sendWishlistNotificationEmail,
  sendCustomEmail
} = require('../controllers/emailController');
const { protect: auth } = require('../middleware/auth');

// Send welcome email to user
router.post('/welcome/:userId', auth, sendWelcome);

// Send order confirmation email
router.post('/order-confirmation/:orderId', auth, sendOrderConfirmationEmail);

// Send shipping notification
router.post('/shipping/:orderId', auth, sendShippingNotificationEmail);

// Send delivery notification
router.post('/delivery/:orderId', auth, sendDeliveryNotificationEmail);

// Send password reset email
router.post('/password-reset', auth, sendPasswordResetEmail);

// Send wishlist notification
router.post('/wishlist/:productId', auth, sendWishlistNotificationEmail);

// Send custom email (admin only)
router.post('/custom', auth, sendCustomEmail);

module.exports = router;