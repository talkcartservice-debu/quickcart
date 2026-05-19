'use client';
import React, { useEffect, useState } from "react";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import apiService from "@/services/api";

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4`}>
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const loadData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAllUsers()
      ]);
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      const updated = await apiService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: updated.role } : u));
    } catch (error) {
      alert(error.message || 'Failed to update role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    setDeletingUserId(userId);
    try {
      await apiService.adminDeleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      alert(error.message || 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const roleColor = (r) => {
    if (r === 'admin') return 'text-orange-700 bg-orange-50';
    if (r === 'seller') return 'text-blue-700 bg-blue-50';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between text-sm">
      {loading ? <Loading /> : (
        <div className="md:p-10 p-4 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">QuickCart Electronics — store overview</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats?.totalUsers} icon="👥" color="text-blue-500" />
            <StatCard label="Products Listed" value={stats?.totalProducts} icon="📱" color="text-green-500" />
            <StatCard label="Total Orders" value={stats?.totalOrders} icon="📦" color="text-orange-500" />
            <StatCard
              label="Total Revenue"
              value={stats?.totalRevenue != null ? `$${stats.totalRevenue.toFixed(2)}` : '—'}
              icon="💰"
              color="text-purple-500"
            />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              User Management <span className="text-gray-400 font-normal">({users.length})</span>
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Role</th>
                      <th className="text-left px-4 py-3 font-medium">Joined</th>
                      <th className="text-left px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                        <td className="px-4 py-3 text-gray-500">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              disabled={updatingUserId === user._id}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                            >
                              <option value="customer">customer</option>
                              <option value="admin">admin</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              disabled={deletingUserId === user._id}
                              className="px-2 py-1.5 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition disabled:opacity-50"
                            >
                              {deletingUserId === user._id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No users found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
