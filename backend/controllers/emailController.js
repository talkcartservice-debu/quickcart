const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const { 
  sendWelcomeEmail, 
  sendOrderConfirmation, 
  sendShippingNotification, 
  sendDeliveryNotification,
  sendPasswordReset,
  sendWishlistNotification
} = require('../utils/emailService');

// Send welcome email to a new user
const sendWelcome = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Only admin or the user themselves can trigger this
    if (req.user.role !== 'admin' && requestingUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to send welcome email' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await sendWelcomeEmail(user.email, user.name);
    
    res.status(200).json({
      message: 'Welcome email sent successfully',
      result
    });
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({ message: 'Server error while sending welcome email', error: error.message });
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const requestingUserId = req.user.id;

    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin or the order owner can trigger this
    if (req.user.role !== 'admin' && order.userId._id.toString() !== requestingUserId) {
      return res.status(403).json({ message: 'Unauthorized to send order confirmation' });
    }

    const result = await sendOrderConfirmation(order.userId.email, order.userId.name, order);
    
    res.status(200).json({
      message: 'Order confirmation email sent successfully',
      result
    });
  } catch (error) {
    console.error('Send order confirmation email error:', error);
    res.status(500).json({ message: 'Server error while sending order confirmation email', error: error.message });
  }
};

// Trigger shipping notification
const sendShippingNotificationEmail = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Only admin can trigger this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await sendShippingNotification(order.userId.email, order.userId.name, order);
    
    res.status(200).json({
      message: 'Shipping notification email sent successfully',
      result
    });
  } catch (error) {
    console.error('Send shipping notification email error:', error);
    res.status(500).json({ message: 'Server error while sending shipping notification email', error: error.message });
  }
};

// Trigger delivery notification
const sendDeliveryNotificationEmail = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Only admin can trigger this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await sendDeliveryNotification(order.userId.email, order.userId.name, order);
    
    res.status(200).json({
      message: 'Delivery notification email sent successfully',
      result
    });
  } catch (error) {
    console.error('Send delivery notification email error:', error);
    res.status(500).json({ message: 'Server error while sending delivery notification email', error: error.message });
  }
};

// Send password reset email (this would typically be called internally, not via API)
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ message: 'If email exists, reset link will be sent' });
    }

    // In a real app, you'd generate a reset token and save it
    // For now, we'll just simulate sending the email
    const resetToken = 'dummy-token'; // This would be a real token in production
    
    const result = await sendPasswordReset(user.email, resetToken);
    
    res.status(200).json({
      message: 'Password reset email sent if user exists',
      result
    });
  } catch (error) {
    console.error('Send password reset email error:', error);
    res.status(500).json({ message: 'Server error while sending password reset email', error: error.message });
  }
};

// Send wishlist notification
const sendWishlistNotificationEmail = async (req, res) => {
  try {
    const { productId } = req.params;

    // Only admin can trigger this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find all users who have this product in their wishlist
    const wishlists = await Wishlist.find({ products: productId }).populate('userId');
    
    // Send notification to all users who have this product in their wishlist
    const results = [];
    for (const wishlist of wishlists) {
      const result = await sendWishlistNotification(
        wishlist.userId.email, 
        wishlist.userId.name, 
        product
      );
      results.push(result);
    }
    
    res.status(200).json({
      message: `Wishlist notification emails sent to ${results.length} users`,
      results
    });
  } catch (error) {
    console.error('Send wishlist notification email error:', error);
    res.status(500).json({ message: 'Server error while sending wishlist notification emails', error: error.message });
  }
};

// Send custom email notification
const sendCustomEmail = async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;

    // Only admin can send custom emails
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Validate inputs
    if (!recipient || !subject || !message) {
      return res.status(400).json({ message: 'Recipient, subject, and message are required' });
    }

    // For security, we'll only allow emails to registered users
    const user = await User.findOne({ email: recipient });
    if (!user) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const transporter = require('nodemailer').createTransporter({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || 'your-fake-email@ethereal.email',
        pass: process.env.SMTP_PASS || 'your-fake-password'
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"QuickCart" <noreply@quickcart.com>',
      to: recipient,
      subject: subject,
      html: message
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      message: 'Custom email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Send custom email error:', error);
    res.status(500).json({ message: 'Server error while sending custom email', error: error.message });
  }
};

module.exports = {
  sendWelcome,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendDeliveryNotificationEmail,
  sendPasswordResetEmail,
  sendWishlistNotificationEmail,
  sendCustomEmail
};