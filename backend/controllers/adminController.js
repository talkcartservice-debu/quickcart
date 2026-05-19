const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, allOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.find({})
    ]);

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);

    res.json({ totalUsers, totalProducts, totalOrders, totalRevenue });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('items.product', 'name images offerPrice')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

    const updateFields = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      updateFields.status = status;
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      updateFields.paymentStatus = paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete any product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const adminDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create product (admin only)
// @route   POST /api/admin/products
// @access  Private/Admin
const adminCreateProduct = async (req, res) => {
  try {
    const { name, description, price, offerPrice, images, category, stock } = req.body;

    if (!name || !description || !price || !offerPrice || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      offerPrice: parseFloat(offerPrice),
      images: images || [],
      category,
      stock: parseInt(stock) || 0,
      userId: req.user._id
    });

    const created = await product.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('Admin create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update any product (admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const adminUpdateProduct = async (req, res) => {
  try {
    const { name, description, price, offerPrice, images, category, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (offerPrice !== undefined) product.offerPrice = parseFloat(offerPrice);
    if (images !== undefined) product.images = images;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  adminDeleteProduct,
  adminCreateProduct,
  adminUpdateProduct
};
