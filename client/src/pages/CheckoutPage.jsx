import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// Components
import Notification from '../components/checkout/Notification';
import AddressList from '../components/checkout/AddressList';
import AddressForm from '../components/checkout/AddressForm';
import OrderSummaryCard from '../components/checkout/OrderSummaryCard';
import PaymentMethods from '../components/checkout/PaymentMethods';
import StepNavigation from '../components/checkout/StepNavigation';

const CheckoutPage = () => {
  const { 
    state, 
    createOrder, 
    createRazorpayOrder, 
    verifyRazorpayPayment, 
    createCODOrder,
    addAddress,
    updateAddress,
    fetchUserProfile,
    clearCart
  } = useApp();
  
  const navigate = useNavigate();
  
  // Local state
  const [currentStep, setCurrentStep] = useState('address');
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: ''
    },
    isDefault: false
  });

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  }, []);

  // Calculate order summary
  const orderSummary = useMemo(() => {
    const items = state?.cart?.items || [];
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = subtotal * 0.18;
    const discount = state.cart?.coupon?.discount || 0;
    const total = Math.max(0, subtotal + shipping + tax - discount);

    return {
      subtotal,
      totalQuantity,
      shipping,
      tax,
      discount,
      total
    };
  }, [state.cart]);

  // Load user addresses and set defaults
  useEffect(() => {
    if (state.addresses.list.length > 0) {
      const defaultAddress = state.addresses.list.find(addr => addr.isDefault) || state.addresses.list[0];
      setSelectedShippingAddress(defaultAddress);
      setSelectedBillingAddress(defaultAddress);
    }
  }, [state.addresses.list]);

  // Validate cart on component mount
  useEffect(() => {
    if (!state.cart.items || state.cart.items.length === 0) {
      showNotification('Your cart is empty. Redirecting to cart page.', 'warning');
      setTimeout(() => navigate('/dashboard/cart'), 2000);
      return;
    }
  }, [state.cart.items, navigate, showNotification]);

  // Address form handlers
  const handleAddressFormChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setAddressForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setAddressForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  const handleAddAddress = useCallback(async () => {
    try {
      setIsProcessing(true);
      await addAddress(addressForm);
      setShowAddressForm(false);
      setAddressForm({
        name: '',
        email: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          country: 'India',
          zipCode: ''
        },
        isDefault: false
      });
      await fetchUserProfile();
      showNotification('Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      showNotification('Failed to add address. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [addressForm, addAddress, fetchUserProfile, showNotification]);

  const handleEditAddress = useCallback((address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      email: address.email,
      phone: address.phone,
      address: { ...address.address },
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  }, []);

  const handleUpdateAddress = useCallback(async () => {
    try {
      setIsProcessing(true);
      await updateAddress(editingAddress._id, addressForm);
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        email: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          country: 'India',
          zipCode: ''
        },
        isDefault: false
      });
      await fetchUserProfile();
      showNotification('Address updated successfully!');
    } catch (error) {
      console.error('Error updating address:', error);
      showNotification('Failed to update address. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [editingAddress, addressForm, updateAddress, fetchUserProfile, showNotification]);

  // Address selection handlers
  const handleShippingAddressSelect = useCallback((address) => {
    setSelectedShippingAddress(address);
    if (useSameAddress) {
      setSelectedBillingAddress(address);
    }
  }, [useSameAddress]);

  const handleBillingAddressSelect = useCallback((address) => {
    setSelectedBillingAddress(address);
  }, []);

  // Step navigation
  const handleNextStep = useCallback(() => {
    if (currentStep === 'address') {
      if (!selectedShippingAddress) {
        showNotification('Please select a shipping address', 'warning');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (!selectedPaymentMethod) {
        showNotification('Please select a payment method', 'warning');
        return;
      }
      setCurrentStep('review');
    }
  }, [currentStep, selectedShippingAddress, selectedPaymentMethod, showNotification]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep === 'payment') {
      setCurrentStep('address');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  }, [currentStep]);

  // Place order handler
  const handlePlaceOrder = useCallback(async () => {
    try {
      setIsProcessing(true);

      if (!state.cart.items || state.cart.items.length === 0) {
        showNotification('Your cart is empty. Please add items to your cart before placing an order.', 'warning');
        setTimeout(() => navigate('/dashboard/cart'), 2000);
        return;
      }

      if (!selectedShippingAddress || !selectedPaymentMethod) {
        showNotification('Please complete all required fields', 'warning');
        return;
      }

      const orderData = {
        shippingAddress: selectedShippingAddress,
        billingAddress: useSameAddress ? selectedShippingAddress : selectedBillingAddress,
        paymentMethod: selectedPaymentMethod,
        notes: ''
      };

      const orderResponse = await createOrder(orderData);
      const order = orderResponse.order;

      if (!order || !order._id) {
        throw new Error('Failed to create order: No order ID returned');
      }

      setOrderData(order);

      if (selectedPaymentMethod === 'cod') {
        await createCODOrder({ orderId: order._id });
        showNotification('Order placed successfully with Cash on Delivery!', 'success');
        
        setTimeout(() => {
          clearCart();
          navigate('/dashboard/cart');
        }, 1500);
        
      } else if (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'upi') {
        const razorpayResponse = await createRazorpayOrder({
          orderId: order._id,
          amount: orderSummary.total
        });

        if (!razorpayResponse) {
          throw new Error('No response from Razorpay');
        }

        setRazorpayOrder(razorpayResponse);

        const loadRazorpay = () => {
          return new Promise((resolve) => {
            if (window.Razorpay) {
              resolve(true);
              return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const scriptLoaded = await loadRazorpay();
        if (!scriptLoaded) {
          throw new Error('Razorpay SDK failed to load');
        }

        const options = {
          key: razorpayResponse.key,
          amount: razorpayResponse.amount,
          currency: razorpayResponse.currency,
          name: 'Your Store',
          description: `Order #${order.orderId}`,
          image: '/logo.png',
          order_id: razorpayResponse.orderId,
          handler: async function (response) {
            try {
              await verifyRazorpayPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: razorpayResponse.paymentId
              });
              
              showNotification('Payment successful! Order confirmed.', 'success');
              
              setTimeout(() => {
                clearCart();
                navigate('/dashboard/cart');
              }, 1000);
              
            } catch (error) {
              console.error('Payment verification failed:', error);
              showNotification('Payment verification failed. Please contact support.', 'error');
            }
          },
          prefill: {
            name: selectedShippingAddress.name,
            email: selectedShippingAddress.email,
            contact: selectedShippingAddress.phone
          },
          notes: {
            orderId: order._id,
            orderNumber: order.orderId
          },
          theme: {
            color: '#8B5CF6'
          }
        };

        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error);
          showNotification(`Payment failed: ${response.error.description}`, 'error');
        });

        razorpay.open();
      }

    } catch (error) {
      console.error('Order creation failed:', error);
      
      if (error.response?.data?.message) {
        showNotification(`Order failed: ${error.response.data.message}`, 'error');
      } else if (error.message.includes('Cart is empty')) {
        showNotification('Your cart appears to be empty. Please add items to your cart and try again.', 'warning');
        setTimeout(() => navigate('/dashboard/cart'), 2000);
      } else {
        showNotification('Failed to create order. Please try again.', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    state.cart.items,
    selectedShippingAddress,
    selectedBillingAddress,
    useSameAddress,
    selectedPaymentMethod,
    createOrder,
    createCODOrder,
    createRazorpayOrder,
    verifyRazorpayPayment,
    orderSummary.total,
    navigate,
    showNotification,
    clearCart
  ]);

  // Step components
  const AddressStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Shipping Address
        </h2>
        <button
          onClick={() => setShowAddressForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add New Address
        </button>
      </div>

      <AddressList
        addresses={state.addresses.list}
        selectedAddress={selectedShippingAddress}
        onAddressSelect={handleShippingAddressSelect}
        onEditAddress={handleEditAddress}
        type="shipping"
      />

      <div className="mt-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useSameAddress}
            onChange={(e) => setUseSameAddress(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Use same address for billing
          </span>
        </label>
      </div>

      {!useSameAddress && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Billing Address
          </h3>
          <AddressList
            addresses={state.addresses.list}
            selectedAddress={selectedBillingAddress}
            onAddressSelect={handleBillingAddressSelect}
            onEditAddress={handleEditAddress}
            type="billing"
            emptyMessage="No addresses available"
          />
        </div>
      )}
    </div>
  );

  const PaymentStep = () => (
    <PaymentMethods
      selectedPaymentMethod={selectedPaymentMethod}
      onPaymentMethodSelect={setSelectedPaymentMethod}
    />
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Review Your Order
      </h2>

      {/* Order Items */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Order Items ({state.cart.items?.length || 0})
        </h3>
        <div className="space-y-3">
          {state.cart.items && state.cart.items.length > 0 ? (
            state.cart.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                    alt={item.product?.name || 'Product'}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Qty: {item.quantity} × ₹{item.price || 0}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-300 text-center py-4">
              No items in cart
            </p>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Shipping Address
          </h3>
          {selectedShippingAddress ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedShippingAddress.name}<br />
              {selectedShippingAddress.phone}<br />
              {selectedShippingAddress.address?.line1 || selectedShippingAddress.line1}<br />
              {(selectedShippingAddress.address?.line2 || selectedShippingAddress.line2) && `${selectedShippingAddress.address?.line2 || selectedShippingAddress.line2}<br />`}
              {selectedShippingAddress.address?.city || selectedShippingAddress.city}, 
              {selectedShippingAddress.address?.state || selectedShippingAddress.state} - 
              {selectedShippingAddress.address?.zipCode || selectedShippingAddress.zipCode || selectedShippingAddress.postalCode}<br />
              {selectedShippingAddress.address?.country || selectedShippingAddress.country || 'India'}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No shipping address selected</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {useSameAddress ? 'Billing Address' : 'Payment Method'}
          </h3>
          {useSameAddress ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Same as shipping address
            </p>
          ) : selectedBillingAddress ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedBillingAddress.name}<br />
              {selectedBillingAddress.phone}<br />
              {selectedBillingAddress.address?.line1 || selectedBillingAddress.line1}<br />
              {(selectedBillingAddress.address?.line2 || selectedBillingAddress.line2) && `${selectedBillingAddress.address?.line2 || selectedBillingAddress.line2}<br />`}
              {selectedBillingAddress.address?.city || selectedBillingAddress.city}, 
              {selectedBillingAddress.address?.state || selectedBillingAddress.state} - 
              {selectedBillingAddress.address?.zipCode || selectedBillingAddress.zipCode || selectedBillingAddress.postalCode}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No billing address selected</p>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Payment Method
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {selectedPaymentMethod === 'card' ? 'Credit/Debit Card & UPI (Razorpay)' : 
           selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'No payment method selected'}
        </p>
      </div>

      {/* Order Summary */}
      <OrderSummaryCard 
        orderSummary={orderSummary} 
        cartItems={state.cart.items} 
      />
    </div>
  );

  const ConfirmationStep = () => (
    <div className="text-center py-8">
      <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Order Confirmed!
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Thank you for your order. Your order has been successfully placed.
      </p>

      {orderData && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Order ID: <span className="font-semibold text-gray-900 dark:text-white">{orderData.orderId}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Total Amount: <span className="font-semibold text-gray-900 dark:text-white">₹{orderSummary.total.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Payment Method: <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedPaymentMethod}</span>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/dashboard/cart')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          View Orders
        </button>
        <button
          onClick={() => navigate('/dashboard/products')}
          className="border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  // Address Form Modal
  const AddressFormModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          
          <AddressForm
            addressForm={addressForm}
            editingAddress={editingAddress}
            isProcessing={isProcessing}
            onFormChange={handleAddressFormChange}
            onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
              setAddressForm({
                name: '',
                email: '',
                phone: '',
                address: {
                  line1: '',
                  line2: '',
                  city: '',
                  state: '',
                  country: 'India',
                  zipCode: ''
                },
                isDefault: false
              });
            }}
          />
        </div>
      </div>
    </div>
  );

  // Progress Steps
  const ProgressSteps = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {['address', 'payment', 'review', 'confirmation'].map((step, index) => (
          <React.Fragment key={step}>
            <div className={`flex flex-col items-center ${
              currentStep === step ? 'text-purple-600 dark:text-purple-400' : 
              currentStep === 'confirmation' ? 'text-green-600 dark:text-green-400' : 
              'text-gray-400 dark:text-gray-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step ? 'bg-purple-600 text-white' : 
                currentStep === 'confirmation' ? 'bg-green-600 text-white' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {currentStep === 'confirmation' && step === 'confirmation' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs mt-1 capitalize">{step}</span>
            </div>
            {index < 3 && (
              <div className={`w-12 h-0.5 ${
                (currentStep === 'confirmation' && index < 3) ? 'bg-green-600 dark:bg-green-400' :
                (['payment', 'review', 'confirmation'].includes(currentStep) && index < 1) ? 'bg-purple-600 dark:bg-purple-400' :
                (['review', 'confirmation'].includes(currentStep) && index < 2) ? 'bg-purple-600 dark:bg-purple-400' :
                'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Guard clause for empty cart
  if (!state.cart.items || state.cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cart is Empty
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate('/dashboard/cart')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Notification notification={notification} />

        {/* Checkout Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Complete your purchase in a few simple steps
          </p>
        </div>

        <ProgressSteps />

        {/* Checkout Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          {currentStep === 'address' && <AddressStep />}
          {currentStep === 'payment' && <PaymentStep />}
          {currentStep === 'review' && <ReviewStep />}
          {currentStep === 'confirmation' && <ConfirmationStep />}

          {/* Navigation Buttons */}
          {currentStep !== 'confirmation' && (
            <StepNavigation
              currentStep={currentStep}
              onPrevious={currentStep === 'address' ? () => navigate('/dashboard/cart') : handlePreviousStep}
              onNext={handleNextStep}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
              canProceed={
                (currentStep === 'address' && selectedShippingAddress) ||
                (currentStep === 'payment' && selectedPaymentMethod) ||
                (currentStep === 'review' && selectedShippingAddress && selectedPaymentMethod)
              }
              isLastStep={currentStep === 'review'}
            />
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && <AddressFormModal />}
    </div>
  );
};

export default CheckoutPage;