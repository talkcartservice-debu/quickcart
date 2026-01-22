'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import apiService from '@/services/api';

const PaymentComponent = ({ orderTotal, onPaymentSuccess, onCancel, orderId }) => {
  const { userData } = useAppContext();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await apiService.getPaymentMethods();
        setPaymentMethods(response.methods || []);
        if (response.methods && response.methods.length > 0) {
          setSelectedMethod(response.methods[0].id);
        }
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        setError('Failed to load payment methods');
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!orderId) {
      setError('Order ID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentData = {
        amount: orderTotal,
        currency: 'USD',
        paymentMethod: selectedMethod,
        orderId: orderId,
        email: userData?.email || ''
      };

      const response = await apiService.createPaymentIntent(paymentData);
      
      if (response.success) {
        // Handle Paystack redirect
        if (selectedMethod === 'paystack' && response.authorizationUrl) {
          // Redirect to Paystack payment page
          window.location.href = response.authorizationUrl;
        } else {
          // Handle other payment methods
          onPaymentSuccess(response);
        }
      } else {
        setError(response.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.message || 'Payment processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center p-3 border rounded-lg cursor-pointer ${
              selectedMethod === method.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === method.id}
              onChange={() => setSelectedMethod(method.id)}
              className="mr-3"
            />
            <span className="font-medium">{method.name}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-gray-900">${orderTotal.toFixed(2)}</div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full mt-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing Payment...' : `Pay $${orderTotal.toFixed(2)} with ${paymentMethods.find(m => m.id === selectedMethod)?.name || 'Selected Method'}`}
      </button>
    </div>
  );
};

export default PaymentComponent;