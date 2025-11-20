const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const productRoutes = require('./productRoutes');




// Auth routes
router.use('/auth', authRoutes);
// Product routes
router.use('/products', productRoutes);


module.exports = router;