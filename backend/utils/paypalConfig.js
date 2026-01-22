const axios = require('axios');

class PayPalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.mode = process.env.PAYPAL_MODE || 'sandbox'; // default to sandbox
    this.baseUrl = this.mode === 'sandbox' 
      ? 'https://api.sandbox.paypal.com' 
      : 'https://api.paypal.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token usually expires in 9 hours, but we'll set it to 8 hours to be safe
      this.tokenExpiry = Date.now() + (8 * 60 * 60 * 1000); // 8 hours in milliseconds
      
      return this.accessToken;
    } catch (error) {
      console.error('PayPal token error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPayment(amount, currency = 'USD', orderId, description = '', returnUrl, cancelUrl) {
    try {
      const accessToken = await this.getAccessToken();

      const paymentData = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: returnUrl || `${process.env.FRONTEND_URL}/payment-success`,
          cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment-cancel`
        },
        transactions: [{
          item_list: {
            items: [{
              name: 'QuickCart Order',
              sku: orderId,
              price: amount.toFixed(2),
              currency: currency,
              quantity: 1
            }]
          },
          amount: {
            total: amount.toFixed(2),
            currency: currency
          },
          description: description || `Payment for order ${orderId}`
        }]
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/payments/payment`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.id) {
        const approvalUrl = response.data.links.find(link => link.rel === 'approval_url')?.href;
        return {
          success: true,
          transactionId: response.data.id,
          authorizationUrl: approvalUrl,
          status: 'created',
          amount: parseFloat(response.data.transactions[0].amount.total),
          paymentToken: response.data.token
        };
      } else {
        return {
          success: false,
          message: 'Failed to create PayPal payment'
        };
      }
    } catch (error) {
      console.error('PayPal create payment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'PayPal payment creation failed'
      };
    }
  }

  async executePayment(paymentId, payerId) {
    try {
      const accessToken = await this.getAccessToken();

      const paymentExecution = {
        payer_id: payerId
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/payments/payment/${paymentId}/execute`,
        paymentExecution,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.state === 'approved') {
        return {
          success: true,
          transactionId: response.data.id,
          status: 'completed',
          amount: parseFloat(response.data.transactions[0].amount.total),
          payerId: response.data.payer.payer_info.payer_id
        };
      } else {
        return {
          success: false,
          message: 'Payment execution failed'
        };
      }
    } catch (error) {
      console.error('PayPal execute payment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'PayPal payment execution failed'
      };
    }
  }

  async refundPayment(transactionId, refundAmount = null, reason = '') {
    try {
      const accessToken = await this.getAccessToken();

      const refundData = {};
      if (refundAmount) {
        refundData.amount = {
          total: refundAmount.toFixed(2),
          currency: 'USD' // You can modify this to accept currency as parameter
        };
      }
      if (reason) {
        refundData.note_to_payer = reason;
      }

      const response = await axios.post(
        `${this.baseUrl}/v1/payments/sale/${transactionId}/refund`,
        refundData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.id) {
        return {
          success: true,
          refundId: response.data.id,
          status: response.data.state,
          amount_refunded: parseFloat(response.data.amount.total)
        };
      } else {
        return {
          success: false,
          message: 'Failed to process PayPal refund'
        };
      }
    } catch (error) {
      console.error('PayPal refund error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'PayPal refund failed'
      };
    }
  }

  async verifyPayment(paymentId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/v1/payments/payment/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.state === 'approved',
        paymentId: response.data.id,
        state: response.data.state,
        transactions: response.data.transactions,
        payer: response.data.payer
      };
    } catch (error) {
      console.error('PayPal verify payment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'PayPal payment verification failed'
      };
    }
  }
}

module.exports = new PayPalService();