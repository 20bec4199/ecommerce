const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../middleware/errorHandler');

// Create new order
exports.createOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingAddress,
    billingAddress,
    paymentMethod,
    notes
  } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.userId })
    .populate('items.product', 'name price inventory seller');
  
  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler('Cart is empty', 400));
  }

  // Validate stock and process items
  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.product;
    
    // Check stock availability
    if (product.inventory.trackQuantity && 
        product.inventory.quantity < cartItem.quantity && 
        !product.inventory.allowBackorder) {
      return next(new ErrorHandler(`Insufficient stock for ${product.name}`, 400));
    }

    const itemTotal = cartItem.price * cartItem.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      seller: product.seller,
      variant: cartItem.variant,
      quantity: cartItem.quantity,
      price: cartItem.price,
      total: itemTotal
    });

    // Update product inventory
    if (product.inventory.trackQuantity) {
      product.inventory.quantity -= cartItem.quantity;
      if (product.inventory.quantity <= 0 && !product.inventory.allowBackorder) {
        product.status = 'out_of_stock';
      }
      await product.save();
    }
  }

  // Calculate totals (using cart summary or recalculating)
  const shipping = cart.summary.shipping;
  const tax = cart.summary.tax;
  const discount = cart.summary.discount;
  const total = cart.summary.total;

  // Generate order ID
  const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

  const order = new Order({
    orderId,
    user: req.user.userId,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    summary: {
      subtotal,
      shipping,
      tax,
      discount,
      total
    },
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'pending'
    },
    notes
  });

  await order.save();

  // Clear cart after successful order creation
  await Cart.findOneAndDelete({ user: req.user.userId });

  // Populate order data for response
  await order.populate('items.product', 'name images');
  await order.populate('items.seller', 'name sellerProfile.storeName');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order
  });
});

// Get user orders
exports.getOrders = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = { user: req.user.userId };
  if (status) filter.status = status;

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const orders = await Order.find(filter)
    .populate('items.product', 'name images')
    .populate('items.seller', 'name sellerProfile.storeName')
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sort);

  const totalOrders = await Order.countDocuments(filter);
  const totalPages = Math.ceil(totalOrders / limit);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalOrders,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Get single order
exports.getOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    user: req.user.userId
  })
    .populate('items.product', 'name images category')
    .populate('items.seller', 'name sellerProfile.storeName');

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    order
  });
});

// Cancel order
exports.cancelOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: id,
    user: req.user.userId
  });

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Check if order can be cancelled
  if (!['pending', 'confirmed'].includes(order.status)) {
    return next(new ErrorHandler('Order cannot be cancelled at this stage', 400));
  }

  // Restore product inventory
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product && product.inventory.trackQuantity) {
      product.inventory.quantity += item.quantity;
      if (product.status === 'out_of_stock') {
        product.status = 'active';
      }
      await product.save();
    }
  }

  order.status = 'cancelled';
  order.notes = reason ? `Cancelled: ${reason}` : 'Order cancelled by user';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
});

// Update order status (admin/seller)
exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status, trackingNumber, carrier, notes } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Check if user is seller of any item in order or admin
  if (req.user.role !== 'admin') {
    const isSeller = order.items.some(item => 
      item.seller.toString() === req.user.userId
    );
    if (!isSeller) {
      return next(new ErrorHandler('Not authorized to update this order', 403));
    }
  }

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler('Invalid order status', 400));
  }

  order.status = status;

  // Update tracking info if provided
  if (trackingNumber && carrier) {
    order.tracking = {
      carrier,
      trackingNumber,
      trackingUrl: generateTrackingUrl(carrier, trackingNumber),
      shippedAt: status === 'shipped' ? new Date() : order.tracking.shippedAt
    };
  }

  // Mark as delivered
  if (status === 'delivered') {
    order.tracking.deliveredAt = new Date();

    // Update seller sales count
    const User = require('../models/User');
    const sellerIds = [...new Set(order.items.map(item => item.seller.toString()))];
    
    for (const sellerId of sellerIds) {
      await User.findByIdAndUpdate(sellerId, {
        $inc: { 'sellerProfile.totalSales': 1 }
      });
    }
  }

  if (notes) {
    order.notes = notes;
  }

  await order.save();
  await order.populate('items.product', 'name images');
  await order.populate('items.seller', 'name sellerProfile.storeName');

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    order
  });
});

// Get seller orders
exports.getSellerOrders = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Find orders where at least one item belongs to the seller
  const orders = await Order.find({
    'items.seller': req.user.userId
  })
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sort);

  // Filter items to only show seller's items
  const filteredOrders = orders.map(order => ({
    ...order.toObject(),
    items: order.items.filter(item => item.seller.toString() === req.user.userId)
  }));

  const totalOrders = await Order.countDocuments({
    'items.seller': req.user.userId
  });
  const totalPages = Math.ceil(totalOrders / limit);

  res.status(200).json({
    success: true,
    orders: filteredOrders,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalOrders,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Helper function to generate tracking URL
const generateTrackingUrl = (carrier, trackingNumber) => {
  const carriers = {
    'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
  };
  
  return carriers[carrier.toLowerCase()] || `https://example.com/track/${trackingNumber}`;
};

// Get order statistics
exports.getOrderStats = catchAsyncError(async (req, res, next) => {
  let filter = {};
  
  // For sellers, only show their orders
  if (req.user.role === 'seller') {
    filter = { 'items.seller': req.user.userId };
  }

  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$summary.total' }
      }
    }
  ]);

  const totalStats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$summary.total' },
        averageOrderValue: { $avg: '$summary.total' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    stats: {
      byStatus: stats,
      overview: totalStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      }
    }
  });
});