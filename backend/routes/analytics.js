const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect: auth } = require('../middleware/auth');

// Sales analytics routes
router.get('/sales', auth, analyticsController.getSalesAnalytics);

// User analytics routes
router.get('/users', auth, analyticsController.getUserAnalytics);

// Product analytics routes
router.get('/products', auth, analyticsController.getProductAnalytics);

// Inventory analytics routes
router.get('/inventory', auth, analyticsController.getInventoryAnalytics);

// Dashboard overview route
router.get('/dashboard', auth, analyticsController.getDashboardOverview);

// Revenue by category route
router.get('/revenue-by-category', auth, analyticsController.getRevenueByCategory);

// Top selling products route
router.get('/top-selling', auth, analyticsController.getTopSellingProducts);

// Customer acquisition route
router.get('/customer-acquisition', auth, analyticsController.getCustomerAcquisition);

module.exports = router;