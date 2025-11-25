// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000, // Add timeout
});

// Request cache to prevent duplicates
// const requestCache = new Map();

// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     // Create request signature to identify duplicates
//     const requestSignature = `${config.method}-${config.url}-${JSON.stringify(config.data || config.params)}`;
    
//     // // If same request is already in progress, cancel this one
//     // if (requestCache.has(requestSignature)) {
//     //   const source = requestCache.get(requestSignature);
//     //   source.cancel('Duplicate request cancelled');
//     // }
    
//     // Create cancel token for this request
//     // const source = axios.CancelToken.source();
//     // config.cancelToken = source.token;
//     // requestCache.set(requestSignature, source);
    
//     // Remove from cache after request completes (handled in response interceptor)
//     setTimeout(() => {
//       requestCache.delete(requestSignature);
//     }, 1000);
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Clear tokens on 401
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (userData) => API.post('/auth/login', userData),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  googleAuth: () => {
    window.location.href = '/api/auth/google';
  },
  refreshToken: (refreshToken) => API.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => API.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => API.post('/auth/verify-email', { token }),
  
  // Address management
  addAddress: (addressData) => API.post('/users/addresses', addressData),
  updateAddress: (addressId, addressData) => API.put(`/users/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => API.delete(`/users/addresses/${addressId}`),
  getAddresses: () => API.get('/users/addresses'),
};

// Product API calls
export const productAPI = {
  getProducts: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (typeof filters[key] === 'object') {
          params.append(key, JSON.stringify(filters[key]));
        } else {
          params.append(key, filters[key]);
        }
      }
    });
    return API.get(`/products?${params.toString()}`);
  },
  
  getProduct: (id) => API.get(`/products/${id}`),
  getFeaturedProducts: (limit = 8) => API.get(`/products/featured?limit=${limit}`),
  getRelatedProducts: (id, limit = 4) => API.get(`/products/${id}/related?limit=${limit}`),
  
  // Seller product management
  getSellerProducts: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/products/seller/products?${params.toString()}`);
  },
  
  createProduct: (productData) => API.post('/products', productData),
  updateProduct: (id, productData) => API.put(`/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/products/${id}`),
  updateInventory: (id, inventoryData) => API.patch(`/products/${id}/inventory`, inventoryData),
  
  // Reviews
  getProductReviews: (productId, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/reviews/product/${productId}?${params.toString()}`);
  },
  
  getReviewStats: (productId) => API.get(`/reviews/product/${productId}/stats`),
  addReview: (reviewData) => API.post('/reviews', reviewData),
  markReviewHelpful: (reviewId) => API.post(`/reviews/${reviewId}/helpful`),
  removeHelpful: (reviewId) => API.delete(`/reviews/${reviewId}/helpful`),
  reportReview: (reviewId, reason) => API.post(`/reviews/${reviewId}/report`, { reason }),
  
  // Categories
  getCategories: (options = {}) => {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key] !== undefined && options[key] !== null) {
        params.append(key, options[key]);
      }
    });
    return API.get(`/categories?${params.toString()}`);
  },
  
  getCategory: (id) => API.get(`/categories/${id}`),
  getCategoryProducts: (id, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/categories/${id}/products?${params.toString()}`);
  },
};

// Cart API calls
export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (cartItem) => API.post('/cart/items', cartItem),
  updateQuantity: (itemId, quantity) => API.put(`/cart/items/${itemId}/quantity`, { quantity }),
  removeFromCart: (itemId) => API.delete(`/cart/items/${itemId}`),
  applyCoupon: (couponCode) => API.post('/cart/coupon', { couponCode }),
  removeCoupon: () => API.delete('/cart/coupon'),
  clearCart: () => API.delete('/cart/clear'),
};

// Wishlist API calls
export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist'),
  addToWishlist: (productId) => API.post('/wishlist/items', { productId }),
  removeFromWishlist: (itemId) => API.delete(`/wishlist/items/${itemId}`),
};

// Order API calls
export const orderAPI = {
  getOrders: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/orders?${params.toString()}`);
  },
  
  getOrder: (id) => API.get(`/orders/${id}`),
  createOrder: (orderData) => API.post('/orders', orderData),
  cancelOrder: (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
  getOrderStats: () => API.get('/orders/stats'),
  
  // Seller orders
  getSellerOrders: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/orders/seller/orders?${params.toString()}`);
  },
  
  updateOrderStatus: (id, statusData) => API.put(`/orders/seller/orders/${id}/status`, statusData),
};

// Payment API calls
export const paymentAPI = {
  createPayment: (paymentData) => API.post('/payments/create', paymentData),
  verifyPayment: (paymentData) => API.post('/payments/verify', paymentData),
  processRefund: (paymentId, refundData) => API.post(`/payments/${paymentId}/refund`, refundData),
};

// User API calls
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (profileData) => API.put('/users/profile', profileData),
  updatePassword: (passwordData) => API.put('/users/password', passwordData),
  
  // Seller profile
  createSellerProfile: (sellerData) => API.post('/users/seller/profile', sellerData),
  updateSellerProfile: (sellerData) => API.put('/users/seller/profile', sellerData),
  getSellerDashboard: () => API.get('/users/seller/dashboard'),
  getSellerAnalytics: () => API.get('/users/seller/analytics'),
  
  // Avatar
  uploadAvatar: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return API.post('/users/avatar', formData, config);
  },
};

// Admin API calls
export const adminAPI = {
  // Users
  getAllUsers: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/users/admin/users?${params.toString()}`);
  },
  
  getUserById: (id) => API.get(`/users/admin/users/${id}`),
  updateUserRole: (id, role) => API.put(`/users/admin/users/${id}/role`, { role }),
  approveSeller: (id) => API.put(`/users/admin/sellers/${id}/approve`),
  deleteUser: (id) => API.delete(`/users/admin/users/${id}`),
  getUserStats: () => API.get('/users/admin/users/stats'),
  
  // Products
  updateProduct: (id, productData) => API.put(`/products/admin/${id}`, productData),
  deleteProduct: (id) => API.delete(`/products/admin/${id}`),
  
  // Orders
  getAllOrders: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/orders/admin/orders?${params.toString()}`);
  },
  
  updateOrderStatus: (id, statusData) => API.put(`/orders/admin/orders/${id}/status`, statusData),
  getOrderStats: () => API.get('/orders/admin/orders/stats'),
  
  // Reviews
  getAllReviews: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/reviews/admin/reviews?${params.toString()}`);
  },
  
  updateReviewStatus: (reviewId, statusData) => API.put(`/reviews/admin/reviews/${reviewId}/status`, statusData),
  
  // Categories
  createCategory: (categoryData) => API.post('/categories', categoryData),
  updateCategory: (id, categoryData) => API.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/categories/${id}`),
  
  // Payments
  getAllPayments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return API.get(`/payments/admin/payments?${params.toString()}`);
  },
  
  getPayment: (id) => API.get(`/payments/admin/payments/${id}`),
  getPaymentStats: () => API.get('/payments/admin/payments/stats'),
};

// Utility function for error handling
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1
    };
  }
};

export default API;