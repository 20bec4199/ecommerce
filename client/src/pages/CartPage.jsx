// pages/CartPage.jsx
import React, { useState, useCallback, memo, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// Memoized Cart Item Component
const CartItem = memo(({ 
  item, 
  onQuantityChange, 
  onRemove, 
  isUpdating 
}) => {
  const [imageError, setImageError] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  
  const getProductName = useCallback((item) => {
    return item?.product?.name || 'Product';
  }, []);

  const getVariantText = useCallback((item) => {
    if (!item.variant) return 'Standard';
    return `${item.variant.name}: ${item.variant.value}`;
  }, []);

  const getItemTotal = useCallback((item) => {
    return ((item?.price || 0) * (localQuantity || 1)).toFixed(2);
  }, [localQuantity]);

  const getInitials = useCallback((name) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const getBackgroundColor = useCallback((name) => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];
    
    if (!name) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const productName = getProductName(item);
  const imageUrl = item?.product?.images?.[0];
  
  const handleDecrease = useCallback(async () => {
    if (localQuantity <= 1) return;
    
    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    await onQuantityChange(item._id, newQuantity);
  }, [localQuantity, item._id, onQuantityChange]);

  const handleIncrease = useCallback(async () => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    await onQuantityChange(item._id, newQuantity);
  }, [localQuantity, item._id, onQuantityChange]);

  const handleRemove = useCallback(() => {
    onRemove(item._id);
  }, [item._id, onRemove]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Product Image with Fallback */}
        <div className="flex-shrink-0">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-sm ${getBackgroundColor(productName)}`}>
              {getInitials(productName)}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {productName}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
            {getVariantText(item)}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
            <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm sm:text-base">
              ₹{item.price?.toFixed(2) || '0.00'}
            </p>
            <span className="text-gray-400 hidden sm:inline">×</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {localQuantity}
            </span>
            <span className="text-gray-400 hidden sm:inline">=</span>
            <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
              ₹{getItemTotal(item)}
            </p>
          </div>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="flex flex-col items-end space-y-2 sm:space-y-3">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={handleDecrease}
              disabled={isUpdating || localQuantity <= 1}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            >
              −
            </button>
            
            <span className={`w-8 sm:w-12 text-center font-medium text-xs sm:text-sm ${isUpdating ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {isUpdating ? '...' : localQuantity}
            </span>
            
            <button
              onClick={handleIncrease}
              disabled={isUpdating}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">{isUpdating ? 'Removing...' : 'Remove'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

const CartPage = () => {
  const { state, removeFromCart, updateCartQuantity } = useApp();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  // Calculate totals immediately based on current items
  const cartSummary = useMemo(() => {
    const items = state?.cart?.items || [];
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const itemsCount = items.length;
    
    // You can adjust these calculations based on your business logic
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const tax = subtotal * 0.18; // 18% tax
    const discount = state.cart?.coupon?.discount || 0;
    const total = Math.max(0, subtotal + shipping + tax - discount);

    return {
      subtotal,
      totalQuantity,
      itemsCount,
      shipping,
      tax,
      discount,
      total
    };
  }, [state.cart?.items, state.cart?.coupon]);

  const { subtotal, totalQuantity, itemsCount, shipping, tax, discount, total } = cartSummary;

  const handleRemoveFromCart = useCallback(async (itemId) => {
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
  }, [removeFromCart]);

  const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
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
  }, [updateCartQuantity]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            {itemsCount} item{itemsCount !== 1 ? 's' : ''} • {totalQuantity} unit{totalQuantity !== 1 ? 's' : ''}
          </p>
        </div>

        {/* EMPTY CART */}
        {state.cart?.items?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm p-8 sm:p-12 text-center mx-2">
            <div className="text-gray-400 dark:text-gray-500 mb-6">
              <svg
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto"
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

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Your cart is empty
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm sm:text-base">
              Looks like you haven't added anything to your cart yet. Start shopping to discover amazing products!
            </p>

            <button
              onClick={() => navigate('/dashboard/products')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* CART WITH ITEMS */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
            {/* ITEMS LIST */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Cart Items ({itemsCount})
                    </h2>
                    <button
                      onClick={() => navigate('/dashboard/products')}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {state.cart.items.map((item) => (
                    <CartItem
                      key={item._id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveFromCart}
                      isUpdating={updatingItems.has(item._id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 sticky top-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 sm:space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="text-sm sm:text-base">Subtotal ({totalQuantity} items)</span>
                    <span className="text-sm sm:text-base">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="text-sm sm:text-base">Discount</span>
                      <span className="text-sm sm:text-base">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="text-sm sm:text-base">Shipping</span>
                    <span className="text-sm sm:text-base">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="text-sm sm:text-base">Tax</span>
                    <span className="text-sm sm:text-base">₹{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                    <div className="flex justify-between text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="text-purple-600 dark:text-purple-400">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Including all taxes and charges
                    </p>
                  </div>
                </div>

                {/* Additional Summary Info */}
                {state.cart.coupon && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-800 dark:text-green-300">
                        Coupon Applied:
                      </span>
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        {state.cart.coupon.code}
                      </span>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                      You saved ₹{discount.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/dashboard/checkout')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                    disabled={state.cart.items.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard/products')}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure checkout • SSL encrypted</span>
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