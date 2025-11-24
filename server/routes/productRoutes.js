const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, authorize, ROLES, checkOwnership, requireApprovedSeller } = require('../middleware/auth');
const Product = require('../models/Product');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/related', productController.getRelatedProducts);
// router.get('/:id/reviews', productController.getProductReviews);

// Seller routes (authenticated sellers with approved accounts)
router.get('/seller/products', authMiddleware, requireApprovedSeller, productController.getSellerProducts);
router.post('/', authMiddleware, requireApprovedSeller, productController.createProduct);
router.put('/:id', authMiddleware, requireApprovedSeller, checkOwnership(Product), productController.updateProduct);
router.delete('/:id', authMiddleware, requireApprovedSeller, checkOwnership(Product), productController.deleteProduct);
router.patch('/:id/inventory', authMiddleware, requireApprovedSeller, checkOwnership(Product), productController.updateInventory);

// Admin routes (can manage any product)
router.put('/admin/:id', authMiddleware, authorize(ROLES.ADMIN), productController.updateProduct);
router.delete('/admin/:id', authMiddleware, authorize(ROLES.ADMIN), productController.deleteProduct);

module.exports = router;