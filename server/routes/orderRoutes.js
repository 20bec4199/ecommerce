const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize, ROLES, checkOwnership, requireApprovedSeller } = require('../middleware/auth');
const Order = require('../models/Order');

// User routes (authenticated)
router.get('/', authMiddleware, orderController.getOrders);
router.get('/stats', authMiddleware, orderController.getOrderStats);
router.get('/:id', authMiddleware, checkOwnership(Order, 'id'), orderController.getOrder);
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id/cancel', authMiddleware, checkOwnership(Order, 'id'), orderController.cancelOrder);

// Seller routes (approved sellers only)
router.get('/seller/orders', authMiddleware, requireApprovedSeller, orderController.getSellerOrders);
router.put('/seller/orders/:id/status', authMiddleware, requireApprovedSeller, orderController.updateOrderStatus);

// Admin routes
router.get('/admin/orders', authMiddleware, authorize(ROLES.ADMIN), orderController.getOrders);
router.get('/admin/orders/stats', authMiddleware, authorize(ROLES.ADMIN), orderController.getOrderStats);
router.put('/admin/orders/:id/status', authMiddleware, authorize(ROLES.ADMIN), orderController.updateOrderStatus);

module.exports = router;