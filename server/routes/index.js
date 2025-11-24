const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const productRoutes = require('./productRoutes')
const userRoutes = require('./userRoutes');
const cartRoutes = require('./cartRoutes');
const categoryRoutes = require('./categoryRoutes');
// const wishlistRoutes = require('./wishlistRoutes');
// const paymentRoutes = require('./paymentRoutes');
const orderRoutes = require('./orderRoutes');
const reviewRoutes = require('./reviewRoutes');




// Auth routes
router.use('/auth', authRoutes);
// User routes
router.use('/users', userRoutes);
// Product routes
router.use('/products', productRoutes);
// Cart routes
router.use('/cart', cartRoutes);
// Category routes
router.use('/category', categoryRoutes);
// Order routes
router.use('/orders', orderRoutes);
// Review routes
router.use('/reviews', reviewRoutes);


module.exports = router;