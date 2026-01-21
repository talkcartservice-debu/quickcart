'use client'
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import apiService from '@/services/api';

const Account = () => {
  const { userData, fetchUserData, loading } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || ''
      });
    }
  }, [userData]);

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      const updateUserData = async () => {
        try {
          // In a real implementation, you would call an API to update user data
          // For now, we'll just refetch the user data
          await fetchUserData();
          setEditMode(false);
        } catch (error) {
          console.error('Failed to update user data:', error);
        }
      };
      updateUserData();
    } else {
      setEditMode(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // In a real implementation, you would call an API to update user data
      // For now, just toggle edit mode
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
          <div className="mb-6">
            <Image src={assets.user_icon} alt="User Icon" width={64} height={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access your account</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition duration-300"
          >
            Go to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 px-6 md:px-16 lg:px-32 py-8">
        {/* Sidebar */}
        <div className="md:w-1/4 mb-8 md:mb-0 md:pr-8">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <div className="ml-4">
                <h3 className="font-bold text-lg">{userData.name}</h3>
                <p className="text-gray-600 text-sm">{userData.email}</p>
                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${userData.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                  {userData.role === 'seller' ? 'Seller' : 'Customer'}
                </span>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${activeTab === 'profile' ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <span>User Profile</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${activeTab === 'orders' ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <span>My Orders</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${activeTab === 'addresses' ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <span>My Addresses</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      apiService.logout();
                      window.location.reload();
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition duration-200"
                  >
                    <div className="flex items-center">
                      <span>Logout</span>
                    </div>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-xl shadow-md p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h2>
                
                {editMode ? (
                  <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <p className="text-gray-900">{userData.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <p className="text-gray-900">{userData.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <p className={`inline-block px-3 py-1 rounded-full text-sm ${userData.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                          {userData.role === 'seller' ? 'Seller' : 'Customer'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <p className="text-gray-900">{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleEditToggle}
                        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
                <p className="text-gray-600 mb-4">You can view your order history on the <a href="/my-orders" className="text-orange-500 hover:underline">My Orders</a> page.</p>
                <button 
                  onClick={() => window.location.href = '/my-orders'}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                >
                  View Orders
                </button>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">My Addresses</h2>
                <p className="text-gray-600 mb-4">You can manage your addresses on the <a href="/cart" className="text-orange-500 hover:underline">Cart</a> page when adding a new address.</p>
                <button 
                  onClick={() => window.location.href = '/add-address'}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                >
                  Manage Addresses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;