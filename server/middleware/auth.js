const jwt = require('jsonwebtoken');
const ErrorHandler = require('../middleware/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../models/User');

// Role constants that match your schema
const ROLES = {
  USER: 'user',
  SELLER: 'seller', 
  ADMIN: 'admin'
};

exports.auth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.authMiddleware = catchAsyncError(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler('Access Token Expired', 401));
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded) {
      return next(new ErrorHandler('Invalid Token', 401));
    }
    
    const userCheck = await User.findOne({ email: decoded.email });

    if (!userCheck) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Check if seller is approved (if role is seller)
    if (userCheck.role === ROLES.SELLER && userCheck.sellerProfile && !userCheck.sellerProfile.isApproved) {
      return next(new ErrorHandler('Seller account pending approval', 403));
    }

    req.user = {
      userId: userCheck._id,
      name: userCheck.name,
      email: userCheck.email,
      role: userCheck.role,
      // Include seller profile info if needed
      sellerProfile: userCheck.sellerProfile
    };
    next();
  } catch (error) {
    return next(new ErrorHandler('Access Token Expired', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(
        `User role ${req.user.role} is not authorized to access this route`, 
        403
      ));
    }

    next();
  };
};

// Enhanced checkOwnership that works with your product schema
// Enhanced checkOwnership that works with your product schema
exports.checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return next(new ErrorHandler('Resource not found', 404));
      }

      console.log('Debug - User ID:', req.user.userId);
      console.log('Debug - User role:', req.user.role);
      console.log('Debug - Resource seller:', resource.seller);
      console.log('Debug - Resource type:', model.modelName);

      // Admin can access any resource
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      // Check if user owns the resource (for products - matches your product schema)
      if (resource.seller && resource.seller.toString() === req.user.userId.toString()) {
        return next();
      }

      // Check if resource belongs to user (for user-specific resources like orders, addresses)
      if (resource.user && resource.user.toString() === req.user.userId.toString()) {
        return next();
      }

      // Check if it's the user's own profile (for User model)
      if (resource._id && resource._id.toString() === req.user.userId.toString()) {
        return next();
      }

      console.log('Debug - Ownership check failed');
      return next(new ErrorHandler('Not authorized to access this resource', 403));
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if seller is approved
exports.requireApprovedSeller = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler('Not authorized to access this route', 401));
  }

  if (req.user.role !== ROLES.SELLER) {
    return next(new ErrorHandler('Only sellers can access this route', 403));
  }

  if (!req.user.sellerProfile || !req.user.sellerProfile.isApproved) {
    return next(new ErrorHandler('Seller account pending approval', 403));
  }

  next();
};

// Middleware for user to manage their own data
exports.requireSelfOrAdmin = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const targetUserId = req.params[paramName];
      
      // Admin can access any user data
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      // Users can only access their own data
      if (req.user.userId !== targetUserId) {
        return next(new ErrorHandler('Not authorized to access this user data', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export ROLES for use in other files
exports.ROLES = ROLES;