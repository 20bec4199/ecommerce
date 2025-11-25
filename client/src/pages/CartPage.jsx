// pages/CartPage.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { state, removeFromCart, updateCartQuantity } = useApp();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const items = state?.cart?.cart?.items || [];
  const total = state?.cart?.cart?.summary?.total || 0;
  const subtotal = state?.cart?.cart?.summary?.subtotal || 0;
  const shipping = state?.cart?.cart?.summary?.shipping || 0;
  const tax = state?.cart?.cart?.summary?.tax || 0;
  const discount = state?.cart?.cart?.summary?.discount || 0;

  const handleRemoveFromCart = async (itemId) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await updateCartQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const getItemTotal = (item) => {
    return ((item?.price || 0) * (item?.quantity || 1)).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {/* EMPTY CART */}
        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-6">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Your cart is empty
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to discover amazing products!
            </p>

            <button
              onClick={() => navigate('/dashboard/products')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* CART WITH ITEMS */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ITEMS LIST */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cart Items
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => {
                    const isUpdating = updatingItems.has(item._id);
                    
                    return (
                      <div
                        key={item._id}
                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item?.product?.images?.[0] || '/placeholder-product.jpg'}
                              alt={item?.product?.name || 'Product'}
                              className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {item?.product?.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {item?.variant ? `${item.variant.name}: ${item.variant.value}` : 'Standard'}
                            </p>
                            <p className="text-purple-600 dark:text-purple-400 font-semibold text-lg mt-2">
                              ₹{getItemTotal(item)}
                            </p>
                          </div>

                          {/* Quantity Controls & Remove */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                −
                              </button>
                              
                              <span className={`w-12 text-center font-medium ${isUpdating ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {isUpdating ? '...' : item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={isUpdating}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                +
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveFromCart(item._id)}
                              disabled={isUpdating}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>{isUpdating ? 'Removing...' : 'Remove'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="text-purple-600 dark:text-purple-400">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard/products')}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;