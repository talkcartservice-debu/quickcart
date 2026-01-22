'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PaymentComponent from '@/components/Payment/PaymentComponent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import apiService from '@/services/api';

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getCartAmount } = useAppContext();
  const orderId = searchParams.get('orderId');
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      router.push('/cart');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        // In a real implementation, we would fetch order details
        // For now, we'll calculate based on cart
        const totalAmount = getCartAmount();
        setOrderDetails({
          _id: orderId,
          amount: totalAmount + Math.floor(totalAmount * 0.02), // Adding tax
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router, getCartAmount]);

  const handlePaymentSuccess = (paymentResponse) => {
    // Payment successful, redirect to order confirmation
    router.push('/order-placed');
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
          <div className="mb-6">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/cart')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition duration-300"
          >
            Return to Cart
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 px-6 md:px-16 lg:px-32 py-8">
        <div className="max-w-4xl w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your purchase with a secure payment</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(orderDetails.amount - Math.floor(orderDetails.amount * 0.02)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${Math.floor(orderDetails.amount * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${orderDetails.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Information</h3>
                <p className="text-gray-600">Your order will be delivered to the address you selected in the previous step.</p>
              </div>
            </div>
            
            <div>
              <PaymentComponent 
                orderTotal={orderDetails.amount}
                orderId={orderId}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;