const Order = require('../models/Order');
const Product = require('../models/Product');
const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const PayPalService = require('../utils/paypalConfig');
require('dotenv').config();

// Real payment processors with actual API integrations
const paymentProcessors = {
  paypal: {
    processPayment: async (paymentData) => {
      try {
        const result = await PayPalService.createPayment(
          paymentData.amount,
          paymentData.currency || 'USD',
          paymentData.orderId,
          `Payment for order ${paymentData.orderId}`,
          `${process.env.FRONTEND_URL}/payment-success`,
          `${process.env.FRONTEND_URL}/payment-cancel`
        );
        return result;
      } catch (error) {
        console.error('PayPal payment error:', error);
        return {
          success: false,
          message: error.message || 'PayPal payment processing failed'
        };
      }
    },
    
    executePayment: async (paymentId, payerId) => {
      try {
        const result = await PayPalService.executePayment(paymentId, payerId);
        return result;
      } catch (error) {
        console.error('PayPal execution error:', error);
        return {
          success: false,
          message: error.message || 'PayPal payment execution failed'
        };
      }
    },
    
    verifyPayment: async (paymentId) => {
      try {
        const result = await PayPalService.verifyPayment(paymentId);
        return result;
      } catch (error) {
        console.error('PayPal verification error:', error);
        return {
          success: false,
          message: error.message || 'PayPal payment verification failed'
        };
      }
    },
    
    refundPayment: async (transactionId, refundAmount = null, reason = '') => {
      try {
        const result = await PayPalService.refundPayment(transactionId, refundAmount, reason);
        return result;
      } catch (error) {
        console.error('PayPal refund error:', error);
        return {
          success: false,
          message: error.message || 'PayPal refund failed'
        };
      }
    }
  },
  
  paystack: {
    processPayment: async (paymentData) => {
      try {
        // Create Paystack transaction
        const transaction = await Paystack.transaction.initialize({
          amount: paymentData.amount * 100, // Paystack expects amount in kobo (cents)
          email: paymentData.email || 'customer@example.com',
          metadata: {
            orderId: paymentData.orderId,
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: paymentData.orderId
              }
            ]
          }
        });

        if (transaction.status && transaction.data) {
          return {
            success: true,
            transactionId: transaction.data.reference,
            authorizationUrl: transaction.data.authorization_url,
            accessCode: transaction.data.access_code,
            status: 'initialized',
            amount: paymentData.amount
          };
        } else {
          return {
            success: false,
            message: transaction.message || 'Failed to initialize Paystack transaction'
          };
        }
      } catch (error) {
        console.error('Paystack payment error:', error);
        return {
          success: false,
          message: error.message || 'Payment processing failed'
        };
      }
    },
    verifyPayment: async (reference) => {
      try {
        const verification = await Paystack.transaction.verify(reference);
        
        if (verification.status && verification.data) {
          return {
            success: verification.data.status === 'success',
            transactionId: verification.data.reference,
            amount: verification.data.amount / 100, // Convert from kobo to main currency
            status: verification.data.status,
            customerEmail: verification.data.customer.email,
            gatewayResponse: verification.data.gateway_response
          };
        } else {
          return {
            success: false,
            message: verification.message || 'Failed to verify transaction'
          };
        }
      } catch (error) {
        console.error('Paystack verification error:', error);
        return {
          success: false,
          message: error.message || 'Transaction verification failed'
        };
      }
    }
  },
  mobileMoney: {
    processPayment: async (paymentData) => {
      try {
        // Create Paystack transaction with mobile money channel
        const transaction = await Paystack.transaction.initialize({
          amount: paymentData.amount * 100, // Paystack expects amount in kobo (cents)
          email: paymentData.email || 'customer@example.com',
          channels: ['mobile_money'], // Specify mobile money as the payment channel
          metadata: {
            orderId: paymentData.orderId,
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: paymentData.orderId
              }
            ]
          }
        });

        if (transaction.status && transaction.data) {
          return {
            success: true,
            transactionId: transaction.data.reference,
            authorizationUrl: transaction.data.authorization_url,
            accessCode: transaction.data.access_code,
            status: 'initialized',
            amount: paymentData.amount
          };
        } else {
          return {
            success: false,
            message: transaction.message || 'Failed to initialize mobile money transaction'
          };
        }
      } catch (error) {
        console.error('Mobile money payment error:', error);
        return {
          success: false,
          message: error.message || 'Mobile money payment processing failed'
        };
      }
    }
  },
  card: {
    processPayment: async (paymentData) => {
      try {
        // Create Paystack transaction with card channel
        const transaction = await Paystack.transaction.initialize({
          amount: paymentData.amount * 100, // Paystack expects amount in kobo (cents)
          email: paymentData.email || 'customer@example.com',
          channels: ['card'], // Specify card as the payment channel
          metadata: {
            orderId: paymentData.orderId,
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: paymentData.orderId
              }
            ]
          }
        });

        if (transaction.status && transaction.data) {
          return {
            success: true,
            transactionId: transaction.data.reference,
            authorizationUrl: transaction.data.authorization_url,
            accessCode: transaction.data.access_code,
            status: 'initialized',
            amount: paymentData.amount
          };
        } else {
          return {
            success: false,
            message: transaction.message || 'Failed to initialize card transaction'
          };
        }
      } catch (error) {
        console.error('Card payment error:', error);
        return {
          success: false,
          message: error.message || 'Card payment processing failed'
        };
      }
    }
  }
};

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, paymentMethod, orderId, email } = req.body;
    const userId = req.user.id;

    // Verify order belongs to user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order with payment information
    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'pending';
    await order.save();

    // Return payment intent based on method
    let paymentResult;
    if (paymentProcessors[paymentMethod]) {
      paymentResult = await paymentProcessors[paymentMethod].processPayment({
        amount,
        currency,
        orderId,
        email: email || order.userId?.email // Use email from request or user's email
      });
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    if (paymentResult.success) {
      // For Paystack, Mobile Money, Card, and PayPal payments, we return the authorization URL instead of immediately completing
      if (paymentMethod === 'paystack' || paymentMethod === 'mobile_money' || paymentMethod === 'card' || paymentMethod === 'paypal') {
        // Store the pending transaction info
        order.paymentStatus = 'pending';
        order.transactionId = paymentResult.transactionId;
        await order.save();

        res.status(200).json({
          success: true,
          message: 'Payment initialized successfully',
          transactionId: paymentResult.transactionId,
          authorizationUrl: paymentResult.authorizationUrl,
          accessCode: paymentResult.accessCode, // May be undefined for PayPal
          order: order
        });
      } else {
        // For other payment methods, complete immediately
        order.paymentStatus = 'completed';
        order.transactionId = paymentResult.transactionId;
        await order.save();

        res.status(200).json({
          success: true,
          message: 'Payment processed successfully',
          transactionId: paymentResult.transactionId,
          order: order
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: paymentResult.message || 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: 'Server error during payment processing', error: error.message });
  }
};

// Handle payment webhook
const handleWebhook = async (req, res) => {
  try {
    const { provider, payload } = req.body;
    
    // Process webhook based on provider
    switch(provider) {
      case 'paypal':
        // Handle PayPal webhook
        console.log('Processing PayPal webhook:', payload);
        break;
      case 'paystack':
        // Handle Paystack webhook
        console.log('Processing Paystack webhook:', payload);
        break;
      case 'mobile_money':
        // Handle Mobile Money webhook
        console.log('Processing Mobile Money webhook:', payload);
        break;
      default:
        return res.status(400).json({ message: 'Unknown provider' });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    const userId = req.user.id;

    // Find order by transaction ID
    const order = await Order.findOne({ transactionId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Process refund based on original payment method
    let refundResult;
    if (order.paymentMethod === 'paypal') {
      // Process PayPal refund
      refundResult = await paymentProcessors.paypal.refundPayment(order.transactionId);
    } else if (order.paymentMethod === 'paystack' || order.paymentMethod === 'card') {
      // Simulate Paystack/card refund
      refundResult = { success: true, refundId: `refund_${Date.now()}` };
    } else if (order.paymentMethod === 'mobile_money') {
      // Simulate Mobile Money refund
      refundResult = { success: true, refundId: `refund_${Date.now()}` };
    } else {
      return res.status(400).json({ message: 'Unsupported payment method for refund' });
    }

    if (refundResult.success) {
      // Update order status
      order.paymentStatus = 'refunded';
      order.refundId = refundResult.refundId;
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        refundId: refundResult.refundId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund failed'
      });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error during refund processing', error: error.message });
  }
};

// Execute PayPal payment
const executePayPalPayment = async (req, res) => {
  try {
    const { paymentId, payerId } = req.body;
    
    if (!paymentId || !payerId) {
      return res.status(400).json({ message: 'Payment ID and Payer ID are required' });
    }
    
    const executionResult = await paymentProcessors.paypal.executePayment(paymentId, payerId);
    
    if (executionResult.success) {
      // Find and update the order
      const order = await Order.findOne({ transactionId: paymentId });
      
      if (order) {
        order.paymentStatus = 'completed';
        order.transactionId = paymentId;
        await order.save();
        
        res.status(200).json({
          success: true,
          message: 'PayPal payment executed successfully',
          transaction: executionResult,
          order: order
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found for this transaction'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: executionResult.message || 'PayPal payment execution failed'
      });
    }
  } catch (error) {
    console.error('PayPal execution error:', error);
    res.status(500).json({ message: 'Server error during PayPal payment execution', error: error.message });
  }
};

// Verify Paystack payment
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ message: 'Reference is required' });
    }
    
    const verificationResult = await paymentProcessors.paystack.verifyPayment(reference);
    
    if (verificationResult.success) {
      // Find the order by transaction reference
      const order = await Order.findOne({ transactionId: reference });
      
      if (order) {
        // Update order status to completed
        order.paymentStatus = 'completed';
        order.transactionId = reference;
        await order.save();
        
        res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          transaction: verificationResult,
          order: order
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found for this transaction',
          transaction: verificationResult
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: verificationResult.message || 'Payment verification failed',
        error: verificationResult.message
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error during payment verification', error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  refundPayment,
  verifyPayment,
  executePayPalPayment
};