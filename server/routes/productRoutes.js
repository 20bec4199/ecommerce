// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  updateInventory
} = require('../controllers/productController');
const { authMiddleware, authorize, checkOwnership, requireApprovedSeller, ROLES } = require('../middleware/auth'); // Fixed typo here
const Product = require('../models/Product');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categorySlug', getProductsByCategory);
router.get('/:id', getProduct);

// Protected routes - Approved sellers and admin
router.post('/', authMiddleware, requireApprovedSeller, createProduct); // Fixed here
router.patch('/:id/inventory', authMiddleware, checkOwnership(Product), updateInventory); // Fixed route

// Protected routes - Product ownership (sellers) or admin
router.put('/:id', authMiddleware, checkOwnership(Product), updateProduct);
router.delete('/:id', authMiddleware, checkOwnership(Product), deleteProduct);

module.exports = router;