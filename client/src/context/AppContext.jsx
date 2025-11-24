import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI, wishlistAPI, orderAPI, productAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

// Initial state matching your schema
const initialState = {
  // Cart management (matches Cart model)
  cart: {
    items: [],
    summary: {
      itemsCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0
    },
    coupon: null,
    lastUpdated: null,
    loading: false,
    error: null
  },
  
  // Wishlist management
  wishlist: {
    items: [],
    loading: false,
    error: null
  },
  
  // Products with filters (matches Product model)
  products: {
    items: [],
    filters: {
      category: '',
      priceRange: { min: 0, max: 100000 },
      rating: 0,
      sortBy: 'name',
      searchQuery: '',
      status: 'active',
      tags: [],
      inStock: false
    },
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProducts: 0
    }
  },
  
  // Categories (matches Category model)
  categories: {
    list: [],
    tree: [],
    selectedCategory: null,
    loading: false,
    error: null
  },
  
  // Orders (matches Order model)
  orders: {
    list: [],
    currentOrder: null,
    loading: false,
    error: null
  },
  
  // Reviews (matches Review model)
  reviews: {
    list: [],
    productReviews: {},
    stats: {},
    loading: false,
    error: null
  },
  
  // UI state
  ui: {
    sidebarOpen: false,
    modal: {
      isOpen: false,
      type: '', // 'login', 'cart', 'checkout', 'review', 'address'
      data: null
    },
    notifications: []
  },
  
  // Address management (from User model)
  addresses: {
    list: [],
    selectedAddress: null,
    loading: false,
    error: null
  }
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    
    // Cart actions (matches Cart schema)
    case 'CART_LOADING':
      return { ...state, cart: { ...state.cart, loading: true, error: null } };
    
    case 'SET_CART':
      return { 
        ...state, 
        cart: { 
          ...action.payload,
          loading: false,
          error: null
        } 
      };
    
    case 'ADD_TO_CART':
      const existingItemIndex = state.cart.items.findIndex(item => 
        item.product._id === action.payload.product._id &&
        isVariantEqual(item.variant, action.payload.variant)
      );

      let updatedCartItems;
      if (existingItemIndex > -1) {
        updatedCartItems = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedCartItems = [...state.cart.items, action.payload];
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedCartItems
        }
      };
    
    case 'UPDATE_CART_ITEM':
      const updatedItems = state.cart.items.map(item =>
        item._id === action.payload.itemId
          ? { ...item, ...action.payload.updates }
          : item
      );
      
      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems
        }
      };
    
    case 'REMOVE_FROM_CART':
      const filteredItems = state.cart.items.filter(
        item => item._id !== action.payload
      );
      
      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems
        }
      };
    
    case 'UPDATE_CART_QUANTITY':
      const quantityUpdatedItems = state.cart.items.map(item =>
        item._id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        cart: {
          ...state.cart,
          items: quantityUpdatedItems
        }
      };
    
    case 'APPLY_COUPON':
      return {
        ...state,
        cart: {
          ...state.cart,
          coupon: action.payload
        }
      };
    
    case 'REMOVE_COUPON':
      return {
        ...state,
        cart: {
          ...state.cart,
          coupon: null
        }
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        cart: {
          ...initialState.cart
        }
      };
    
    case 'CART_ERROR':
      return { ...state, cart: { ...state.cart, loading: false, error: action.payload } };
    
    // Wishlist actions
    case 'SET_WISHLIST':
      return { 
        ...state, 
        wishlist: { 
          items: action.payload,
          loading: false,
          error: null
        } 
      };
    
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          items: [...state.wishlist.items, action.payload]
        }
      };
    
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          items: state.wishlist.items.filter(item => item._id !== action.payload)
        }
      };
    
    // Product actions
    case 'PRODUCTS_LOADING':
      return { 
        ...state, 
        products: { ...state.products, loading: true, error: null } 
      };
    
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: {
          ...state.products,
          items: action.payload.products,
          pagination: action.payload.pagination,
          loading: false
        }
      };
    
    case 'UPDATE_PRODUCT_FILTERS':
      return {
        ...state,
        products: {
          ...state.products,
          filters: { ...state.products.filters, ...action.payload },
          pagination: { ...state.products.pagination, currentPage: 1 }
        }
      };
    
    case 'RESET_PRODUCT_FILTERS':
      return {
        ...state,
        products: {
          ...state.products,
          filters: initialState.products.filters,
          pagination: { ...state.products.pagination, currentPage: 1 }
        }
      };
    
    // Category actions
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: {
          ...state.categories,
          list: action.payload.list,
          tree: action.payload.tree,
          loading: false
        }
      };
    
    case 'SELECT_CATEGORY':
      return {
        ...state,
        categories: {
          ...state.categories,
          selectedCategory: action.payload
        }
      };
    
    // Order actions (matches Order schema)
    case 'SET_ORDERS':
      return {
        ...state,
        orders: {
          ...state.orders,
          list: action.payload,
          loading: false
        }
      };
    
    case 'SET_CURRENT_ORDER':
      return {
        ...state,
        orders: {
          ...state.orders,
          currentOrder: action.payload
        }
      };
    
    case 'ADD_ORDER':
      return {
        ...state,
        orders: {
          ...state.orders,
          list: [action.payload, ...state.orders.list]
        },
        cart: {
          ...initialState.cart
        }
      };
    
    case 'UPDATE_ORDER_STATUS':
      const updatedOrders = state.orders.list.map(order =>
        order._id === action.payload.orderId
          ? { ...order, status: action.payload.status }
          : order
      );
      
      return {
        ...state,
        orders: {
          ...state.orders,
          list: updatedOrders
        }
      };
    
    // Review actions (matches Review schema)
    case 'SET_PRODUCT_REVIEWS':
      return {
        ...state,
        reviews: {
          ...state.reviews,
          productReviews: {
            ...state.reviews.productReviews,
            [action.payload.productId]: action.payload.reviews
          },
          stats: {
            ...state.reviews.stats,
            [action.payload.productId]: action.payload.stats
          }
        }
      };
    
    case 'ADD_REVIEW':
      const productId = action.payload.product;
      const currentReviews = state.reviews.productReviews[productId] || [];
      
      return {
        ...state,
        reviews: {
          ...state.reviews,
          productReviews: {
            ...state.reviews.productReviews,
            [productId]: [action.payload, ...currentReviews]
          }
        }
      };
    
    case 'MARK_REVIEW_HELPFUL':
      const { productId: reviewProductId, reviewId, userId } = action.payload;
      const productReviews = state.reviews.productReviews[reviewProductId] || [];
      
      const updatedProductReviews = productReviews.map(review => {
        if (review._id === reviewId) {
          const isAlreadyHelpful = review.helpful.users.includes(userId);
          return {
            ...review,
            helpful: {
              count: isAlreadyHelpful 
                ? Math.max(0, review.helpful.count - 1)
                : review.helpful.count + 1,
              users: isAlreadyHelpful
                ? review.helpful.users.filter(id => id !== userId)
                : [...review.helpful.users, userId]
            }
          };
        }
        return review;
      });
      
      return {
        ...state,
        reviews: {
          ...state.reviews,
          productReviews: {
            ...state.reviews.productReviews,
            [reviewProductId]: updatedProductReviews
          }
        }
      };
    
    // Address actions (from User schema)
    case 'SET_ADDRESSES':
      return {
        ...state,
        addresses: {
          ...state.addresses,
          list: action.payload,
          loading: false
        }
      };
    
    case 'ADD_ADDRESS':
      return {
        ...state,
        addresses: {
          ...state.addresses,
          list: [...state.addresses.list, action.payload]
        }
      };
    
    case 'UPDATE_ADDRESS':
      const updatedAddresses = state.addresses.list.map(address =>
        address._id === action.payload._id ? action.payload : address
      );
      
      return {
        ...state,
        addresses: {
          ...state.addresses,
          list: updatedAddresses
        }
      };
    
    case 'DELETE_ADDRESS':
      return {
        ...state,
        addresses: {
          ...state.addresses,
          list: state.addresses.list.filter(address => address._id !== action.payload)
        }
      };
    
    case 'SELECT_ADDRESS':
      return {
        ...state,
        addresses: {
          ...state.addresses,
          selectedAddress: action.payload
        }
      };
    
    // UI actions
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };
    
    case 'OPEN_MODAL':
      return {
        ...state,
        ui: { 
          ...state.ui, 
          modal: { 
            isOpen: true, 
            type: action.payload.type, 
            data: action.payload.data 
          } 
        }
      };
    
    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, modal: { isOpen: false, type: '', data: null } }
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload]
        }
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            (_, index) => index !== action.payload
          )
        }
      };
    
    default:
      return state;
  }
};

