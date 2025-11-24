const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, authorize, ROLES } = require('../middleware/auth');

// Payment routes (authenticated users)
router.post('/create', authMiddleware, paymentController.createPayment);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

// Refund routes (admin only)
router.post('/:paymentId/refund', authMiddleware, authorize(ROLES.ADMIN), paymentController.processRefund);

// Admin routes
router.get('/admin/payments', authMiddleware, authorize(ROLES.ADMIN), paymentController.getAllPayments);
router.get('/admin/payments/stats', authMiddleware, authorize(ROLES.ADMIN), paymentController.getPaymentStats);
router.get('/admin/payments/:id', authMiddleware, authorize(ROLES.ADMIN), paymentController.getPayment);

module.exports = router;