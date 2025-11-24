const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../middleware/errorHandler');

// Get user cart
exports.getCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findByUserId(req.user.userId);
  
  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: {
        items: [],
        summary: {
          itemsCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0
        },
        coupon: null,
        lastUpdated: new Date()
      }
    });
  }

  res.status(200).json({
    success: true,
    cart
  });
});

// Add item to cart
exports.addToCart = catchAsyncError(async (req, res, next) => {
  const { product, quantity, variant, seller } = req.body;

  // Validate product exists and is available
  const productDoc = await Product.findById(product);
  if (!productDoc) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (productDoc.status !== 'active') {
    return next(new ErrorHandler('Product is not available', 400));
  }

  if (productDoc.inventory.quantity < quantity && !productDoc.inventory.allowBackorder) {
    return next(new ErrorHandler('Insufficient stock', 400));
  }

  let cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    cart = new Cart({
      user: req.user.userId,
      items: []
    });
  }

  const itemData = {
    product,
    quantity,
    price: variant?.price || productDoc.price,
    variant: variant || undefined,
    seller
  };

  cart.addItem(itemData);
  await cart.save();

  await cart.populate('items.product', 'name images inventory status price');

  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully',
    cart,
    item: cart.items[cart.items.length - 1]
  });
});

// Update cart item quantity
exports.updateQuantity = catchAsyncError(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new ErrorHandler('Quantity must be at least 1', 400));
  }

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  const cartItem = cart.items.id(itemId);
  if (!cartItem) {
    return next(new ErrorHandler('Cart item not found', 404));
  }

  // Check stock availability
  const product = await Product.findById(cartItem.product);
  if (product.inventory.quantity < quantity && !product.inventory.allowBackorder) {
    return next(new ErrorHandler('Insufficient stock', 400));
  }

  cart.updateItemQuantity(cartItem.product, cartItem.variant, quantity);
  await cart.save();

  await cart.populate('items.product', 'name images inventory status price');

  res.status(200).json({
    success: true,
    message: 'Cart quantity updated successfully',
    cart
  });
});

// Remove item from cart
exports.removeFromCart = catchAsyncError(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  const cartItem = cart.items.id(itemId);
  if (!cartItem) {
    return next(new ErrorHandler('Cart item not found', 404));
  }

  cart.removeItem(cartItem.product, cartItem.variant);
  await cart.save();

  await cart.populate('items.product', 'name images inventory status price');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart successfully',
    cart
  });
});

// Apply coupon to cart
exports.applyCoupon = catchAsyncError(async (req, res, next) => {
  const { couponCode } = req.body;

  // In a real application, you'd validate the coupon from a Coupon model
  const validCoupons = {
    'WELCOME10': { discountType: 'percentage', discountValue: 10, maxDiscount: 100 },
    'FLAT50': { discountType: 'fixed', discountValue: 50 },
    'FREESHIP': { discountType: 'fixed', discountValue: 40 } // Free shipping equivalent
  };

  const coupon = validCoupons[couponCode];
  if (!coupon) {
    return next(new ErrorHandler('Invalid coupon code', 400));
  }

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  cart.coupon = {
    code: couponCode,
    ...coupon
  };

  cart.calculateTotals();
  await cart.save();

  await cart.populate('items.product', 'name images inventory status price');

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    cart
  });
});

// Remove coupon from cart
exports.removeCoupon = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  cart.coupon = undefined;
  cart.calculateTotals();
  await cart.save();

  await cart.populate('items.product', 'name images inventory status price');

  res.status(200).json({
    success: true,
    message: 'Coupon removed successfully',
    cart
  });
});

// Clear cart
exports.clearCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  cart.clearCart();
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    cart
  });
});