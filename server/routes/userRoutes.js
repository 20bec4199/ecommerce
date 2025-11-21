const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Profile routes
router.route('/profile')
    .get(authMiddleware, userController.getUserProfile)
    .put(authMiddleware, userController.updateUserProfile);

// Avatar routes
router.route('/avatar')
    .get(authMiddleware, userController.getAvatar)
    .put(authMiddleware, upload.single('avatar'), userController.updateAvatar)
    .delete(authMiddleware, userController.deleteAvatar);

// Public avatar route
router.route('/avatar/:userId')
    .get(userController.getAvatar);

// Address routes
router.route('/address')
    .get(authMiddleware, userController.getAddresses)
    .post(authMiddleware, userController.addAddress);

router.route('/address/:addressId')
    .put(authMiddleware, userController.updateAddress)
    .delete(authMiddleware, userController.deleteAddress);

    router.route('/adress/:addressId/default')
    .put(authMiddleware, )