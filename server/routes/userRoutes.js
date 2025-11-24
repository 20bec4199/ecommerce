const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorize, ROLES, requireSelfOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Public routes
router.get('/profile/:id', userController.getUserProfileById);

// User routes (authenticated)
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/password', authMiddleware, userController.updatePassword);

// Address management
router.get('/addresses', authMiddleware, userController.getAddresses);
router.post('/addresses', authMiddleware, userController.addAddress);
router.put('/addresses/:addressId', authMiddleware, userController.updateAddress);
router.delete('/addresses/:addressId', authMiddleware, userController.deleteAddress);

// Seller routes
router.post('/seller/profile', authMiddleware, userController.createSellerProfile);
router.put('/seller/profile', authMiddleware, userController.updateSellerProfile);
router.get('/seller/dashboard', authMiddleware, authorize(ROLES.SELLER), userController.getSellerDashboard);
router.get('/seller/analytics', authMiddleware, authorize(ROLES.SELLER), userController.getSellerAnalytics);

// Avatar upload
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// Admin routes
router.get('/admin/users', authMiddleware, authorize(ROLES.ADMIN), userController.getAllUsers);
router.get('/admin/users/stats', authMiddleware, authorize(ROLES.ADMIN), userController.getUserStats);
router.get('/admin/users/:id', authMiddleware, authorize(ROLES.ADMIN), userController.getUserById);
router.put('/admin/users/:id', authMiddleware, authorize(ROLES.ADMIN), userController.updateUserProfileById);
router.put('/admin/users/:id/role', authMiddleware, authorize(ROLES.ADMIN), userController.updateUserRole);
router.put('/admin/sellers/:id/approve', authMiddleware, authorize(ROLES.ADMIN), userController.approveSeller);
router.delete('/admin/users/:id', authMiddleware, authorize(ROLES.ADMIN), userController.deleteUser);

module.exports = router;