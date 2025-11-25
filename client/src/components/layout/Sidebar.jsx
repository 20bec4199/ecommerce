import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const Sidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'products', label: 'Products', icon: '🛍️', path: '/dashboard/products' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/dashboard/profile' },
    { id: 'cart', label: 'Cart', icon: '🛒', path: '/dashboard/cart' },
    { id: 'orders', label: 'Orders', icon: '📦', path: '/dashboard/orders' },
  ];

  // Close only on mobile screens
  const handleNavigation = (path) => {
    navigate(path);

    // Auto close only for screens < 1024px (lg breakpoint)
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const getActiveItem = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find((item) => currentPath.startsWith(item.path));
    return activeItem?.id || 'products';
  };

  // If sidebar is closed, hide component (mobile)
  if (!isOpen && window.innerWidth < 1024) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">

          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Blissora</h2>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = getActiveItem() === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left 
                  transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-2'
                  }`}
                >
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>

                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Blissora E-commerce</p>
              <p className="mt-1">© 2024 All rights reserved</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
