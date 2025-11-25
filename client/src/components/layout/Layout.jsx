// components/Layout/Layout.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../hooks/useTheme';

// Import your page components
import Dashboard from '../../pages/Dashboard';
import ProductsPage from '../../pages/ProductsPage';
import ProfilePage from '../../pages/ProfilePage';
import CartPage from '../../pages/CartPage';
import OrdersPage from '../../pages/OrdersPage';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Layout */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Main Content */}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;