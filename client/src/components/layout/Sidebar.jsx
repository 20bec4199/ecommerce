import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ 
  sidebarCollapsed, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  activeTab, 
  setActiveTab,
  user 
}) => {
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'cart', label: 'Shopping Cart', icon: '🛒' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:fixed inset-y-0 left-0 z-50
        transform transition-all duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        flex flex-col h-screen
      `}>
        {/* Sidebar Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3 text-lg font-bold text-gray-900 dark:text-white transition-opacity duration-300">
                Blissora
              </span>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border-2 border-purple-100 dark:border-purple-900"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-purple-100 dark:border-purple-900 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name?.split(' ')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email?.split('@')[0]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800 shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <span className="font-medium text-sm transition-all duration-300">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle and Collapse Button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="text-lg">
              {isDark ? '🌙' : '☀️'}
            </span>
            {!sidebarCollapsed && (
              <span className="font-medium text-sm">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
            )}
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="text-lg transition-transform duration-300">
              {sidebarCollapsed ? '➡️' : '⬅️'}
            </span>
            {!sidebarCollapsed && (
              <span className="font-medium text-sm">
                Collapse Menu
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;