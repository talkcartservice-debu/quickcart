const express = require('express');
const router = express.Router();
const { addReview, getProductReviews, getUserReview, deleteReview, getUserReviews } = require('../controllers/reviewController');
const { protect: auth } = require('../middleware/auth');

// Add a review to a product
router.post('/product/:productId', auth, addReview);

// Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Get user's review for a product
router.get('/product/:productId/user', auth, getUserReview);

// Delete a user's review for a product
router.delete('/product/:productId', auth, deleteReview);

// Get all reviews by a user
router.get('/user', auth, getUserReviews);

module.exports = router;