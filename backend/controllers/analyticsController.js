const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      switch(period) {
        case 'day':
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
          break;
        case 'week':
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
          break;
        case 'month':
          dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
          break;
        case 'year':
          dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
          break;
        default:
          dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
      }
    }

    // Get orders with date filter
    const orders = await Order.find(dateFilter);
    
    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get orders by status
    const ordersByStatus = {};
    orders.forEach(order => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Get revenue by day for chart data
    const revenueByDay = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + order.amount;
    });

    res.status(200).json({
      period,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      ordersByStatus,
      revenueByDay,
      dateRange: {
        startDate: dateFilter.createdAt ? dateFilter.createdAt.$gte : null,
        endDate: dateFilter.createdAt ? dateFilter.createdAt.$lte : new Date()
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching sales analytics', error: error.message });
  }
};

// Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let dateFilter = {};
    
    switch(period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
    }

    // Get all users and new users
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments(dateFilter);
    
    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get users with orders
    const usersWithOrders = await Order.distinct('userId');
    const activeUsers = usersWithOrders.length;

    res.status(200).json({
      period,
      totalUsers,
      newUsers,
      activeUsers,
      usersByRole,
      retentionRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching user analytics', error: error.message });
  }
};

// Get product analytics
const getProductAnalytics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { 
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$amount'] } }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' }
    ]);

    // Get product counts by category
    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get products with highest ratings
    const topRatedProducts = await Product.find({ averageRating: { $gt: 0 } })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      topSellingProducts: topProducts.map(item => ({
        productId: item._id,
        productName: item.productInfo.name,
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue,
        category: item.productInfo.category
      })),
      productsByCategory,
      topRatedProducts: topRatedProducts.map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        price: product.offerPrice
      }))
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching product analytics', error: error.message });
  }
};

// Get inventory analytics
const getInventoryAnalytics = async (req, res) => {
  try {
    // Get products with low stock (assuming we had stock tracking)
    const lowStockProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(20);

    // Get wishlist statistics
    const wishlistStats = await Wishlist.aggregate([
      { $project: { productCount: { $size: '$products' } } },
      { $group: { 
          _id: null,
          totalWishlists: { $sum: 1 },
          avgProductsPerWishlist: { $avg: '$productCount' },
          maxProductsInWishlist: { $max: '$productCount' }
        } 
      }
    ]);

    // Get popular categories
    const popularCategories = await Product.aggregate([
      { $group: { 
          _id: '$category',
          productCount: { $sum: 1 },
          avgPrice: { $avg: '$offerPrice' }
        } 
      },
      { $sort: { productCount: -1 } }
    ]);

    res.status(200).json({
      lowStockProducts: lowStockProducts.map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.offerPrice,
        createdAt: product.createdAt
      })),
      wishlistStats: wishlistStats[0] || {
        totalWishlists: 0,
        avgProductsPerWishlist: 0,
        maxProductsInWishlist: 0
      },
      popularCategories
    });
  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching inventory analytics', error: error.message });
  }
};

// Get revenue by category
const getRevenueByCategory = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let dateFilter = {};
    
    switch(period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
    }

    // Get revenue by category
    const revenueByCategory = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      { $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $group: {
          _id: '$productInfo.category',
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$amount'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      period,
      revenueByCategory: revenueByCategory.map(item => ({
        category: item._id,
        revenue: item.totalRevenue,
        orderCount: item.orderCount
      }))
    });
  } catch (error) {
    console.error('Get revenue by category error:', error);
    res.status(500).json({ message: 'Server error while fetching revenue by category', error: error.message });
  }
};

// Get top selling products
const getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10, period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let dateFilter = {};
    
    switch(period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
    }

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$amount'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' }
    ]);

    res.status(200).json({
      period,
      topSellingProducts: topProducts.map(item => ({
        productId: item._id,
        productName: item.productInfo.name,
        category: item.productInfo.category,
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue,
        price: item.productInfo.offerPrice
      }))
    });
  } catch (error) {
    console.error('Get top selling products error:', error);
    res.status(500).json({ message: 'Server error while fetching top selling products', error: error.message });
  }
};

// Get customer acquisition
const getCustomerAcquisition = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let dateFilter = {};
    
    switch(period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
    }

    // Get new customers
    const newCustomers = await User.find(dateFilter).select('_id email createdAt');
    
    // Get customer acquisition by source (would need additional tracking)
    const acquisitionBySource = await User.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      period,
      newCustomers: newCustomers.length,
      acquisitionByDate: acquisitionBySource.map(item => ({
        date: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get customer acquisition error:', error);
    res.status(500).json({ message: 'Server error while fetching customer acquisition data', error: error.message });
  }
};

// Get dashboard overview
const getDashboardOverview = async (req, res) => {
  try {
    // Get totals for dashboard
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.find({ 
      createdAt: { $gte: sevenDaysAgo } 
    }).sort({ createdAt: -1 }).limit(5);
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'Order Placed' });
    
    // Calculate revenue from recent orders
    const recentRevenue = recentOrders.reduce((sum, order) => sum + order.amount, 0);

    res.status(200).json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        recentRevenue,
        recentOrders: recentOrders.length
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        userId: order.userId,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard overview', error: error.message });
  }
};

module.exports = {
  getSalesAnalytics,
  getUserAnalytics,
  getProductAnalytics,
  getInventoryAnalytics,
  getDashboardOverview,
  getRevenueByCategory,
  getTopSellingProducts,
  getCustomerAcquisition
};