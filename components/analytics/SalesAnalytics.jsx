import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import apiService from '../../frontend/services/api';

const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchSalesData();
  }, [period, customDateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const params = { period };
      
      if (customDateRange.startDate && customDateRange.endDate) {
        params.startDate = customDateRange.startDate;
        params.endDate = customDateRange.endDate;
      }
      
      const data = await apiService.getSalesAnalytics(params);
      setSalesData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="text-center py-8">
        <p>No sales data available.</p>
      </div>
    );
  }

  // Prepare data for charts
  const revenueByDayData = Object.entries(salesData.revenueByDay || {}).map(([date, revenue]) => ({
    date,
    revenue: parseFloat(revenue.toFixed(2))
  }));

  const ordersByStatusData = Object.entries(salesData.ordersByStatus || {}).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Sales Analytics</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {period === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${salesData.totalRevenue?.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{salesData.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-600">Average Order Value</h3>
          <p className="text-3xl font-bold text-gray-900">${salesData.averageOrderValue?.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Revenue Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Orders by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ordersByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Sales Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Metric</th>
                <th className="py-2 px-4 border-b">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Period</td>
                <td className="py-2 px-4 border-b">{salesData.period}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Start Date</td>
                <td className="py-2 px-4 border-b">{salesData.dateRange?.startDate ? new Date(salesData.dateRange.startDate).toLocaleDateString() : 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">End Date</td>
                <td className="py-2 px-4 border-b">{salesData.dateRange?.endDate ? new Date(salesData.dateRange.endDate).toLocaleDateString() : 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Total Revenue</td>
                <td className="py-2 px-4 border-b">${salesData.totalRevenue?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Total Orders</td>
                <td className="py-2 px-4 border-b">{salesData.totalOrders}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Average Order Value</td>
                <td className="py-2 px-4 border-b">${salesData.averageOrderValue?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;