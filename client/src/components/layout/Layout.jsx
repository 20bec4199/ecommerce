// components/Layout/Layout.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../hooks/useTheme';
import NotificationContainer from '../Notification/NotificationContainer'; // Add this import

// Import your page components
import Dashboard from '../../pages/Dashboard';
import ProductsPage from '../../pages/ProductsPage';
import ProfilePage from '../../pages/ProfilePage';
import CartPage from '../../pages/CartPage';
import OrdersPage from '../../pages/OrdersPage';
import CheckoutPage from '../../pages/CheckoutPage';
import OrderDetailsPage from '../../pages/OrderDetailsPage';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all duration-300">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 transition-all duration-300">
          <Header onToggleSidebar={toggleSidebar} />
        </div>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 pt-16 lg:pt-20 overflow-auto">
          <div className="min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders">
                <Route index element={<OrdersPage />} />
                <Route path=":orderId" element={<OrderDetailsPage />} />
              </Route>
              <Route path="checkout" element={<CheckoutPage />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Notification Container - Add this */}
      <NotificationContainer />
    </div>
  );
};

export default Layout;