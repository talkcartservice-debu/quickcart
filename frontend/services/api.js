// API Service for communicating with backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    this.sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('sessionId') : null;
    
    // Generate session ID if it doesn't exist
    if (typeof window !== 'undefined' && !this.sessionId) {
      this.sessionId = this.generateSessionId();
      sessionStorage.setItem('sessionId', this.sessionId);
    }
  }
  
  // Generate a unique session ID for guest cart
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Set authentication token
  setAuthToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Remove authentication token
  removeAuthToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Include session ID for guest cart endpoints
    const isGuestCartEndpoint = endpoint.includes('/guest-cart');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...(isGuestCartEndpoint && this.sessionId && { 'x-session-id': this.sessionId }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // Check if the error is related to invalid token signature
        if (response.status === 401 && data.code === 'INVALID_TOKEN') {
          // Clear the invalid token from localStorage
          this.removeAuthToken();
          console.warn('Invalid token detected. Token has been cleared from localStorage.');
          
          // Optionally redirect to login page
          if (typeof window !== 'undefined') {
            // Don't redirect on certain routes to avoid loops
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              // Store the current route to redirect back after login
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            }
          }
        }
        
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication APIs
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.token) {
      this.setAuthToken(data.token);
    }
    
    return data;
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async logout() {
    this.removeAuthToken();
    return { message: 'Logged out successfully' };
  }
  
  // Guest Cart APIs
  async getGuestCart() {
    return this.request('/api/guest-cart');
  }
  
  async addToGuestCart(productId, quantity = 1) {
    return this.request('/api/guest-cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  }
  
  async updateGuestCartItem(productId, quantity) {
    return this.request(`/api/guest-cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }
  
  async removeFromGuestCart(productId) {
    return this.request(`/api/guest-cart/${productId}`, {
      method: 'DELETE'
    });
  }
  
  async mergeGuestCartToUserCart() {
    return this.request('/api/guest-cart/merge', {
      method: 'POST'
    });
  }
  
  // Validate cart items
  async validateCart() {
    return this.request('/api/users/cart/validate', {
      method: 'POST'
    });
  }

  // Product APIs
  async getProducts() {
    return this.request('/api/products');
  }

  async searchProducts(params = {}) {
    // Convert params object to query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/products/search?${queryString}` : '/api/products/search';
    return this.request(url);
  }

  async getProduct(id) {
    return this.request(`/api/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Cart APIs
  async getCart() {
    return this.request('/api/users/cart');
  }

  async addToCart(productId) {
    return this.request('/api/users/cart', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }

  async updateCartItem(productId, quantity) {
    return this.request(`/api/users/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(productId) {
    return this.request(`/api/users/cart/${productId}`, {
      method: 'DELETE'
    });
  }

  // Order APIs
  async createOrder(orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getUserOrders() {
    return this.request('/api/orders');
  }

  async getOrder(id) {
    return this.request(`/api/orders/${id}`);
  }

  async getSellerOrders() {
    return this.request('/api/orders/seller/orders');
  }

  // Address APIs
  async getAddresses() {
    return this.request('/api/addresses');
  }

  async addAddress(addressData) {
    return this.request('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  async updateAddress(id, addressData) {
    return this.request(`/api/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  }

  async deleteAddress(id) {
    return this.request(`/api/addresses/${id}`, {
      method: 'DELETE'
    });
  }

  // Payment APIs
  async getPaymentMethods() {
    return this.request('/api/payments/methods');
  }

  async createPaymentIntent(paymentData) {
    return this.request('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async processRefund(refundData) {
    return this.request('/api/payments/refund', {
      method: 'POST',
      body: JSON.stringify(refundData)
    });
  }

  // Wishlist APIs
  async getWishlist() {
    return this.request('/api/wishlist');
  }

  async addToWishlist(productId) {
    return this.request('/api/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }

  async removeFromWishlist(productId) {
    return this.request('/api/wishlist/remove', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }

  async checkWishlist(productId) {
    return this.request(`/api/wishlist/${productId}/is-in-wishlist`);
  }

  async clearWishlist() {
    return this.request('/api/wishlist/clear', {
      method: 'DELETE'
    });
  }

  // Review APIs
  async addReview(productId, reviewData) {
    return this.request(`/api/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async getProductReviews(productId) {
    return this.request(`/api/reviews/product/${productId}`);
  }

  async getUserReview(productId) {
    return this.request(`/api/reviews/product/${productId}/user`);
  }

  async deleteReview(productId) {
    return this.request(`/api/reviews/product/${productId}`, {
      method: 'DELETE'
    });
  }

  async getUserReviews() {
    return this.request('/api/reviews/user');
  }

  // Tracking APIs
  async getOrderTracking(orderId) {
    return this.request(`/api/tracking/order/${orderId}`);
  }

  async updateOrderTracking(orderId, trackingData) {
    return this.request(`/api/tracking/order/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(trackingData)
    });
  }

  async getUserTrackedOrders() {
    return this.request('/api/tracking/user');
  }

  async getAllTrackedOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/tracking?${queryString}` : '/api/tracking';
    return this.request(url);
  }

  async getOrderByTrackingNumber(trackingNumber) {
    return this.request(`/api/tracking/tracking/${trackingNumber}`);
  }

  // Email Notification APIs
  async sendWelcomeEmail(userId) {
    return this.request(`/api/emails/welcome/${userId}`, {
      method: 'POST'
    });
  }

  async sendOrderConfirmationEmail(orderId) {
    return this.request(`/api/emails/order-confirmation/${orderId}`, {
      method: 'POST'
    });
  }

  async sendShippingNotification(orderId) {
    return this.request(`/api/emails/shipping/${orderId}`, {
      method: 'POST'
    });
  }

  async sendDeliveryNotification(orderId) {
    return this.request(`/api/emails/delivery/${orderId}`, {
      method: 'POST'
    });
  }

  async sendPasswordResetEmail(email) {
    return this.request('/api/emails/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async sendWishlistNotification(productId) {
    return this.request(`/api/emails/wishlist/${productId}`, {
      method: 'POST'
    });
  }

  // Social Media APIs
  async getSocialPlatforms() {
    return this.request('/api/social/platforms');
  }

  async getSocialShareUrl(platform, content, url) {
    const params = new URLSearchParams({ platform, content, url }).toString();
    return this.request(`/api/social/share-url?${params}`);
  }

  async shareToSocialMedia(platform, content, url, imageUrl) {
    return this.request('/api/social/share', {
      method: 'POST',
      body: JSON.stringify({ platform, content, url, imageUrl })
    });
  }

  async initiateSocialAuth(platform) {
    // This would redirect to the OAuth endpoint
    window.location.href = `${this.baseURL}/api/social/auth/${platform}`;
  }

  // Analytics APIs
  async getSalesAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/analytics/sales?${queryString}` : '/api/analytics/sales';
    return this.request(url);
  }

  async getUserAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/analytics/users?${queryString}` : '/api/analytics/users';
    return this.request(url);
  }

  async getProductAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/analytics/products?${queryString}` : '/api/analytics/products';
    return this.request(url);
  }

  async getInventoryAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/analytics/inventory?${queryString}` : '/api/analytics/inventory';
    return this.request(url);
  }

  async getDashboardOverview() {
    return this.request('/api/analytics/dashboard');
  }

  async getRevenueByCategory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/analytics/revenue-by-category?${queryString}` : '/api/analytics/revenue-by-category';
    return this.request(url);
  }

  async getTopSellingProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/analytics/top-selling?${queryString}` : '/api/analytics/top-selling';
    return this.request(url);
  }

  async getCustomerAcquisition(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/analytics/customer-acquisition?${queryString}` : '/api/analytics/customer-acquisition';
    return this.request(url);
  }

  // Admin APIs
  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

  async getAllUsers() {
    return this.request('/api/admin/users');
  }

  async updateUserRole(userId, role) {
    return this.request(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async adminDeleteUser(userId) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async getAllOrders() {
    return this.request('/api/admin/orders');
  }

  async updateOrderStatus(orderId, status, paymentStatus) {
    return this.request(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentStatus })
    });
  }

  async adminCreateProduct(productData) {
    return this.request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async adminUpdateProduct(productId, productData) {
    return this.request(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async adminDeleteProduct(productId) {
    return this.request(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    });
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;