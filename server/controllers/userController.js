const User = require('../models/User');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../middleware/errorHandler');
const { sendSuccessMail } = require('../email/emailGreetings/successMail');

// Get user profile
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.userId).select('-password -refreshToken -refreshTokenExpires');
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// Update user profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const {
    name,
    phone,
    dateOfBirth,
    newsletter,
    notifications
  } = req.body;
//   console.log("Updating profile with data:");
// console.log(req.body);
  const updateData = {};
  
  if (name) updateData.name = name;
  if (phone !== undefined) updateData['profile.phone'] = phone;
  if (dateOfBirth) updateData['profile.dateOfBirth'] = dateOfBirth;
  if (newsletter !== undefined) updateData['preferences.newsletter'] = newsletter;
  if (notifications !== undefined) updateData['preferences.notifications'] = notifications;
 console.log(updateData);
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $set: updateData },
    { 
      new: true,
      runValidators: true
    }
  )

  // console.log(user);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

// Update user password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler('Please provide current and new password', 400));
  }

  const user = await User.findById(req.user.userId).select('+password');
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Check if user has password (not social login)
  if (!user.password) {
    return next(new ErrorHandler('Password change not allowed for social login accounts', 400));
  }

  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  // Send email notification
  let options = {
    type: 'password_change',
  };

  sendSuccessMail(
    user.email, 
    user.name, 
    'Password Updated Successfully - Blissora', 
    'Your password has been changed successfully. If you did not make this change, please contact our support team immediately.',
    options
  ).catch(error => {
    console.error('Failed to send password change email:', error);
  });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Manage user addresses
exports.addAddress = catchAsyncError(async (req, res, next) => {
  const {
    type,
    street,
    city,
    state,
    country,
    zipCode,
    isDefault
  } = req.body;

  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const newAddress = {
    type,
    street,
    city,
    state,
    country,
    zipCode,
    isDefault: isDefault || false
  };

  // If this address is set as default, unset other defaults
  if (isDefault) {
    user.address.forEach(addr => {
      addr.isDefault = false;
    });
  }

  user.address.push(newAddress);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address added successfully',
    addresses: user.address
  });
});

exports.updateAddress = catchAsyncError(async (req, res, next) => {
  const { addressId } = req.params;
  const {
    type,
    street,
    city,
    state,
    country,
    zipCode,
    isDefault
  } = req.body;

  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const addressIndex = user.address.id(addressId);
  if (!addressIndex) {
    return next(new ErrorHandler('Address not found', 404));
  }

  // Update address fields
  if (type) addressIndex.type = type;
  if (street) addressIndex.street = street;
  if (city) addressIndex.city = city;
  if (state) addressIndex.state = state;
  if (country) addressIndex.country = country;
  if (zipCode) addressIndex.zipCode = zipCode;

  // Handle default address
  if (isDefault) {
    user.address.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    addresses: user.address
  });
});

exports.deleteAddress = catchAsyncError(async (req, res, next) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  user.address.pull({ _id: addressId });
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    addresses: user.address
  });
});

exports.getAddresses = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.userId).select('address');
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    addresses: user.address
  });
});

// Seller profile management
exports.createSellerProfile = catchAsyncError(async (req, res, next) => {
  const {
    storeName,
    storeDescription,
    businessEmail,
    taxId
  } = req.body;

  if (!storeName || !storeDescription || !businessEmail) {
    return next(new ErrorHandler('Please provide store name, description and business email', 400));
  }

  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Check if user already has a seller profile
  if (user.sellerProfile.storeName) {
    return next(new ErrorHandler('Seller profile already exists', 400));
  }

  user.sellerProfile = {
    storeName,
    storeDescription,
    businessEmail,
    taxId: taxId || '',
    isApproved: false,
    rating: 0,
    totalSales: 0
  };

  user.role = 'seller';
  await user.save();

  // Send email notification
  let options = {
    type: 'seller_registration',
  };

  sendSuccessMail(
    user.email, 
    user.name, 
    'Seller Profile Created - Blissora', 
    `Your seller profile "${storeName}" has been created successfully and is pending approval. You will be notified once it's approved.`,
    options
  ).catch(error => {
    console.error('Failed to send seller registration email:', error);
  });

  res.status(200).json({
    success: true,
    message: 'Seller profile created successfully and pending approval',
    sellerProfile: user.sellerProfile
  });
});

