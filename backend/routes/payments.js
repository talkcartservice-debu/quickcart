const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook, refundPayment, verifyPayment, executePayPalPayment } = require('../controllers/paymentController');
const { protect: auth } = require('../middleware/auth');

// Create payment intent
router.post('/create-intent', auth, createPaymentIntent);

// Execute PayPal payment (for PayPal approval callback)
router.post('/paypal/execute', auth, executePayPalPayment);

// Verify payment (for Paystack callback)
router.get('/verify/:reference', verifyPayment);

// Handle payment webhooks
router.post('/webhook', handleWebhook);

// Refund payment
router.post('/refund', auth, refundPayment);

// Get payment methods
router.get('/methods', (req, res) => {
  res.json({
    methods: [
      { id: 'paypal', name: 'PayPal', icon: 'paypal-icon' },
      { id: 'paystack', name: 'Paystack', icon: 'paystack-icon' },
      { id: 'mobile_money', name: 'Mobile Money', icon: 'mobile-icon' },
      { id: 'card', name: 'Credit/Debit Card', icon: 'card-icon' }
    ]
  });
});

module.exports = router;