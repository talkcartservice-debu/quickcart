const Order = require('../models/Order');

// Get order tracking information
const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find order for the user
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: userId 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      orderId: order._id,
      trackingNumber: order.trackingNumber,
      status: order.trackingStatus,
      history: order.trackingHistory,
      estimatedDelivery: order.estimatedDelivery || null
    });
  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({ message: 'Server error while fetching tracking information', error: error.message });
  }
};

// Update order tracking status
const updateOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, details } = req.body;
    const userId = req.user.id;

    // Find order (this would typically be restricted to admin/fulfillment staff)
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify this is an admin or authorized fulfillment staff
    // In a real app, you'd check user roles here
    if (req.user.role !== 'admin' && req.user.role !== 'fulfillment') {
      return res.status(403).json({ message: 'Unauthorized to update tracking' });
    }

    // Update tracking status
    order.trackingStatus = status;

    // Add to tracking history
    order.trackingHistory.push({
      status,
      location: location || '',
      details: details || '',
      timestamp: new Date()
    });

    // Generate tracking number if not exists
    if (!order.trackingNumber) {
      order.trackingNumber = `QC-${Date.now()}-${order._id.toString().substring(0, 8).toUpperCase()}`;
    }

    await order.save();

    res.status(200).json({
      message: 'Tracking information updated successfully',
      order: {
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        status: order.trackingStatus,
        history: order.trackingHistory
      }
    });
  } catch (error) {
    console.error('Update order tracking error:', error);
    res.status(500).json({ message: 'Server error while updating tracking information', error: error.message });
  }
};

// Get all tracked orders for a user
const getUserTrackedOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all orders for the user with tracking information
    const orders = await Order.find({ userId })
      .select('_id trackingNumber trackingStatus updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders: orders.map(order => ({
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        status: order.trackingStatus,
        updatedAt: order.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get user tracked orders error:', error);
    res.status(500).json({ message: 'Server error while fetching tracked orders', error: error.message });
  }
};

// Admin: Get all orders for tracking management
const getAllTrackedOrders = async (req, res) => {
  try {
    // Only for admins
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (status) {
      filter.trackingStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .select('_id trackingNumber trackingStatus userId createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders: orders.map(order => ({
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        status: order.trackingStatus,
        customer: order.userId,
        date: order.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get all tracked orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders', error: error.message });
  }
};

// Get order by tracking number (public endpoint for customers)
const getOrderByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const order = await Order.findOne({ trackingNumber })
      .populate('userId', 'name')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found with this tracking number' });
    }

    // Return only necessary information to the customer
    res.status(200).json({
      orderId: order._id,
      trackingNumber: order.trackingNumber,
      status: order.trackingStatus,
      history: order.trackingHistory,
      customerName: order.userId?.name || 'Customer',
      items: order.items.map(item => ({
        name: item.product?.name,
        quantity: item.quantity,
        image: item.product?.images?.[0]
      })),
      totalAmount: order.amount,
      orderDate: order.createdAt,
      estimatedDelivery: order.estimatedDelivery || null
    });
  } catch (error) {
    console.error('Get order by tracking number error:', error);
    res.status(500).json({ message: 'Server error while fetching order', error: error.message });
  }
};

module.exports = {
  getOrderTracking,
  updateOrderTracking,
  getUserTrackedOrders,
  getAllTrackedOrders,
  getOrderByTrackingNumber
};