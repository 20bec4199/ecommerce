// pages/ProfilePage.jsx - Enhanced Responsive Version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const { 
    state, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    addNotification, 
    updateProfile, 
    updatePassword, 
    fetchUserProfile 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    newsletter: true,
    notifications: true
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    isDefault: false
  });
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Initialize form with user data from AppContext
  useEffect(() => {
    if (user) {
      fetchUserProfile().catch(console.error);
    }
  }, [user]);

  // Update form when profile data loads
  useEffect(() => {
    const profileData = state.userProfile.profile || user;
    if (profileData) {
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || profileData.profile?.phone || '',
        dateOfBirth: profileData.dateOfBirth || profileData.profile?.dateOfBirth 
          ? new Date(profileData.dateOfBirth || profileData.profile.dateOfBirth).toISOString().split('T')[0] 
          : '',
        newsletter: profileData.preferences?.newsletter ?? true,
        notifications: profileData.preferences?.notifications ?? true
      });
    }
  }, [state.userProfile.profile, user]);

  // Form handlers
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const profileData = {
        name: profileForm.name,
        phone: profileForm.phone,
        dateOfBirth: profileForm.dateOfBirth,
        preferences: {
          newsletter: profileForm.newsletter,
          notifications: profileForm.notifications
        }
      };

      await updateProfile(profileData);
      setIsEditing(false);
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Profile update error:', error);
      addNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addNotification('New passwords do not match', 'error');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      addNotification('New password must be at least 6 characters', 'error');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      addNotification('Password updated successfully!', 'success');
    } catch (error) {
      console.error('Password update error:', error);
      addNotification('Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, addressForm);
        addNotification('Address updated successfully!', 'success');
      } else {
        await addAddress(addressForm);
        addNotification('Address added successfully!', 'success');
      }
      
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        type: 'home',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Address operation error:', error);
      addNotification('Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Address actions
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
    setActiveTab('addresses');
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
        addNotification('Address deleted successfully!', 'success');
      } catch (error) {
        console.error('Address deletion error:', error);
        addNotification('Failed to delete address', 'error');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const address = addresses.find(addr => addr._id === addressId);
      if (address) {
        await updateAddress(addressId, { ...address, isDefault: true });
        addNotification('Default address updated!', 'success');
      }
    } catch (error) {
      console.error('Set default address error:', error);
      addNotification('Failed to set default address', 'error');
    }
  };

  // Cancel actions
  const handleCancelEdit = () => {
    setIsEditing(false);
    const profileData = state.userProfile.profile || user;
    if (profileData) {
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || profileData.profile?.phone || '',
        dateOfBirth: profileData.dateOfBirth || profileData.profile?.dateOfBirth 
          ? new Date(profileData.dateOfBirth || profileData.profile.dateOfBirth).toISOString().split('T')[0] 
          : '',
        newsletter: profileData.preferences?.newsletter ?? true,
        notifications: profileData.preferences?.notifications ?? true
      });
    }
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({
      type: 'home',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      isDefault: false
    });
  };

  // Get addresses
  const addresses = state.addresses.list || [];
  const addressesLoading = state.addresses.loading;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your profile.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profileData = state.userProfile.profile || user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                Manage your personal information and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{profileData.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{profileData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {state.userProfile.loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full animate-spin border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-blue-700 dark:text-blue-300">Loading profile data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.userProfile.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-700 dark:text-red-300">{state.userProfile.error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 sticky top-6">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'security', label: 'Security', icon: '🔒' },
                  { id: 'addresses', label: 'Addresses', icon: '🏠' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Member since</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Addresses</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {addresses.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                      Update your personal details and preferences
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  // View Mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {profileData.name || 'Not provided'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">
                        Email
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{profileData.email}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">
                        Phone
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {profileData.phone || profileData.profile?.phone || 'Not provided'}
                      </p>
                    </div>
                    {(profileData.dateOfBirth || profileData.profile?.dateOfBirth) && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">
                          Date of Birth
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(profileData.dateOfBirth || profileData.profile.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${profileData.preferences?.newsletter ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">Newsletter</span>
                          <span className={`text-sm ${profileData.preferences?.newsletter ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {profileData.preferences?.newsletter ? 'Subscribed' : 'Not subscribed'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${profileData.preferences?.notifications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">Notifications</span>
                          <span className={`text-sm ${profileData.preferences?.notifications ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {profileData.preferences?.notifications ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <form onSubmit={handleProfileSubmit} className="space-y-6 lg:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileForm.dateOfBirth}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 lg:pt-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lg:mb-6">
                        Preferences
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <input
                            type="checkbox"
                            name="newsletter"
                            checked={profileForm.newsletter}
                            onChange={handleProfileChange}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Subscribe to newsletter
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Receive updates and promotions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <input
                            type="checkbox"
                            name="notifications"
                            checked={profileForm.notifications}
                            onChange={handleProfileChange}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Enable notifications
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Get important account alerts
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || state.userProfile.loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                <div className="mb-6 lg:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Change Password
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update your password to keep your account secure
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="max-w-2xl space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Enter new password"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                  >
                    {passwordLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Changing Password...</span>
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      My Addresses
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage your shipping and billing addresses
                    </p>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Address Loading State */}
                {addressesLoading && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading addresses...</p>
                  </div>
                )}

                {/* Address Error State */}
                {state.addresses.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-red-700 dark:text-red-300">{state.addresses.error}</p>
                    </div>
                  </div>
                )}

                {showAddressForm ? (
                  <form onSubmit={handleAddressSubmit} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 sm:p-6 mb-6 lg:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 lg:mb-6">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address Type
                        </label>
                        <select
                          name="type"
                          value={addressForm.type}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                        >
                          <option value="home">🏠 Home</option>
                          <option value="work">💼 Work</option>
                          <option value="other">📦 Other</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-600 rounded-xl border border-gray-200 dark:border-gray-500">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                        />
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Set as default address
                        </label>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={addressForm.street}
                          onChange={handleAddressChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                          placeholder="Enter street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={addressForm.country}
                          onChange={handleAddressChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                          placeholder="Enter country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={addressForm.zipCode}
                          onChange={handleAddressChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200"
                          placeholder="Enter ZIP code"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={handleCancelAddress}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          editingAddress ? 'Update Address' : 'Add Address'
                        )}
                      </button>
                    </div>
                  </form>
                ) : null}

                {/* Address List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {!addressesLoading && addresses.length > 0 ? (
                    addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border-2 rounded-2xl p-4 sm:p-6 transition-all duration-200 ${
                          address.isDefault
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            address.isDefault
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {address.type === 'home' && '🏠'}
                            {address.type === 'work' && '💼'}
                            {address.type === 'other' && '📦'}
                            <span className="ml-1">{address.type}</span>
                            {address.isDefault && (
                              <span className="ml-1">• Default</span>
                            )}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edit address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">
                          {address.street}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {address.country}
                        </p>
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address._id)}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Set as default</span>
                          </button>
                        )}
                      </div>
                    ))
                  ) : !addressesLoading ? (
                    <div className="col-span-2 text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No addresses yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        You haven't added any addresses yet. Add your first address to get started.
                      </p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;