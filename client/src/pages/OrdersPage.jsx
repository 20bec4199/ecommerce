// pages/OrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const OrdersPage = () => {
  const { state, fetchOrders, setActiveItem, cancelOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchOrders();
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, reason = '') => {
    try {
      setCancellingOrderId(orderId);
      await cancelOrder(orderId, reason);
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/dashboard/orders/${orderId}`);
  };

  const handleNavigateToProducts = () => {
    navigate('/dashboard/products');
  }

  // Enhanced status styles with icons
  const getStatusStyles = (status) => {
    const baseStyles = 'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 w-fit';
    
    const statusIcons = {
      delivered: '✓',
      shipped: '🚚',
      processing: '⚙️',
      confirmed: '✓',
      cancelled: '✕',
      refunded: '↩️',
      pending: '⏳'
    };

    switch (status) {
      case 'delivered':
        return `${baseStyles} bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800`;
      case 'shipped':
        return `${baseStyles} bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800`;
      case 'processing':
      case 'confirmed':
        return `${baseStyles} bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800`;
      case 'cancelled':
      case 'refunded':
        return `${baseStyles} bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800`;
      case 'pending':
      default:
        return `${baseStyles} bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700`;
    }
  };

  // Format date with relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formattedDate;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2].map((m) => (
                    <div key={m} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to load orders
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={loadOrders}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and track your orders
              </p>
            </div>
            <button
              onClick={() => handleNavigateToProducts()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md w-fit"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Empty State */}
        {state.orders.list.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              When you make purchases, they'll appear here with all the details you need.
            </p>
            <button
              onClick={() => setActiveItem && setActiveItem('products')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Orders List */}
            {state.orders.list.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Order #{order.orderId}
                          </h3>
                          <span className={getStatusStyles(order.status)}>
                            <span>{getStatusStyles.icon}</span>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                          <span>Placed {formatDate(order.createdAt)}</span>
                          <span>•</span>
                          <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${order.summary?.total?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={item._id || index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <img
                          src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {item.product?.name}
                          </h4>
                          {item.variant?.name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Seller: {item.seller?.sellerProfile?.storeName || item.seller?.name || 'Unknown Seller'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${item.total?.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} × ${item.price?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more items indicator */}
                    {order.items?.length > 3 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          +{order.items.length - 3} more items
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Payment:</span>
                          <span className="capitalize">{order.payment?.method}</span>
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            order.payment?.status === 'completed' 
                              ? 'bg-green-500' 
                              : 'bg-yellow-500'
                          }`}></span>
                          <span className="capitalize">{order.payment?.status}</span>
                        </div>
                        {order.tracking?.trackingNumber && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Tracking:</span>
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                              {order.tracking.trackingNumber}
                            </code>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelOrder(order._id, 'Changed my mind')}
                            disabled={cancellingOrderId === order._id}
                            className="px-5 py-2.5 text-sm border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 font-medium"
                          >
                            {cancellingOrderId === order._id ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                Cancelling...
                              </span>
                            ) : (
                              'Cancel Order'
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(order._id)}
                          className="px-5 py-2.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
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