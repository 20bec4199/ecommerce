const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, authorize, ROLES } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/products', categoryController.getCategoryProducts);

// Admin routes
router.post('/', authMiddleware, authorize(ROLES.ADMIN), categoryController.createCategory);
router.put('/:id', authMiddleware, authorize(ROLES.ADMIN), categoryController.updateCategory);
router.delete('/:id', authMiddleware, authorize(ROLES.ADMIN), categoryController.deleteCategory);

module.exports = router;