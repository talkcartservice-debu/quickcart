const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts
} = require('../controllers/productController');
const { protect, adminProtect } = require('../middleware/auth');

// Public routes
router.route('/')
  .get(getProducts);

router.route('/search')
  .get(searchProducts);

router.route('/:id')
  .get(getProductById);

module.exports = router;