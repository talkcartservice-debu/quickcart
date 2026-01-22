const express = require('express');
const router = express.Router();
const { 
  getOrderTracking, 
  updateOrderTracking, 
  getUserTrackedOrders, 
  getAllTrackedOrders,
  getOrderByTrackingNumber
} = require('../controllers/trackingController');
const { protect: auth } = require('../middleware/auth');

// Get order tracking information (user specific)
router.get('/order/:orderId', auth, getOrderTracking);

// Update order tracking (admin/fulfillment only)
router.put('/order/:orderId', auth, updateOrderTracking);

// Get all tracked orders for a user
router.get('/user', auth, getUserTrackedOrders);

// Get all tracked orders (admin only)
router.get('/', auth, getAllTrackedOrders);

// Get order by tracking number (public endpoint)
router.get('/tracking/:trackingNumber', getOrderByTrackingNumber);

module.exports = router;