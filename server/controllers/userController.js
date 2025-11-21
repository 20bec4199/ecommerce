const User = require('../../models/User');
const catchAsyncError = require('../../middleware/catchAsyncError');
const ErrorHandler = require('../../middleware/errorHandler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -refreshTokenExpires');

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Convert avatar buffer to base64 if exists
  let avatarUrl = null;
  if (user.avatar && user.avatar.data) {
    const base64Image = user.avatar.data.toString('base64');
    const mimeType = user.avatar.contentType || 'image/jpeg';
    avatarUrl = `data:${mimeType};base64,${base64Image}`;
  }

  const userResponse = user.toObject();
  userResponse.avatar = avatarUrl;

  res.status(200).json({
    success: true,
    data: userResponse
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const { name, phone, dateOfBirth } = req.body;
  
  const updateData = {
    name,
    'profile.phone': phone,
    'profile.dateOfBirth': dateOfBirth
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { 
      new: true, 
      runValidators: true 
    }
  ).select('-password -refreshToken -refreshTokenExpires -avatar');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.updateAvatar = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler('Please upload an image', 400));
  }

  try {
    // Check file size (max 2MB)
    if (req.file.size > 2 * 1024 * 1024) {
      return next(new ErrorHandler('Image size should be less than 2MB', 400));
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return next(new ErrorHandler('Only JPEG, JPG, PNG, and GIF images are allowed', 400));
    }

    // Update user avatar with BLOB data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        },
        'profile.avatar': {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      },
      { new: true }
    ).select('-password -refreshToken -refreshTokenExpires');

    // Convert avatar buffer to base64 for response
    const base64Image = req.file.buffer.toString('base64');
    const avatarUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    return next(new ErrorHandler('Error updating avatar', 500));
  }
});

// @desc    Get user avatar
// @route   GET /api/users/avatar
// @access  Public
exports.getAvatar = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('avatar');

  if (!user || !user.avatar || !user.avatar.data) {
    return next(new ErrorHandler('Avatar not found', 404));
  }

  res.set('Content-Type', user.avatar.contentType);
  res.send(user.avatar.data);
});

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
exports.deleteAvatar = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { 
        avatar: 1,
        'profile.avatar': 1
      }
    },
    { new: true }
  ).select('-password -refreshToken -refreshTokenExpires');

  res.status(200).json({
    success: true,
    message: 'Avatar deleted successfully',
    data: user
  });
});

// @desc    Add new address
// @route   POST /api/users/address
// @access  Private
exports.addAddress = catchAsyncError(async (req, res, next) => {
  const { type, street, city, state, country, zipCode, isDefault } = req.body;

  const address = {
    type,
    street,
    city,
    state,
    country,
    zipCode,
    isDefault: isDefault || false
  };

  const user = await User.findById(req.user._id);

  // If this address is set as default, remove default from other addresses
  if (isDefault) {
    user.address.forEach(addr => {
      addr.isDefault = false;
    });
  }

  user.address.push(address);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: user.address
  });
});

// @desc    Update address
// @route   PUT /api/users/address/:addressId
// @access  Private
exports.updateAddress = catchAsyncError(async (req, res, next) => {
  const { addressId } = req.params;
  const { type, street, city, state, country, zipCode, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  const address = user.address.id(addressId);

  if (!address) {
    return next(new ErrorHandler('Address not found', 404));
  }

  // If setting as default, remove default from other addresses
  if (isDefault) {
    user.address.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Update address fields
  if (type) address.type = type;
  if (street) address.street = street;
  if (city) address.city = city;
  if (state) address.state = state;
  if (country) address.country = country;
  if (zipCode) address.zipCode = zipCode;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: user.address
  });
});

// @desc    Delete address
// @route   DELETE /api/users/address/:addressId
// @access  Private
exports.deleteAddress = catchAsyncError(async (req, res, next) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  user.address.pull(addressId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: user.address
  });
});

// @desc    Get all addresses
// @route   GET /api/users/address
// @access  Private
exports.getAddresses = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('address');

  res.status(200).json({
    success: true,
    data: user.address
  });
});

// @desc    Set default address
// @route   PUT /api/users/address/:addressId/default
// @access  Private
exports.setDefaultAddress = catchAsyncError(async (req, res, next) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  
  // Remove default from all addresses
  user.address.forEach(addr => {
    addr.isDefault = false;
  });

  // Set the selected address as default
  const address = user.address.id(addressId);
  if (!address) {
    return next(new ErrorHandler('Address not found', 404));
  }

  address.isDefault = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated successfully',
    data: user.address
  });
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = catchAsyncError(async (req, res, next) => {
  const { newsletter, notifications } = req.body;

  const updateData = {};
  if (newsletter !== undefined) updateData['preferences.newsletter'] = newsletter;
  if (notifications !== undefined) updateData['preferences.notifications'] = notifications;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true }
  ).select('-password -refreshToken -refreshTokenExpires -avatar');

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: user.preferences
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Apply for seller account
// @route   POST /api/users/become-seller
// @access  Private
exports.becomeSeller = catchAsyncError(async (req, res, next) => {
  const { storeName, storeDescription, businessEmail, taxId } = req.body;

  const user = await User.findById(req.user._id);

  // Check if already a seller
  if (user.role === 'seller') {
    return next(new ErrorHandler('You are already a seller', 400));
  }

  // Check if already applied
  if (user.sellerProfile.storeName) {
    return next(new ErrorHandler('You have already applied for seller account', 400));
  }

  user.sellerProfile = {
    storeName,
    storeDescription,
    businessEmail,
    taxId,
    isApproved: false,
    rating: 0,
    totalSales: 0
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Seller application submitted successfully. Waiting for approval.',
    data: user.sellerProfile
  });
});

// @desc    Get seller profile
// @route   GET /api/users/seller-profile
// @access  Private (Seller)
exports.getSellerProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -refreshTokenExpires -avatar');

  if (user.role !== 'seller') {
    return next(new ErrorHandler('You are not a seller', 403));
  }

  res.status(200).json({
    success: true,
    data: user.sellerProfile
  });
});

// @desc    Update seller profile
// @route   PUT /api/users/seller-profile
// @access  Private (Seller)
exports.updateSellerProfile = catchAsyncError(async (req, res, next) => {
  const { storeName, storeDescription, businessEmail } = req.body;

  const user = await User.findById(req.user._id);

  if (user.role !== 'seller') {
    return next(new ErrorHandler('You are not a seller', 403));
  }

  if (storeName) user.sellerProfile.storeName = storeName;
  if (storeDescription) user.sellerProfile.storeDescription = storeDescription;
  if (businessEmail) user.sellerProfile.businessEmail = businessEmail;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Seller profile updated successfully',
    data: user.sellerProfile
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/delete-account
// @access  Private
exports.deleteAccount = catchAsyncError(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler('Password is incorrect', 400));
  }

  // Delete user
  await User.findByIdAndDelete(req.user._id);

  // Clear cookies
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboardStats = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -refreshTokenExpires -avatar');

  // You can integrate with order service to get actual stats
  const dashboardStats = {
    totalOrders: 0, // Get from orders collection
    pendingOrders: 0, // Get from orders collection
    wishlistItems: 0, // Get from wishlist collection
    addresses: user.address.length,
    isSeller: user.role === 'seller',
    sellerApproved: user.sellerProfile?.isApproved || false
  };

  res.status(200).json({
    success: true,
    data: dashboardStats
  });
});