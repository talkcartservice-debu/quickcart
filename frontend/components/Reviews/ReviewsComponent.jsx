'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import apiService from '@/services/api';

const ReviewsComponent = ({ productId, productRating }) => {
  const { userData, isInWishlist, addToWishlist, removeFromWishlist } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
    if (userData) {
      fetchUserReview();
    }
  }, [productId, userData]);

  const fetchReviews = async () => {
    try {
      const data = await apiService.getProductReviews(productId);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const data = await apiService.getUserReview(productId);
      setUserReview(data.review);
      setHasReviewed(data.hasReviewed);
    } catch (err) {
      console.error('Error fetching user review:', err);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setError('');

    if (!reviewForm.rating) {
      setError('Please select a rating');
      return;
    }

    try {
      const reviewData = {
        rating: reviewForm.rating,
        comment: reviewForm.comment
      };

      await apiService.addReview(productId, reviewData);
      
      // Refresh reviews
      fetchReviews();
      fetchUserReview();
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add review');
    }
  };

  const handleDeleteReview = async () => {
    try {
      await apiService.deleteReview(productId);
      
      // Refresh reviews
      fetchReviews();
      fetchUserReview();
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onRate = null, size = 'small') => {
    const starSize = size === 'large' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            disabled={!interactive}
          >
            <svg
              className={`${starSize} ${star <= rating ? 'fill-current' : 'fill-current'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Reviews & Ratings</h3>
        {userData && !hasReviewed && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm"
          >
            {hasReviewed ? 'Edit Review' : 'Write Review'}
          </button>
        )}
      </div>

      <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center mr-6">
          <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center mt-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="text-sm text-gray-600 mt-1">{totalReviews} reviews</div>
        </div>
        <div className="flex-1">
          {userData && hasReviewed && userReview && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{userData.name}</div>
                  <div className="flex items-center mt-1">
                    {renderStars(userReview.rating)}
                  </div>
                </div>
                <button
                  onClick={handleDeleteReview}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              {userReview.comment && (
                <div className="mt-2 text-gray-700">{userReview.comment}</div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                {new Date(userReview.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReviewForm && userData && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
          <h4 className="font-bold text-gray-800 mb-4">Write a Review</h4>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleAddReview}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Rating</label>
              <div className="flex">
                {renderStars(reviewForm.rating, true, (rating) => setReviewForm({...reviewForm, rating}))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                placeholder="Share your experience with this product..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows="4"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-bold text-gray-800">Customer Reviews</h4>
        {reviews.length > 0 ? (
          reviews.slice(0, 5).map((review, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex justify-between">
                <div className="font-medium">{review.userId?.name || 'Anonymous'}</div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center mt-1">
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <div className="mt-2 text-gray-700">{review.comment}</div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsComponent;