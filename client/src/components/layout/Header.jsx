// components/Layout/Header.jsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const Header = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Menu Button and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                Blissora
              </h1>
            </div>
          </div>

          {/* Right Section - Theme Toggle and User Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Profile and Logout */}
            <div className="flex items-center space-x-3">
              {/* User Info - Hidden on mobile, visible on sm and up */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <img
                  src={user?.avatar || '/default-avatar.png'}
                  alt="Profile"
                  className="w-6 h-6 rounded-full border border-purple-500 dark:border-purple-400"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-24">
                  {user?.name || 'User'}
                </span>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                disabled={loading}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden xs:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;