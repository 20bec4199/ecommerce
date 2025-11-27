// server/routes/paymentRoutes.js (Simplified version)
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, authorize, ROLES } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Razorpay specific routes
router.post('/razorpay/create-order', paymentController.createRazorpayOrder);
router.post('/razorpay/verify', paymentController.verifyRazorpayPayment);
router.post('/razorpay/failure', paymentController.handlePaymentFailure);

// COD route
router.post('/cod/create', paymentController.createCODOrder);

// User payment routes
router.get('/user', paymentController.getUserPayments);
router.get('/order/:orderId', paymentController.getPaymentByOrder);
router.get('/:paymentId', paymentController.getPaymentDetails);

// Refund routes (admin only)
router.post('/:paymentId/refund', authorize(ROLES.ADMIN), paymentController.processRefund);

// Admin routes
router.get('/admin/payments', authorize(ROLES.ADMIN), paymentController.getAllPayments);
router.get('/admin/payments/stats', authorize(ROLES.ADMIN), paymentController.getPaymentStats);
router.get('/admin/payments/:id', authorize(ROLES.ADMIN), paymentController.getPayment);

module.exports = router;