import React from 'react';

const PaymentMethods = ({ selectedPaymentMethod, onPaymentMethodSelect }) => {
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card & UPI',
      description: 'Pay securely with Razorpay',
      badges: ['Visa', 'Mastercard', 'UPI'],
      type: 'online'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive the order',
      badges: ['Pay Later'],
      type: 'offline'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Payment Method
      </h2>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === method.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-400'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
            }`}
            onClick={() => onPaymentMethodSelect(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-500 flex items-center justify-center">
                  {selectedPaymentMethod === method.id && (
                    <div className="w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {method.description}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {method.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded ${
                      method.id === 'cod'
                        ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                        : index === 0
                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
                        : index === 1
                        ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100'
                        : 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
          Your payment information is encrypted and secure. We don't store your card details.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethods;