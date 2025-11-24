const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../middleware/errorHandler');

// Get all products with filtering and pagination
exports.getProducts = catchAsyncError(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    minPrice,
    maxPrice,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'active',
    tags,
    seller
  } = req.query;

  const filter = { status };

  // Category filter
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }
  }

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (rating) {
    filter['rating.average'] = { $gte: parseFloat(rating) };
  }

  // Tags filter
  if (tags) {
    filter.tags = { $in: tags.split(',') };
  }

  // Seller filter
  if (seller) {
    filter.seller = seller;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .populate('seller', 'name sellerProfile.storeName')
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sort);

  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalProducts,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Get single product
exports.getProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let product;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('seller', 'name sellerProfile.storeName');
  } else {
    product = await Product.findOne({ 'seo.slug': id })
      .populate('category', 'name slug')
      .populate('seller', 'name sellerProfile.storeName');
  }

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

// Create product (seller only)
exports.createProduct = catchAsyncError(async (req, res, next) => {
  const {
    name,
    description,
    category,
    price,
    comparePrice,
    cost,
    inventory,
    attributes,
    variants,
    tags,
    isFeatured
  } = req.body;

  // Verify seller has approved seller profile
  const User = require('../models/User');
  const user = await User.findById(req.user.userId);
  if (!user.sellerProfile.isApproved) {
    return next(new ErrorHandler('Seller profile not approved', 403));
  }

  const product = new Product({
    name,
    description,
    seller: req.user.userId,
    category,
    price,
    comparePrice,
    cost,
    inventory: {
      sku: inventory?.sku || `SKU${Date.now()}`,
      quantity: inventory?.quantity || 0,
      trackQuantity: inventory?.trackQuantity !== false,
      allowBackorder: inventory?.allowBackorder || false
    },
    attributes: attributes || [],
    variants: variants || [],
    tags: tags || [],
    isFeatured: isFeatured || false,
    seo: {
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    }
  });

  await product.save();
  await product.populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product
  });
});

// Update product (seller only)
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if user owns the product or is admin
  if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to update this product', 403));
  }

  // Remove fields that shouldn't be updated directly
  delete updateData.seller;
  delete updateData.rating;
  delete updateData.createdAt;

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    { 
      new: true,
      runValidators: true
    }
  ).populate('category', 'name slug')
   .populate('seller', 'name sellerProfile.storeName');

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product: updatedProduct
  });
});

// Delete product (seller or admin)
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if user owns the product or is admin
  if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to delete this product', 403));
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// Get products by seller
exports.getSellerProducts = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  const filter = { seller: req.user.userId };
  if (status) filter.status = status;

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalProducts,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Update product inventory
exports.updateInventory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, trackQuantity, allowBackorder } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if user owns the product or is admin
  if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to update this product', 403));
  }

  if (quantity !== undefined) product.inventory.quantity = quantity;
  if (trackQuantity !== undefined) product.inventory.trackQuantity = trackQuantity;
  if (allowBackorder !== undefined) product.inventory.allowBackorder = allowBackorder;

  // Update status based on inventory
  if (product.inventory.quantity === 0 && !product.inventory.allowBackorder) {
    product.status = 'out_of_stock';
  } else if (product.status === 'out_of_stock') {
    product.status = 'active';
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Inventory updated successfully',
    product
  });
});

// Get featured products
exports.getFeaturedProducts = catchAsyncError(async (req, res, next) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ 
    isFeatured: true, 
    status: 'active' 
  })
    .populate('category', 'name slug')
    .populate('seller', 'name sellerProfile.storeName')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    products
  });
});

// Get related products
exports.getRelatedProducts = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const relatedProducts = await Product.find({
    _id: { $ne: id },
    category: product.category,
    status: 'active'
  })
    .populate('category', 'name slug')
    .limit(parseInt(limit))
    .sort({ 'rating.average': -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    products: relatedProducts
  });
});