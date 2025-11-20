import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';
import Button from './ui/Button';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <p className="text-gray-900 dark:text-white">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <p className="text-gray-900 dark:text-white">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
                      <p className="text-gray-900 dark:text-white">{user?.googleId ? 'Google Account' : 'Email Account'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Since</label>
                      <p className="text-gray-900 dark:text-white">January 2024</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                      <Button variant="ghost" size="sm">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">SMS Notifications</span>
                      <Button variant="ghost" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="lg:col-span-1">
              <div className="text-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-32 h-32 rounded-full mx-auto border-4 border-purple-100 dark:border-purple-900"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto border-4 border-purple-100 dark:border-purple-900 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <Button variant="ghost" className="mt-4">
                  Change Photo
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;