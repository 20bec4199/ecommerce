// server/controllers/paymentController.js
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../middleware/errorHandler');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createRazorpayOrder = catchAsyncError(async (req, res, next) => {
  const { orderId, amount, currency = 'INR' } = req.body;
  const userId = req.user.userId;

  console.log('🔄 Creating Razorpay order for:', { orderId, amount, userId });

  // Validate order exists and belongs to user
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    console.error('❌ Order not found:', { orderId, userId });
    return next(new ErrorHandler('Order not found', 404));
  }

  // Check if order is already paid
  if (order.payment.status === 'completed') {
    return next(new ErrorHandler('Order is already paid', 400));
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment) {
    if (existingPayment.status === 'completed') {
      return next(new ErrorHandler('Payment already completed for this order', 400));
    }
    return res.status(200).json({
      success: true,
      orderId: existingPayment.gatewayResponse.gatewayOrderId,
      amount: existingPayment.amount * 100,
      currency: existingPayment.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: existingPayment.paymentId
    });
  }

  try {
    // Create Razorpay order first
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId.toString(),
        userId: userId.toString()
      }
    });

    console.log('✅ Razorpay order created:', razorpayOrder.id);

    // Generate payment ID explicitly
    const generatedPaymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    console.log('🎯 Explicitly generated paymentId:', generatedPaymentId);

    // Safely get user agent and IP
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

    // Create payment with explicit paymentId
    const paymentData = {
      paymentId: generatedPaymentId, // Explicitly set paymentId
      order: orderId,
      user: userId,
      amount: amount,
      currency: currency,
      paymentMethod: 'card',
      paymentGateway: 'razorpay',
      status: 'pending',
      gatewayResponse: {
        gatewayOrderId: razorpayOrder.id
      },
      billingAddress: order.billingAddress,
      metadata: {
        ipAddress: ipAddress,
        userAgent: userAgent,
        device: 'web'
      }
    };

    console.log('💾 Payment data to save:', paymentData);

    // Create and save payment
    const payment = new Payment(paymentData);
    
    // Check payment data before save
    console.log('🔍 Payment instance before save:', {
      paymentId: payment.paymentId,
      hasPaymentId: !!payment.paymentId,
      isNew: payment.isNew
    });

    // Save the payment
    const savedPayment = await payment.save();
    
    console.log('✅ Payment saved successfully:', savedPayment.paymentId);
    console.log('📋 Saved payment details:', {
      _id: savedPayment._id,
      paymentId: savedPayment.paymentId,
      order: savedPayment.order,
      amount: savedPayment.amount
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: savedPayment.paymentId
    });

  } catch (error) {
    console.error('❌ Error in createRazorpayOrder:', error);
    
    if (error.name === 'ValidationError') {
      console.error('📋 Validation errors:', error.errors);
      return next(new ErrorHandler(`Payment validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`, 400));
    }
    
    return next(new ErrorHandler('Failed to create payment order: ' + (error.error?.description || error.message), 500));
  }
});

// Verify Razorpay payment
exports.verifyRazorpayPayment = catchAsyncError(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new ErrorHandler('Missing payment verification data', 400));
  }

  // Find payment record
  const payment = await Payment.findOne({ 
    paymentId,
    'gatewayResponse.gatewayOrderId': razorpay_order_id 
  }).populate('order');

  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  // Verify signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    // Mark payment as failed due to signature mismatch
    payment.markAsFailed({
      gatewayPaymentId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      gatewaySignature: razorpay_signature,
      rawResponse: { error: 'Signature verification failed' }
    });
    await payment.save();

    // Update order status
    payment.order.status = 'cancelled';
    payment.order.payment.status = 'failed';
    await payment.order.save();

    return next(new ErrorHandler('Payment verification failed', 400));
  }

  // Payment successful
  payment.markAsCompleted({
    gatewayPaymentId: razorpay_payment_id,
    gatewayOrderId: razorpay_order_id,
    gatewaySignature: razorpay_signature,
    rawResponse: req.body
  });

  // Update order status and payment info
  payment.order.status = 'confirmed';
  payment.order.payment.status = 'completed';
  payment.order.payment.transactionId = razorpay_payment_id;
  payment.order.payment.paymentDate = new Date();

  // Update inventory after successful payment
  for (const item of payment.order.items) {
    const product = await Product.findById(item.product);
    if (product && product.inventory.trackQuantity) {
      product.inventory.quantity -= item.quantity;
      if (product.inventory.quantity <= 0 && !product.inventory.allowBackorder) {
        product.status = 'out_of_stock';
      }
      await product.save();
    }
  }

  // Clear user's cart after successful payment
  await Cart.findOneAndDelete({ user: payment.user });

  await payment.order.save();
  await payment.save();

  // Populate order for response
  await payment.order.populate('items.product', 'name images');
  await payment.order.populate('items.seller', 'name sellerProfile.storeName');

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    paymentId: payment.paymentId,
    order: payment.order
  });
});

