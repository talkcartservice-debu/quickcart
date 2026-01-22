const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    type: addressSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Order Placed'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'paystack', 'mobile_money', 'card'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  refundId: {
    type: String,
    default: null
  },
  trackingNumber: {
    type: String,
    default: null
  },
  trackingStatus: {
    type: String,
    enum: ['processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered', 'returned', 'cancelled'],
    default: 'processing'
  },
  trackingHistory: [{
    status: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);