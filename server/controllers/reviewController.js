const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../middleware/errorHandler');

// Create review
exports.addReview = catchAsyncError(async (req, res, next) => {
  const { productId, orderId, rating, title, comment, images } = req.body;

  // Validate required fields
  if (!productId || !orderId || !rating) {
    return next(new ErrorHandler('Product, order and rating are required', 400));
  }

  // Check if user has purchased the product
  const order = await Order.findOne({
    _id: orderId,
    user: req.user.userId,
    status: 'delivered',
    'items.product': productId
  });

  if (!order) {
    return next(new ErrorHandler('You can only review products you have purchased', 400));
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user.userId
  });

  if (existingReview) {
    return next(new ErrorHandler('You have already reviewed this product', 400));
  }

  const review = new Review({
    product: productId,
    user: req.user.userId,
    order: orderId,
    rating,
    title,
    comment,
    images: images || [],
    verifiedPurchase: true
  });

  await review.save();
  await review.populate('user', 'name');

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    review
  });
});

// Get product reviews
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const {
    page = 1,
    limit = 10,
    rating,
    sortBy = 'helpful.count',
    sortOrder = 'desc',
    withImages = false
  } = req.query;

  const result = await Review.getProductReviews(productId, {
    page,
    limit,
    rating,
    sortBy,
    sortOrder,
    withImages
  });

  res.status(200).json({
    success: true,
    reviews: result.reviews,
    pagination: result.pagination
  });
});

// Get review statistics for product
exports.getReviewStats = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;

  const stats = await Review.getReviewStats(productId);

  res.status(200).json({
    success: true,
    stats
  });
});

// Mark review as helpful
exports.markReviewHelpful = catchAsyncError(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  const marked = review.markHelpful(req.user.userId);
  if (!marked) {
    return next(new ErrorHandler('You have already marked this review as helpful', 400));
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review marked as helpful',
    helpfulCount: review.helpful.count
  });
});

// Remove helpful mark
exports.removeHelpful = catchAsyncError(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  const removed = review.removeHelpful(req.user.userId);
  if (!removed) {
    return next(new ErrorHandler('Helpful mark not found', 400));
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Helpful mark removed',
    helpfulCount: review.helpful.count
  });
});

// In reviewController.js - update the reportReview function
exports.reportReview = catchAsyncError(async (req, res, next) => {
    const { reviewId } = req.params;
    const { reason } = req.body;
  
    if (!reason) {
      return next(new ErrorHandler('Please provide a reason for reporting', 400));
    }
  
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler('Review not found', 404));
    }
  
    // CHANGED: Use addReport instead of report
    const reported = review.addReport(req.user.userId, reason);
    if (!reported) {
      return next(new ErrorHandler('You have already reported this review', 400));
    }
  
    await review.save();
  
    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
  });
// Get user reviews
exports.getUserReviews = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10,
    status = 'approved'
  } = req.query;

  const skip = (page - 1) * limit;

  const reviews = await Review.find({ 
    user: req.user.userId,
    status 
  })
    .populate('product', 'name images')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const totalReviews = await Review.countDocuments({ 
    user: req.user.userId,
    status 
  });
  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).json({
    success: true,
    reviews,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalReviews,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Admin: Get all reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10,
    status,
    productId
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  if (status) filter.status = status;
  if (productId) filter.product = productId;

  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const totalReviews = await Review.countDocuments(filter);
  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).json({
    success: true,
    reviews,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalReviews,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Admin: Update review status
exports.updateReviewStatus = catchAsyncError(async (req, res, next) => {
  const { reviewId } = req.params;
  const { status, moderatorNotes } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected', 'spam'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler('Invalid review status', 400));
  }

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { 
      status,
      moderatorNotes: moderatorNotes || undefined
    },
    { new: true }
  )
    .populate('user', 'name email')
    .populate('product', 'name');

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Review status updated successfully',
    review
  });
});

// Seller: Respond to review
exports.respondToReview = catchAsyncError(async (req, res, next) => {
  const { reviewId } = req.params;
  const { comment, isPublic = true } = req.body;

  const review = await Review.findById(reviewId)
    .populate('product', 'seller');

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  // Check if user is the seller of the product
  if (review.product.seller.toString() !== req.user.userId) {
    return next(new ErrorHandler('Not authorized to respond to this review', 403));
  }

  review.sellerResponse = {
    comment,
    respondedAt: new Date(),
    isPublic
  };

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Response added successfully',
    review
  });
});