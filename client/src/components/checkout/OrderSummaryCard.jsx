import React from 'react';

const OrderSummaryCard = ({ orderSummary, cartItems }) => {
  return (
    <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Order Summary
      </h3>
      
      {/* Order Items */}
      {cartItems && cartItems.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-500">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Items ({cartItems.length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <img
                    src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                    alt={item.product?.name || 'Product'}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {item.product?.name || 'Unknown Product'}
                  </span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">
                  ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Subtotal:</span>
          <span>₹{orderSummary.subtotal.toFixed(2)}</span>
        </div>
        
        {orderSummary.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount:</span>
            <span>-₹{orderSummary.discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Shipping:</span>
          <span>{orderSummary.shipping === 0 ? 'Free' : `₹${orderSummary.shipping.toFixed(2)}`}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Tax:</span>
          <span>₹{orderSummary.tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-500 pt-2 mt-2">
          <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
            <span>Total:</span>
            <span>₹{orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;