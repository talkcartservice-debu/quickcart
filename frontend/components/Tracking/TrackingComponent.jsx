'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import apiService from '@/services/api';

const TrackingComponent = ({ orderId, trackingNumber }) => {
  const { userData } = useAppContext();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrackingInfo();
  }, [orderId, trackingNumber]);

  const fetchTrackingInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (trackingNumber) {
        // Public tracking by tracking number
        response = await apiService.getOrderByTrackingNumber(trackingNumber);
      } else if (orderId) {
        // User-specific tracking by order ID
        response = await apiService.getOrderTracking(orderId);
      } else {
        throw new Error('Either orderId or trackingNumber is required');
      }
      
      setTrackingInfo(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch tracking information');
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="text-center py-10 text-gray-500">
        No tracking information available
      </div>
    );
  }

  // Status badge styling
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'in-transit':
      case 'out-for-delivery':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'returned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Order Tracking</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-medium">{trackingInfo.orderId}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Tracking Number:</span>
          <span className="font-medium">{trackingInfo.trackingNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(trackingInfo.status)}`}>
            {trackingInfo.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Order Placed</span>
          <span>Processing</span>
          <span>Shipped</span>
          <span>In Transit</span>
          <span>Delivered</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute h-full bg-orange-500 rounded-full"
            style={{ 
              width: trackingInfo.status === 'delivered' ? '100%' :
                     trackingInfo.status === 'out-for-delivery' ? '80%' :
                     trackingInfo.status === 'in-transit' ? '60%' :
                     trackingInfo.status === 'shipped' ? '40%' :
                     trackingInfo.status === 'processing' ? '20%' : '10%'
            }}
          ></div>
        </div>
      </div>

      {/* Tracking History */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-800 mb-3">Tracking History</h4>
        <div className="space-y-4">
          {trackingInfo.history && trackingInfo.history.length > 0 ? (
            trackingInfo.history.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-3 h-3 rounded-full ${index === trackingInfo.history.length - 1 ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                  {index < trackingInfo.history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="font-medium">{event.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                  <div className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</div>
                  {event.location && (
                    <div className="text-sm text-gray-600">Location: {event.location}</div>
                  )}
                  {event.details && (
                    <div className="text-sm text-gray-700 mt-1">{event.details}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No tracking events yet.</p>
          )}
        </div>
      </div>

      {/* Estimated Delivery */}
      {trackingInfo.estimatedDelivery && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="font-medium text-blue-800">Estimated Delivery</div>
          <div className="text-blue-700">{new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}</div>
        </div>
      )}
    </div>
  );
};

export default TrackingComponent;