// Handle payment failure
exports.handlePaymentFailure = catchAsyncError(async (req, res, next) => {
  const { paymentId, error } = req.body;

  const payment = await Payment.findOne({ paymentId }).populate('order');
  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  payment.markAsFailed({
    rawResponse: { error: error?.description || 'Payment failed by user' }
  });

  // Update order status
  payment.order.status = 'cancelled';
  payment.order.payment.status = 'failed';
  await payment.order.save();

  await payment.save();

  res.status(200).json({
    success: true,
    message: 'Payment failure recorded',
    paymentId: payment.paymentId
  });
});

// Create COD order
exports.createCODOrder = catchAsyncError(async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user.userId;

  console.log('🔄 Creating COD order for:', { orderId, userId });

  // Validate order exists and belongs to user
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment) {
    return next(new ErrorHandler('Payment already exists for this order', 400));
  }

  // Generate payment ID explicitly
  const generatedPaymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  console.log('🎯 Explicitly generated COD paymentId:', generatedPaymentId);

  // Safely get user agent and IP
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

  // Create COD payment with explicit paymentId
  const paymentData = {
    paymentId: generatedPaymentId, // Explicitly set paymentId
    order: orderId,
    user: userId,
    amount: order.summary.total,
    currency: 'INR',
    paymentMethod: 'cod',
    paymentGateway: 'cod',
    status: 'completed',
    billingAddress: order.billingAddress,
    metadata: {
      ipAddress: ipAddress,
      userAgent: userAgent,
      device: 'web'
    },
    completedAt: new Date()
  };

  console.log('💾 COD Payment data to save:', paymentData);

  // Create and save payment
  const payment = new Payment(paymentData);
  
  // Check before save
  console.log('🔍 COD Payment instance before save:', {
    paymentId: payment.paymentId,
    hasPaymentId: !!payment.paymentId
  });

  // Update order status for COD
  order.status = 'confirmed';
  order.payment.status = 'completed';
  order.payment.paymentDate = new Date();

  // Update inventory
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product && product.inventory.trackQuantity) {
      product.inventory.quantity -= item.quantity;
      if (product.inventory.quantity <= 0 && !product.inventory.allowBackorder) {
        product.status = 'out_of_stock';
      }
      await product.save();
    }
  }

  // Clear user's cart
  await Cart.findOneAndDelete({ user: userId });

  // Save both order and payment
  await order.save();
  const savedPayment = await payment.save();
  
  console.log('✅ COD Payment saved successfully:', savedPayment.paymentId);

  // Populate order for response
  await order.populate('items.product', 'name images');
  await order.populate('items.seller', 'name sellerProfile.storeName');

  res.status(200).json({
    success: true,
    message: 'COD order created successfully',
    paymentId: savedPayment.paymentId,
    order
  });
});

// Get payment details
exports.getPaymentDetails = catchAsyncError(async (req, res, next) => {
  const { paymentId } = req.params;
  const userId = req.user.userId;

  const payment = await Payment.findOne({ paymentId, user: userId })
    .populate('order')
    .populate('user', 'name email');

  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  // Sanitize response - remove sensitive data
  const paymentData = payment.toObject();
  delete paymentData.gatewayResponse?.rawResponse;
  delete paymentData.cardDetails;
  delete paymentData.upiDetails;
  delete paymentData.walletDetails;

  res.status(200).json({
    success: true,
    payment: paymentData
  });
});

