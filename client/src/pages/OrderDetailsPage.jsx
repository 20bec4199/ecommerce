// pages/OrderDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state, fetchOrder, cancelOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const order = state.orders.currentOrder || state.orders.list.find(o => o._id === orderId);

  useEffect(() => {
    if (orderId && (!order || order._id !== orderId)) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchOrder(orderId);
    } catch (err) {
      setError(err.message || 'Failed to load order details');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (reason = '') => {
    if (!order) return;
    
    try {
      setCancelling(true);
      await cancelOrder(order._id, reason);
      navigate('/dashboard/orders');
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formattedDate;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6"></div>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar skeleton */}
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((m) => (
                        <div key={m} className="flex justify-between">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
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
              {error || 'Order not found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {error ? 'We encountered an issue loading your order details.' : 'The order you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Back to Orders
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
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Order #{order.orderId} • Placed {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Order Status
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Current status of your order
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={getStatusStyles(order.status)}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancelOrder('Changed my mind')}
                      disabled={cancelling}
                      className="px-5 py-2.5 text-sm border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 font-medium"
                    >
                      {cancelling ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Cancelling...
                        </span>
                      ) : (
                        'Cancel Order'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Tracking Information */}
              {order.tracking && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tracking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Carrier</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {order.tracking.carrier}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Tracking Number</p>
                      <code className="font-mono bg-white dark:bg-gray-600 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                        {order.tracking.trackingNumber}
                      </code>
                    </div>
                    {order.tracking.trackingUrl && (
                      <div className="md:col-span-2">
                        <a
                          href={order.tracking.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                        >
                          Track Package
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order Items
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={item._id || index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <img
                      src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">${order.summary?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">${order.summary?.shipping?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">${order.summary?.tax?.toFixed(2)}</span>
                </div>
                {order.summary?.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Discount</span>
                    <span className="text-green-600 dark:text-green-400">-${order.summary?.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between font-semibold text-base">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${order.summary?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Method</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {order.payment?.method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`inline-flex items-center gap-2 text-sm font-medium ${
                    order.payment?.status === 'completed' 
                      ? 'text-green-600 dark:text-green-400'
                      : order.payment?.status === 'failed'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      order.payment?.status === 'completed' 
                        ? 'bg-green-500'
                        : order.payment?.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}></span>
                    {order.payment?.status?.charAt(0).toUpperCase() + order.payment?.status?.slice(1)}
                  </span>
                </div>
                {order.payment?.transactionId && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</span>
                    <code className="text-xs font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all max-w-[120px]">
                      {order.payment.transactionId}
                    </code>
                  </div>
                )}
                {order.payment?.paymentDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Paid on</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(order.payment.paymentDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Address
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && (
                  <p className="pt-2 text-gray-500 dark:text-gray-400">
                    📞 {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;