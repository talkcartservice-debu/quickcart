const Product = require('../models/Product');
const User = require('../models/User');

// Add a review to a product
const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReviewIndex = product.reviews.findIndex(
      review => review.userId.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      product.reviews[existingReviewIndex].rating = rating;
      product.reviews[existingReviewIndex].comment = comment;
      product.reviews[existingReviewIndex].createdAt = new Date();
    } else {
      // Add new review
      product.reviews.push({
        userId,
        rating,
        comment
      });
    }

    // Calculate new average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;
    product.totalReviews = product.reviews.length;

    await product.save();

    res.status(200).json({
      message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully',
      product
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error while adding review', error: error.message });
  }
};

// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product and populate reviews with user info
    const product = await Product.findById(productId)
      .populate({
        path: 'reviews.userId',
        select: 'name email'
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      reviews: product.reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews', error: error.message });
  }
};

// Get user's review for a product
const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find the product and user's review
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userReview = product.reviews.find(
      review => review.userId.toString() === userId
    );

    res.status(200).json({
      hasReviewed: !!userReview,
      review: userReview || null
    });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({ message: 'Server error while fetching user review', error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find and remove the review
    const reviewIndex = product.reviews.findIndex(
      review => review.userId.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    product.reviews.splice(reviewIndex, 1);

    // Recalculate average rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = totalRating / product.reviews.length;
    } else {
      product.averageRating = 0;
    }
    product.totalReviews = product.reviews.length;

    await product.save();

    res.status(200).json({
      message: 'Review deleted successfully',
      product
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review', error: error.message });
  }
};

// Get all reviews by a user
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all products that have reviews by this user
    const products = await Product.find({
      'reviews.userId': userId
    }).populate({
      path: 'reviews.userId',
      select: 'name email'
    }).populate({
      path: 'userId',
      select: 'name'
    });

    // Extract user's reviews from all products
    const userReviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        if (review.userId._id.toString() === userId) {
          userReviews.push({
            ...review.toObject(),
            product: {
              _id: product._id,
              name: product.name,
              images: product.images
            }
          });
        }
      });
    });

    res.status(200).json(userReviews);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching user reviews', error: error.message });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  getUserReview,
  deleteReview,
  getUserReviews
};