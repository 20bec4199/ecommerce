const Category = require('../models/Category');
const Product = require('../models/Product');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../middleware/errorHandler');

// Get all categories
exports.getCategories = catchAsyncError(async (req, res, next) => {
  const { includeTree = false, includeCount = false } = req.query;

  let categories;
  
  if (includeCount) {
    categories = await Category.getCategoriesWithCount();
  } else {
    categories = await Category.find({ status: 'active' })
      .sort({ displayOrder: 1, name: 1 })
      .select('name slug parent image featured displayOrder');
  }

  let tree = [];
  if (includeTree) {
    tree = await Category.getCategoryTree();
  }

  res.status(200).json({
    success: true,
    categories,
    tree
  });
});

// Get single category
exports.getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let category;
  if (mongoose.Types.ObjectId.isValid(id)) {
    category = await Category.findById(id);
  } else {
    category = await Category.findOne({ slug: id });
  }

  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  // Get breadcrumb
  const breadcrumb = await category.getBreadcrumb();

  res.status(200).json({
    success: true,
    category,
    breadcrumb
  });
});

// Create category (admin only)
exports.createCategory = catchAsyncError(async (req, res, next) => {
  const {
    name,
    description,
    parent,
    image,
    seo,
    attributes,
    displayOrder,
    featured
  } = req.body;

  const category = new Category({
    name,
    description,
    parent: parent || null,
    image,
    seo,
    attributes: attributes || [],
    displayOrder: displayOrder || 0,
    featured: featured || false
  });

  await category.save();

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category
  });
});

// Update category (admin only)
exports.updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    { $set: updateData },
    { 
      new: true,
      runValidators: true
    }
  );

  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category
  });
});

// Delete category (admin only)
exports.deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Check if category has subcategories
  const subcategories = await Category.countDocuments({ parent: id });
  if (subcategories > 0) {
    return next(new ErrorHandler('Cannot delete category with subcategories', 400));
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    return next(new ErrorHandler('Cannot delete category with products', 400));
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// Get category products
exports.getCategoryProducts = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  let category;
  if (mongoose.Types.ObjectId.isValid(id)) {
    category = await Category.findById(id);
  } else {
    category = await Category.findOne({ slug: id });
  }

  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  // Get all subcategories (for hierarchical filtering)
  const getAllSubcategories = async (categoryId) => {
    const subcategories = await Category.find({ parent: categoryId });
    let allCategories = [categoryId];
    
    for (const subcategory of subcategories) {
      const subSubcategories = await getAllSubcategories(subcategory._id);
      allCategories = [...allCategories, ...subSubcategories];
    }
    
    return allCategories;
  };

  const categoryIds = await getAllSubcategories(category._id);

  const filter = { 
    category: { $in: categoryIds },
    status: 'active' 
  };

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

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .populate('seller', 'name sellerProfile.storeName')
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sort);

  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  // Get breadcrumb
  const breadcrumb = await category.getBreadcrumb();

  res.status(200).json({
    success: true,
    category,
    breadcrumb,
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