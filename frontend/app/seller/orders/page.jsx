'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import apiService from "@/services/api";

const STATUS_OPTIONS = ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUS_OPTIONS = ['pending', 'completed', 'failed', 'refunded'];

const statusColor = (s) => {
  if (s === 'Delivered') return 'text-green-600 bg-green-50';
  if (s === 'Cancelled') return 'text-red-600 bg-red-50';
  if (s === 'Shipped') return 'text-blue-600 bg-blue-50';
  if (s === 'Processing') return 'text-yellow-600 bg-yellow-50';
  return 'text-gray-600 bg-gray-100';
};

const paymentStatusColor = (s) => {
  if (s === 'completed') return 'text-green-600';
  if (s === 'failed' || s === 'refunded') return 'text-red-600';
  return 'text-yellow-600';
};

const Orders = () => {
  const { currency } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await apiService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, field, value) => {
    setUpdatingId(orderId);
    try {
      const payload = field === 'status'
        ? { status: value }
        : { paymentStatus: value };
      const updated = await apiService.updateOrderStatus(orderId, payload.status, payload.paymentStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...updated } : o));
    } catch (error) {
      alert(error.message || 'Failed to update order.');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between text-sm">
      {loading ? <Loading /> : (
        <div className="md:p-10 p-4 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              All Orders <span className="text-gray-400 font-normal">({orders.length})</span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="max-w-5xl space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-5 justify-between">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 bg-orange-50 rounded-lg p-2 h-fit">
                        <Image src={assets.box_icon} alt="order" className="w-10 h-10" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {order.items.map(item =>
                            `${item.product?.name || 'Product'} x${item.quantity}`
                          ).join(', ')}
                        </p>
                        <p className="text-gray-500 mt-1 text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt || order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 min-w-36">
                      <p className="font-medium">{order.address?.fullName}</p>
                      <p className="text-gray-500">{order.address?.area}</p>
                      <p className="text-gray-500">{order.address?.city}, {order.address?.state}</p>
                      <p className="text-gray-500">{order.address?.phoneNumber}</p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-40">
                      <p className="font-bold text-gray-900 text-base">{currency}{order.amount?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        Method: <span className="font-medium text-gray-700 capitalize">{order.paymentMethod || 'N/A'}</span>
                      </p>
                      <p className={`text-xs font-semibold capitalize ${paymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus || 'pending'}
                      </p>
                      {order.userId && (
                        <p className="text-xs text-gray-400">
                          Customer: {order.userId.name || order.userId.email || ''}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-44">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Order Status</label>
                        <select
                          value={order.status || 'Order Placed'}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, 'status', e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                          {order.status || 'Order Placed'}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Payment Status</label>
                        <select
                          value={order.paymentStatus || 'pending'}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, 'paymentStatus', e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 capitalize"
                        >
                          {PAYMENT_STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Orders;
