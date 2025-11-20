// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with advanced filtering
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      seller,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status = 'active'
    } = req.query;

    const filter = { status };
    if (category) filter.category = category;
    if (seller) filter.seller = seller;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const products = await Product.find(filter)
      .populate('seller', 'name sellerProfile.storeName')
      .populate('category', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filter);

    const result = {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get single product with related products
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('seller', 'name sellerProfile rating')
      .populate('category', 'name')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active'
    })
    .limit(4)
    .select('name price images rating')
    .lean();

    res.json({
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

// Create product (Seller only)
const createProduct = async (req, res, next) => {
  console.log(req.user);
  try {
    const productData = {
      ...req.body,
      seller: req.user.userId
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Update product (Seller only)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({
      _id: id,
      seller: req.user.userId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (Seller only)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({
      _id: id,
      seller: req.user.userId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(id);

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get featured products
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      status: 'active'
    })
    .populate('seller', 'name sellerProfile.storeName')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select('name price images rating category seller')
    .lean();

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get products by category
const getProductsByCategory = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;
    const {
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Find category by slug
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const filter = {
      category: category._id,
      status: 'active'
    };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const products = await Product.find(filter)
      .populate('seller', 'name sellerProfile.storeName')
      .populate('category', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filter);

    const result = {
      products,
      category: category.name,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update product inventory
const updateInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, trackQuantity, allowBackorder } = req.body;
    
    const product = await Product.findOne({
      _id: id,
      seller: req.user.id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update inventory fields
    if (quantity !== undefined) product.inventory.quantity = quantity;
    if (trackQuantity !== undefined) product.inventory.trackQuantity = trackQuantity;
    if (allowBackorder !== undefined) product.inventory.allowBackorder = allowBackorder;

    // Update status based on inventory
    if (product.inventory.trackQuantity && product.inventory.quantity === 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock' && product.inventory.quantity > 0) {
      product.status = 'active';
    }

    await product.save();

    res.json({
      message: 'Inventory updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  updateInventory
};