// Get user payments
exports.getUserPayments = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
    paymentMethod,
    startDate,
    endDate 
  } = req.query;

  const filter = { user: req.user.userId };
  const skip = (page - 1) * limit;

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Payment method filter
  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const payments = await Payment.find(filter)
    .populate('order', 'orderNumber items totalAmount status')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const totalPayments = await Payment.countDocuments(filter);
  const totalPages = Math.ceil(totalPayments / limit);

  // Sanitize payments data
  const sanitizedPayments = payments.map(payment => {
    const paymentObj = payment.toObject();
    delete paymentObj.gatewayResponse?.rawResponse;
    delete paymentObj.cardDetails;
    delete paymentObj.upiDetails;
    delete paymentObj.walletDetails;
    return paymentObj;
  });

  res.status(200).json({
    success: true,
    payments: sanitizedPayments,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalPayments,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Process refund
exports.processRefund = catchAsyncError(async (req, res, next) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;
  const userId = req.user.userId;

  const payment = await Payment.findOne({ paymentId }).populate('order');
  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  // Check if payment is completed
  if (payment.status !== 'completed') {
    return next(new ErrorHandler('Cannot refund a payment that is not completed', 400));
  }

  try {
    // Process refund through Razorpay if it's a Razorpay payment
    let gatewayRefundId = null;
    if (payment.paymentGateway === 'razorpay') {
      try {
        const razorpayRefund = await razorpay.payments.refund(
          payment.gatewayResponse.gatewayPaymentId,
          {
            amount: Math.round(amount * 100),
            notes: {
              reason: reason,
              paymentId: paymentId
            }
          }
        );
        gatewayRefundId = razorpayRefund.id;
      } catch (razorpayError) {
        return next(new ErrorHandler(`Razorpay refund failed: ${razorpayError.error.description}`, 400));
      }
    }

    payment.processRefund({
      amount,
      reason,
      gatewayRefundId: gatewayRefundId || `MANUAL_REF_${Date.now()}`,
      processedAt: new Date(),
      status: 'processed'
    });

    // Update order status if full refund
    const totalRefunded = payment.refunds
      .filter(refund => refund.status === 'processed')
      .reduce((sum, refund) => sum + refund.amount, 0);

    if (totalRefunded + amount >= payment.amount) {
      payment.order.status = 'refunded';
      payment.order.payment.status = 'refunded';
      await payment.order.save();
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refundId: payment.refunds[payment.refunds.length - 1].refundId,
      payment
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get payment statistics (Admin only)
exports.getPaymentStats = catchAsyncError(async (req, res, next) => {
  const { timeframe = 'month' } = req.query;

  const stats = await Payment.getPaymentStats(timeframe);

  res.status(200).json({
    success: true,
    stats
  });
});

// Get all payments (Admin only)
exports.getAllPayments = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
    paymentMethod,
    paymentGateway,
    startDate,
    endDate,
    search 
  } = req.query;

  const filter = {};
  const skip = (page - 1) * limit;

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Payment method filter
  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Payment gateway filter
  if (paymentGateway) {
    filter.paymentGateway = paymentGateway;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Search filter
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');

    const userIds = users.map(user => user._id);

    filter.$or = [
      { paymentId: { $regex: search, $options: 'i' } },
      { 'gatewayResponse.gatewayPaymentId': { $regex: search, $options: 'i' } },
      { user: { $in: userIds } }
    ];
  }

  const payments = await Payment.find(filter)
    .populate('order', 'orderNumber')
    .populate('user', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const totalPayments = await Payment.countDocuments(filter);
  const totalPages = Math.ceil(totalPayments / limit);

  res.status(200).json({
    success: true,
    payments,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalPayments,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Get payment by order ID
exports.getPaymentByOrder = catchAsyncError(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.userId;

  const payment = await Payment.findOne({ 
    order: orderId, 
    user: userId 
  })
    .populate('order')
    .populate('user', 'name email');

  if (!payment) {
    return next(new ErrorHandler('Payment not found for this order', 404));
  }

  // Sanitize response
  const paymentData = payment.toObject();
  delete paymentData.gatewayResponse?.rawResponse;
  delete paymentData.cardDetails;
  delete paymentData.upiDetails;
  delete paymentData.walletDetails;

  res.status(200).json({
    success: true,
    payment: paymentData
  });
});

// Get single payment (Admin)
exports.getPayment = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const payment = await Payment.findById(id)
    .populate('order')
    .populate('user', 'name email');

  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  res.status(200).json({
    success: true,
    payment
  });
});