exports.updateSellerProfile = catchAsyncError(async (req, res, next) => {
  const {
    storeName,
    storeDescription,
    businessEmail,
    taxId
  } = req.body;

  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (!user.sellerProfile.storeName) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  // Only allow updates if profile is not approved or user is admin
  if (user.sellerProfile.isApproved && user.role !== 'admin') {
    return next(new ErrorHandler('Cannot update approved seller profile', 400));
  }

  const updateData = {};
  if (storeName) updateData['sellerProfile.storeName'] = storeName;
  if (storeDescription) updateData['sellerProfile.storeDescription'] = storeDescription;
  if (businessEmail) updateData['sellerProfile.businessEmail'] = businessEmail;
  if (taxId !== undefined) updateData['sellerProfile.taxId'] = taxId;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { 
      new: true,
      runValidators: true
    }
  ).select('-password -refreshToken -refreshTokenExpires');

  res.status(200).json({
    success: true,
    message: 'Seller profile updated successfully',
    sellerProfile: updatedUser.sellerProfile
  });
});

// Admin functions
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password -refreshToken -refreshTokenExpires')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    success: true,
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

exports.getUserById = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken -refreshTokenExpires');

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!['user', 'admin', 'seller'].includes(role)) {
    return next(new ErrorHandler('Invalid role', 400));
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { 
      new: true,
      runValidators: true
    }
  ).select('-password -refreshToken -refreshTokenExpires');

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    user
  });
});

exports.approveSeller = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (!user.sellerProfile.storeName) {
    return next(new ErrorHandler('User does not have a seller profile', 400));
  }

  user.sellerProfile.isApproved = true;
  await user.save();

  // Send approval email
  let options = {
    type: 'seller_approval',
  };

  sendSuccessMail(
    user.email, 
    user.name, 
    'Seller Profile Approved - Blissora', 
    `Congratulations! Your seller profile "${user.sellerProfile.storeName}" has been approved. You can now start selling on our platform.`,
    options
  ).catch(error => {
    console.error('Failed to send seller approval email:', error);
  });

  res.status(200).json({
    success: true,
    message: 'Seller profile approved successfully',
    sellerProfile: user.sellerProfile
  });
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Prevent users from deleting themselves
  if (req.user._id.toString() === id) {
    return next(new ErrorHandler('You cannot delete your own account', 400));
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Upload avatar (you'll need to handle file upload with multer)
exports.uploadAvatar = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler('Please upload an image', 400));
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  user.profile.avatar = {
    data: req.file.buffer,
    contentType: req.file.mimetype
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully'
  });
});

// Get user statistics (for admin dashboard)
exports.getUserStats = catchAsyncError(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalSellers = await User.countDocuments({ role: 'seller' });
  const approvedSellers = await User.countDocuments({ 'sellerProfile.isApproved': true });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    }
  });

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalSellers,
      approvedSellers,
      newUsersThisMonth
    }
  });
});


exports.getSellerDashboard = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.userId)
      .select('sellerProfile name email')
      .populate('sellerStats'); // You might want to create a separate stats model
  
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
  
    // You can add more dashboard data here
    const dashboardData = {
      storeName: user.sellerProfile.storeName,
      totalSales: user.sellerProfile.totalSales,
      rating: user.sellerProfile.rating,
      isApproved: user.sellerProfile.isApproved,
      // Add more stats as needed
    };
  
    res.status(200).json({
      success: true,
      dashboard: dashboardData
    });
  });
  
  // Get seller analytics
  exports.getSellerAnalytics = catchAsyncError(async (req, res, next) => {
    // Implement seller analytics logic here
    // This could include sales data, visitor stats, etc.
    
    const analytics = {
      monthlySales: [],
      topProducts: [],
      // Add analytics data
    };
  
    res.status(200).json({
      success: true,
      analytics
    });
  });
  
  // Get user profile by ID (for admin or self)
  exports.getUserProfileById = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken -refreshTokenExpires');
  
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
  
    res.status(200).json({
      success: true,
      user
    });
  });
  
  // Update user profile by ID (for admin or self)
  exports.updateUserProfileById = catchAsyncError(async (req, res, next) => {
    const {
      name,
      phone,
      dateOfBirth,
      newsletter,
      notifications,
      role // Only admin should be able to update role
    } = req.body;
  
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData['profile.phone'] = phone;
    if (dateOfBirth) updateData['profile.dateOfBirth'] = dateOfBirth;
    if (newsletter !== undefined) updateData['preferences.newsletter'] = newsletter;
    if (notifications !== undefined) updateData['preferences.notifications'] = notifications;
  
    // Only allow role update if user is admin
    if (req.user.role === ROLES.ADMIN && role) {
      if (!['user', 'admin', 'seller'].includes(role)) {
        return next(new ErrorHandler('Invalid role', 400));
      }
      updateData.role = role;
    }
  
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -refreshToken -refreshTokenExpires');
  
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
  
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  });