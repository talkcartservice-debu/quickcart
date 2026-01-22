const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Ensure each user has only one wishlist
wishlistSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);