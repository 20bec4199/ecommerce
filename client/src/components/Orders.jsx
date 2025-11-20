import React from 'react';
import Card from './ui/Card';

const Orders = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="text-center py-12 animate-fadeIn">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h2>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your orders</p>
        </Card>
      </div>
    </div>
  );
};

export default Orders;