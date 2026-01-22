const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For production, you'd use proper SMTP settings
  // For development, we'll use ethereal.email (fake SMTP)
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-fake-email@ethereal.email',
      pass: process.env.SMTP_PASS || 'your-fake-password'
    }
  });
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"QuickCart" <noreply@quickcart.com>',
    to: userEmail,
    subject: 'Welcome to QuickCart!',
    html: `
      <h2>Welcome to QuickCart, ${userName}!</h2>
      <p>We're excited to have you join our community of shoppers.</p>
      <p>Start exploring our wide range of products today.</p>
      <br>
      <p>Best regards,<br>The QuickCart Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (userEmail, userName, order) => {
  const transporter = createTransporter();
  
  // Calculate total items and amount
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.amount;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"QuickCart" <noreply@quickcart.com>',
    to: userEmail,
    subject: `Order Confirmation #${order._id}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Dear ${userName},</p>
      <p>Your order has been successfully placed!</p>
      <br>
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Total Items:</strong> ${totalItems}</p>
      <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
      <br>
      <h3>Shipping Address:</h3>
      <p>${order.address.fullName}</p>
      <p>${order.address.area}</p>
      <p>${order.address.city}, ${order.address.state} ${order.address.pincode}</p>
      <p>${order.address.phoneNumber}</p>
      <br>
      <p>You can track your order status in your account dashboard.</p>
      <br>
      <p>Thank you for shopping with us!<br>The QuickCart Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send shipping notification
const sendShippingNotification = async (userEmail, userName, order) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"QuickCart" <noreply@quickcart.com>',
    to: userEmail,
    subject: `Your Order Has Been Shipped - #${order._id}`,
    html: `
      <h2>Your Order Has Been Shipped!</h2>
      <p>Dear ${userName},</p>
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      <br>
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Not available yet'}</p>
      <p><strong>Shipped Date:</strong> ${new Date().toLocaleString()}</p>
      <br>
      <p>You can track your shipment using the tracking number in your account dashboard.</p>
      <br>
      <p>Thank you for choosing QuickCart!<br>The QuickCart Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Shipping notification email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending shipping notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send delivery notification
const sendDeliveryNotification = async (userEmail, userName, order) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"QuickCart" <noreply@quickcart.com>',
    to: userEmail,
    subject: `Order Delivered - #${order._id}`,
    html: `
      <h2>Your Order Has Been Delivered!</h2>
      <p>Dear ${userName},</p>
      <p>Your order has been successfully delivered. Thank you for shopping with QuickCart!</p>
      <br>
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Delivered Date:</strong> ${new Date().toLocaleString()}</p>
      <br>
      <p>If you have any questions about your order, please contact our customer support.</p>
      <br>
      <p>We hope to serve you again soon!<br>The QuickCart Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Delivery notification email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending delivery notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordReset = async (userEmail, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"QuickCart" <noreply@quickcart.com>',
    to: userEmail,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <br>
      <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <br><br>
      <p>If you didn't request this, please ignore this email.</p>
      <p>The link expires in 1 hour.</p>
      <br>
      <p>The QuickCart Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send wishlist notification
const sendWishlistNotification = async (userEmail, userName, product) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"QuickCart" <noreply@quickcart.com>',
    to: userEmail,
    subject: 'Product Price Drop Alert!',
    html: `
      <h2>Exciting News from Your Wishlist!</h2>
      <p>Dear ${userName},</p>
      <p>The price of a product in your wishlist has dropped!</p>
      <br>
      <h3>Product Details:</h3>
      <p><strong>Name:</strong> ${product.name}</p>
      <p><strong>Current Price:</strong> $${product.offerPrice}</p>
      <p><strong>Original Price:</strong> $${product.price || product.offerPrice}</p>
      <br>
      <p>Hurry up and grab it before the deal ends!</p>
      <br>
      <p>Happy shopping!<br>The QuickCart Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Wishlist notification email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending wishlist notification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendShippingNotification,
  sendDeliveryNotification,
  sendPasswordReset,
  sendWishlistNotification
};