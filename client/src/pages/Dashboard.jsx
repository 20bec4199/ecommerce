import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import DebugTheme from '../components/DebugTheme';
// import Dashboard from '../components/Dashboard';
// import Products from '../components/Products';
// import Orders from '../components/Orders';
// import Cart from '../components/Cart';
// import Profile from '../components/Profile';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders />;
      case 'cart':
        return <Cart />;
      case 'wishlist':
        return <div>Wishlist Component</div>;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    // <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
    //   {renderContent()}
    // </Layout>
    <Layout >
      <DebugTheme />
    </Layout>
  );
};

export default DashboardPage;