const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  getSellerOrders 
} = require('../controllers/orderController');
const { protect, sellerProtect } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder)
  .get(protect, getUserOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/seller/orders')
  .get(protect, sellerProtect, getSellerOrders);

module.exports = router;