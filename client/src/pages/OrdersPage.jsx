// pages/OrdersPage.jsx
import React from 'react';
import { useApp } from '../context/AppContext';

const OrdersPage = () => {
  const { state } = useApp();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Orders
        </h1>
        
        {state.orders.list.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Your orders will appear here once you make a purchase.
            </p>
            <button
              onClick={() => setActiveItem('products')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {state.orders.list.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3">
                      <img
                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">{item.product.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total: ${order.totalAmount.toFixed(2)}
                  </span>
                  <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;