const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get user cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', cartController.addToCart);

// Update item quantity
router.put('/items/:itemId/quantity', cartController.updateQuantity);

// Remove item from cart
router.delete('/items/:itemId', cartController.removeFromCart);

// Apply coupon
router.post('/coupon', cartController.applyCoupon);

// Remove coupon
router.delete('/coupon', cartController.removeCoupon);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;