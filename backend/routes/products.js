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
const { protect, sellerProtect } = require('../middleware/auth');

// Public routes
router.route('/')
  .get(getProducts);

router.route('/search')
  .get(searchProducts);

router.route('/:id')
  .get(getProductById);

// Protected routes (seller only)
router.route('/')
  .post(protect, sellerProtect, createProduct);

router.route('/:id')
  .put(protect, sellerProtect, updateProduct)
  .delete(protect, sellerProtect, deleteProduct);

module.exports = router;