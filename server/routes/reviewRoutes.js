const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, authorize, ROLES, checkOwnership, requireApprovedSeller } = require('../middleware/auth');
const Review = require('../models/Review');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/stats', reviewController.getReviewStats);

// User routes (authenticated)
router.get('/user/reviews', authMiddleware, reviewController.getUserReviews);
router.post('/', authMiddleware, reviewController.addReview);
router.post('/:reviewId/helpful', authMiddleware, reviewController.markReviewHelpful);
router.delete('/:reviewId/helpful', authMiddleware, reviewController.removeHelpful);
router.post('/:reviewId/report', authMiddleware, reviewController.reportReview);

// Seller routes (approved sellers only)
router.post('/:reviewId/response', authMiddleware, requireApprovedSeller, reviewController.respondToReview);

// Admin routes
router.get('/admin/reviews', authMiddleware, authorize(ROLES.ADMIN), reviewController.getAllReviews);
router.put('/admin/reviews/:reviewId/status', authMiddleware, authorize(ROLES.ADMIN), reviewController.updateReviewStatus);

module.exports = router;