// Helper function to compare variants
const isVariantEqual = (variant1, variant2) => {
  if (!variant1 && !variant2) return true;
  if (!variant1 || !variant2) return false;
  
  return variant1.name === variant2.name && variant1.value === variant2.value;
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Load user-specific data when user logs in
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Reset user-specific data when logged out
      dispatch({ type: 'SET_CART', payload: initialState.cart });
      dispatch({ type: 'SET_WISHLIST', payload: [] });
      dispatch({ type: 'SET_ORDERS', payload: [] });
      dispatch({ type: 'SET_ADDRESSES', payload: user?.address || [] });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load cart
      dispatch({ type: 'CART_LOADING' });
      const cartResponse = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: cartResponse.data });
      
      // Load wishlist
      const wishlistResponse = await wishlistAPI.getWishlist();
      dispatch({ type: 'SET_WISHLIST', payload: wishlistResponse.data });
      
      // Load orders
      const ordersResponse = await orderAPI.getOrders();
      dispatch({ type: 'SET_ORDERS', payload: ordersResponse.data });
      
      // Load addresses (from user profile)
      dispatch({ type: 'SET_ADDRESSES', payload: user.address || [] });
      
    } catch (error) {
      console.error('Error loading user data:', error);
      dispatch({ type: 'CART_ERROR', payload: error.message });
    }
  };

  // Cart actions
  const addToCart = async (product, quantity = 1, variant = null) => {
    try {
      const cartItem = {
        product: product._id,
        quantity,
        price: variant?.price || product.price,
        variant: variant ? { name: variant.name, value: variant.value, price: variant.price } : undefined,
        seller: product.seller
      };

      const response = await cartAPI.addToCart(cartItem);
      dispatch({ type: 'ADD_TO_CART', payload: response.data.item });
      return response.data;
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error.message });
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId);
      dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    try {
      await cartAPI.updateQuantity(itemId, quantity);
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { itemId, quantity } });
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error.message });
      throw error;
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await cartAPI.applyCoupon(couponCode);
      dispatch({ type: 'APPLY_COUPON', payload: response.data.coupon });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const removeCoupon = async () => {
    try {
      await cartAPI.removeCoupon();
      dispatch({ type: 'REMOVE_COUPON' });
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      throw error;
    }
  };

  // Wishlist actions
  const addToWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.addToWishlist(productId);
      dispatch({ type: 'ADD_TO_WISHLIST', payload: response.data });
    } catch (error) {
      throw error;
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await wishlistAPI.removeFromWishlist(itemId);
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemId });
    } catch (error) {
      throw error;
    }
  };

  // Product actions
  const fetchProducts = async (filters = {}) => {
    try {
      dispatch({ type: 'PRODUCTS_LOADING' });
      const response = await productAPI.getProducts(filters);
      dispatch({ 
        type: 'SET_PRODUCTS', 
        payload: {
          products: response.data.products,
          pagination: response.data.pagination
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateFilters = (filters) => {
    dispatch({ type: 'UPDATE_PRODUCT_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_PRODUCT_FILTERS' });
  };

  // Category actions
  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      dispatch({ 
        type: 'SET_CATEGORIES', 
        payload: {
          list: response.data.categories,
          tree: response.data.tree
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const selectCategory = (category) => {
    dispatch({ type: 'SELECT_CATEGORY', payload: category });
  };

  // Order actions
  const createOrder = async (orderData) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      dispatch({ type: 'ADD_ORDER', payload: response.data.order });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchOrder = async (orderId) => {
    try {
      const response = await orderAPI.getOrder(orderId);
      dispatch({ type: 'SET_CURRENT_ORDER', payload: response.data.order });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await orderAPI.cancelOrder(orderId);
      dispatch({ 
        type: 'UPDATE_ORDER_STATUS', 
        payload: { orderId, status: 'cancelled' } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Review actions
  const fetchProductReviews = async (productId, filters = {}) => {
    try {
      const response = await productAPI.getProductReviews(productId, filters);
      dispatch({ 
        type: 'SET_PRODUCT_REVIEWS', 
        payload: {
          productId,
          reviews: response.data.reviews,
          stats: response.data.stats
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const addReview = async (reviewData) => {
    try {
      const response = await productAPI.addReview(reviewData);
      dispatch({ type: 'ADD_REVIEW', payload: response.data.review });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const markReviewHelpful = async (productId, reviewId, userId) => {
    try {
      await productAPI.markReviewHelpful(reviewId);
      dispatch({ 
        type: 'MARK_REVIEW_HELPFUL', 
        payload: { productId, reviewId, userId } 
      });
    } catch (error) {
      throw error;
    }
  };

  // Address actions
  const addAddress = async (addressData) => {
    try {
      const response = await authAPI.addAddress(addressData);
      dispatch({ type: 'ADD_ADDRESS', payload: response.data.address });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await authAPI.updateAddress(addressId, addressData);
      dispatch({ type: 'UPDATE_ADDRESS', payload: response.data.address });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await authAPI.deleteAddress(addressId);
      dispatch({ type: 'DELETE_ADDRESS', payload: addressId });
    } catch (error) {
      throw error;
    }
  };

  const selectAddress = (address) => {
    dispatch({ type: 'SELECT_ADDRESS', payload: address });
  };

  // UI actions
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const openModal = (type, data = null) => {
    dispatch({ type: 'OPEN_MODAL', payload: { type, data } });
  };

  const closeModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const addNotification = (message, type = 'info', duration = 5000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      duration
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Auto remove after duration
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
    }, duration);
  };

  const value = {
    state,
    // Cart
    addToCart,
    removeFromCart,
    updateCartQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    // Wishlist
    addToWishlist,
    removeFromWishlist,
    // Products
    fetchProducts,
    updateFilters,
    resetFilters,
    // Categories
    fetchCategories,
    selectCategory,
    // Orders
    createOrder,
    fetchOrder,
    cancelOrder,
    // Reviews
    fetchProductReviews,
    addReview,
    markReviewHelpful,
    // Addresses
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
    // UI
    toggleSidebar,
    openModal,
    closeModal,
    addNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};