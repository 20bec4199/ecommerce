// context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI, wishlistAPI, orderAPI, productAPI, authAPI, paymentAPI } from '../services/api';
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

  // Products with filters
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

  // Categories
  categories: {
    list: [],
    tree: [],
    selectedCategory: null,
    loading: false,
    error: null
  },

  // Orders
  orders: {
    list: [],
    currentOrder: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      dateRange: {},
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  },

  // Payments
  payments: {
    list: [],
    currentPayment: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      paymentMethod: '',
      startDate: '',
      endDate: ''
    }
  },

  // Reviews
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
      type: '',
      data: null
    },
    notifications: []
  },

  // Address management
  addresses: {
    list: [],
    selectedAddress: null,
    loading: false,
    error: null
  },

  // User profile management
  userProfile: {
    profile: null,
    loading: false,
    error: null
  },

  // Checkout state
  checkout: {
    step: 'cart', // cart → shipping → payment → review → confirmation
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: null,
    orderSummary: null,
    loading: false,
    error: null
  }
};

// Reducer function with optimistic updates
const appReducer = (state, action) => {
  switch (action.type) {
    // Cart actions
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

    case 'ADD_TO_CART_OPTIMISTIC':
      const newItem = action.payload;
      const existingItemIndex = state.cart.items.findIndex(item =>
        item.product._id === newItem.product._id &&
        isVariantEqual(item.variant, newItem.variant)
      );

      let updatedCartItemsOptimistic;
      if (existingItemIndex > -1) {
        updatedCartItemsOptimistic = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        updatedCartItemsOptimistic = [...state.cart.items, newItem];
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedCartItemsOptimistic,
          loading: false,
          error: null
        }
      };

    case 'UPDATE_CART_AFTER_ADD':
      const { tempId, realItem, cart } = action.payload;
      const itemsAfterAdd = state.cart.items.map(item =>
        item._id === tempId ? { ...realItem, _id: realItem._id } : item
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          items: itemsAfterAdd,
          summary: cart.summary
        }
      };

    case 'REMOVE_FROM_CART_OPTIMISTIC':
      const filteredItemsOptimistic = state.cart.items.filter(
        item => item._id !== action.payload
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItemsOptimistic
        }
      };

    case 'UPDATE_CART_QUANTITY_OPTIMISTIC':
      const quantityUpdatedItemsOptimistic = state.cart.items.map(item =>
        item._id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          items: quantityUpdatedItemsOptimistic
        }
      };

    case 'REMOVE_OPTIMISTIC_ITEM':
      const itemsAfterRemove = state.cart.items.filter(
        item => item._id !== action.payload
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          items: itemsAfterRemove
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

    // Order actions
    case 'ORDERS_LOADING':
      return {
        ...state,
        orders: { ...state.orders, loading: true, error: null }
      };

    case 'SET_ORDERS':
      return {
        ...state,
        orders: {
          ...state.orders,
          list: action.payload.orders || action.payload,
          loading: false,
          error: null
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
        },
        checkout: {
          ...initialState.checkout
        }
      };

    case 'UPDATE_ORDER_STATUS':
      const updatedOrders = state.orders.list.map(order =>
        order._id === action.payload.orderId
          ? { ...order, status: action.payload.status }
          : order
      );

      const updatedCurrentOrder = state.orders.currentOrder?._id === action.payload.orderId
        ? { ...state.orders.currentOrder, status: action.payload.status }
        : state.orders.currentOrder;

      return {
        ...state,
        orders: {
          ...state.orders,
          list: updatedOrders,
          currentOrder: updatedCurrentOrder
        }
      };

    case 'UPDATE_ORDER_FILTERS':
      return {
        ...state,
        orders: {
          ...state.orders,
          filters: { ...state.orders.filters, ...action.payload }
        }
      };

    case 'RESET_ORDER_FILTERS':
      return {
        ...state,
        orders: {
          ...state.orders,
          filters: initialState.orders.filters
        }
      };

    // Payment actions
    case 'PAYMENTS_LOADING':
      return {
        ...state,
        payments: { ...state.payments, loading: true, error: null }
      };

    case 'SET_PAYMENTS':
      return {
        ...state,
        payments: {
          ...state.payments,
          list: action.payload.payments || action.payload,
          loading: false,
          error: null
        }
      };

    case 'SET_CURRENT_PAYMENT':
      return {
        ...state,
        payments: {
          ...state.payments,
          currentPayment: action.payload
        }
      };

    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: {
          ...state.payments,
          list: [action.payload, ...state.payments.list]
        }
      };

    case 'UPDATE_PAYMENT_STATUS':
      const updatedPayments = state.payments.list.map(payment =>
        payment._id === action.payload.paymentId
          ? { ...payment, status: action.payload.status }
          : payment
      );

      const updatedCurrentPayment = state.payments.currentPayment?._id === action.payload.paymentId
        ? { ...state.payments.currentPayment, status: action.payload.status }
        : state.payments.currentPayment;

      return {
        ...state,
        payments: {
          ...state.payments,
          list: updatedPayments,
          currentPayment: updatedCurrentPayment
        }
      };

    case 'UPDATE_PAYMENT_FILTERS':
      return {
        ...state,
        payments: {
          ...state.payments,
          filters: { ...state.payments.filters, ...action.payload }
        }
      };

    // Checkout actions
    case 'SET_CHECKOUT_STEP':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          step: action.payload
        }
      };

    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          shippingAddress: action.payload
        }
      };

    case 'SET_BILLING_ADDRESS':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          billingAddress: action.payload
        }
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          paymentMethod: action.payload
        }
      };

    case 'SET_ORDER_SUMMARY':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          orderSummary: action.payload
        }
      };

    case 'CHECKOUT_LOADING':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          loading: action.payload,
          error: action.payload ? null : state.checkout.error
        }
      };

    case 'CHECKOUT_ERROR':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          loading: false,
          error: action.payload
        }
      };

    case 'RESET_CHECKOUT':
      return {
        ...state,
        checkout: {
          ...initialState.checkout
        }
      };

    // Review actions
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

    // Address actions
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
      const newAddressList = action.payload.addresses
        ? action.payload.addresses
        : [...state.addresses.list, action.payload];

      return {
        ...state,
        addresses: {
          ...state.addresses,
          list: newAddressList
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

    // User Profile actions
    case 'PROFILE_LOADING':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          loading: true,
          error: null
        }
      };

    case 'SET_PROFILE':
      return {
        ...state,
        userProfile: {
          profile: action.payload,
          loading: false,
          error: null
        }
      };

    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        userProfile: {
          profile: { ...state.userProfile.profile, ...action.payload },
          loading: false,
          error: null
        }
      };

    case 'PROFILE_ERROR':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          loading: false,
          error: action.payload
        }
      };

    case 'UPDATE_PASSWORD_SUCCESS':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          loading: false,
          error: null
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
      dispatch({ type: 'SET_PAYMENTS', payload: [] });
      dispatch({ type: 'SET_ADDRESSES', payload: [] });
      dispatch({ type: 'RESET_CHECKOUT' });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user profile first
      await fetchUserProfile();
      
      // Load addresses before other data
      try {
        const addressesResponse = await authAPI.getAddresses();
        dispatch({ type: 'SET_ADDRESSES', payload: addressesResponse.data.addresses || [] });
      } catch (error) {
        console.warn('Error loading addresses:', error);
        dispatch({ type: 'SET_ADDRESSES', payload: [] });
      }
      
      // Load other user data in parallel
      await Promise.all([
        cartAPI.getCart().then(response => 
          dispatch({ type: 'SET_CART', payload: response.data.cart })
        ).catch(error => {
          console.warn('Error loading cart:', error);
          dispatch({ type: 'CART_ERROR', payload: error.message });
        }),
        
        wishlistAPI.getWishlist().then(response =>
          dispatch({ type: 'SET_WISHLIST', payload: response.data.wishlist || [] })
        ).catch(error => console.warn('Error loading wishlist:', error)),
        
        orderAPI.getOrders().then(response =>
          dispatch({ type: 'SET_ORDERS', payload: response.data.orders || [] })
        ).catch(error => console.warn('Error loading orders:', error)),
        
        paymentAPI.getUserPayments().then(response =>
          dispatch({ type: 'SET_PAYMENTS', payload: response.data.payments || [] })
        ).catch(error => console.warn('Error loading payments:', error))
      ]);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Cart actions with optimistic updates
  const addToCart = async (product, quantity = 1, variant = null) => {
    try {
      const cartItem = {
        product: product._id,
        quantity,
        price: variant?.price || product.price,
        variant: variant ? { name: variant.name, value: variant.value, price: variant.price } : undefined,
        seller: product.seller
      };

      // Optimistically update UI
      const optimisticItem = {
        _id: `temp-${Date.now()}`,
        product: { _id: product._id, name: product.name, images: product.images },
        quantity,
        price: variant?.price || product.price,
        variant: variant || undefined,
        seller: product.seller
      };

      dispatch({ type: 'ADD_TO_CART_OPTIMISTIC', payload: optimisticItem });

      const response = await cartAPI.addToCart(cartItem);

      // Replace optimistic item with real data
      dispatch({
        type: 'UPDATE_CART_AFTER_ADD', payload: {
          tempId: optimisticItem._id,
          realItem: response.data.item,
          cart: response.data.cart
        }
      });

      return response.data;
    } catch (error) {
      // Rollback on error
      dispatch({ type: 'REMOVE_OPTIMISTIC_ITEM', payload: `temp-${Date.now()}` });
      dispatch({ type: 'CART_ERROR', payload: error.message });
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      // Optimistically remove from UI
      dispatch({ type: 'REMOVE_FROM_CART_OPTIMISTIC', payload: itemId });

      await cartAPI.removeFromCart(itemId);

      // No need to reload cart - we already updated optimistically
    } catch (error) {
      // Rollback on error - reload actual cart state
      const cartResponse = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: cartResponse.data.cart });
      dispatch({ type: 'CART_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    try {
      // Optimistically update quantity in UI
      dispatch({ type: 'UPDATE_CART_QUANTITY_OPTIMISTIC', payload: { itemId, quantity } });

      await cartAPI.updateQuantity(itemId, quantity);

      // No need to reload cart - we already updated optimistically
    } catch (error) {
      // Rollback on error - reload actual cart state
      const cartResponse = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: cartResponse.data.cart });
      dispatch({ type: 'CART_ERROR', payload: error.message });
      throw error;
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await cartAPI.applyCoupon(couponCode);
      dispatch({ type: 'SET_CART', payload: response.data.cart });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await cartAPI.removeCoupon();
      dispatch({ type: 'SET_CART', payload: response.data.cart });
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartAPI.clearCart();
      dispatch({ type: 'SET_CART', payload: response.data.cart });
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
    dispatch({ type: 'CHECKOUT_LOADING', payload: true });
    const response = await orderAPI.createOrder(orderData);
    
    // Only add order to state, don't clear cart yet
    dispatch({ type: 'ADD_ORDER', payload: response.data.order });
    
    // Show success notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        message: 'Order created successfully!',
        type: 'success',
        duration: 5000
      }
    });
    
    return response.data;
  } catch (error) {
    dispatch({ type: 'CHECKOUT_ERROR', payload: error.message });
    throw error;
  } finally {
    dispatch({ type: 'CHECKOUT_LOADING', payload: false });
  }
};

  const fetchOrders = async (filters = {}) => {
    try {
      dispatch({ type: 'ORDERS_LOADING' });
      const response = await orderAPI.getOrders(filters);
      dispatch({ type: 'SET_ORDERS', payload: response.data.orders });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchOrder = async (orderId) => {
    try {
      dispatch({ type: 'ORDERS_LOADING' });
      const response = await orderAPI.getOrder(orderId);
      dispatch({ type: 'SET_CURRENT_ORDER', payload: response.data.order });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const cancelOrder = async (orderId, reason = '') => {
    try {
      const response = await orderAPI.cancelOrder(orderId, reason);
      dispatch({
        type: 'UPDATE_ORDER_STATUS',
        payload: { orderId, status: 'cancelled' }
      });
      
      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Order cancelled successfully',
          type: 'success',
          duration: 5000
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateOrderFilters = (filters) => {
    dispatch({ type: 'UPDATE_ORDER_FILTERS', payload: filters });
  };

  const resetOrderFilters = () => {
    dispatch({ type: 'RESET_ORDER_FILTERS' });
  };

  // Payment actions
  const createRazorpayOrder = async (orderData) => {
    try {
      dispatch({ type: 'CHECKOUT_LOADING', payload: true });
      const response = await paymentAPI.createRazorpayOrder(orderData);
      return response.data;
    } catch (error) {
      dispatch({ type: 'CHECKOUT_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'CHECKOUT_LOADING', payload: false });
    }
  };

  const verifyRazorpayPayment = async (verificationData) => {
    try {
      dispatch({ type: 'CHECKOUT_LOADING', payload: true });
      const response = await paymentAPI.verifyRazorpayPayment(verificationData);
      
      // Add payment to state
      dispatch({ type: 'ADD_PAYMENT', payload: response.data.payment });
      
      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Payment completed successfully!',
          type: 'success',
          duration: 5000
        }
      });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'CHECKOUT_ERROR', payload: error.message });
      
      // Show error notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Payment verification failed',
          type: 'error',
          duration: 5000
        }
      });
      
      throw error;
    } finally {
      dispatch({ type: 'CHECKOUT_LOADING', payload: false });
    }
  };

  const handleRazorpayFailure = async (failureData) => {
    try {
      const response = await paymentAPI.handleRazorpayFailure(failureData);
      dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { paymentId: failureData.paymentId, status: 'failed' } });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createCODOrder = async (orderData) => {
    try {
      dispatch({ type: 'CHECKOUT_LOADING', payload: true });
      const response = await paymentAPI.createCODOrder(orderData);
      
      // Add payment to state
      dispatch({ type: 'ADD_PAYMENT', payload: response.data.payment });
      
      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'COD order placed successfully!',
          type: 'success',
          duration: 5000
        }
      });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'CHECKOUT_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'CHECKOUT_LOADING', payload: false });
    }
  };

  const fetchPayments = async (filters = {}) => {
    try {
      dispatch({ type: 'PAYMENTS_LOADING' });
      const response = await paymentAPI.getUserPayments(filters);
      dispatch({ type: 'SET_PAYMENTS', payload: response.data.payments });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchPaymentDetails = async (paymentId) => {
    try {
      dispatch({ type: 'PAYMENTS_LOADING' });
      const response = await paymentAPI.getPaymentDetails(paymentId);
      dispatch({ type: 'SET_CURRENT_PAYMENT', payload: response.data.payment });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updatePaymentFilters = (filters) => {
    dispatch({ type: 'UPDATE_PAYMENT_FILTERS', payload: filters });
  };

  // Checkout actions
  const setCheckoutStep = (step) => {
    dispatch({ type: 'SET_CHECKOUT_STEP', payload: step });
  };

  const setShippingAddress = (address) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
  };

  const setBillingAddress = (address) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
  };

  const setPaymentMethod = (method) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const setOrderSummary = (summary) => {
    dispatch({ type: 'SET_ORDER_SUMMARY', payload: summary });
  };

  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' });
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
      
      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Review added successfully!',
          type: 'success',
          duration: 5000
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Address actions
  const addAddress = async (addressData) => {
    try {
      const response = await authAPI.addAddress(addressData);
      dispatch({ type: 'ADD_ADDRESS', payload: response.data });
      
      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Address added successfully!',
          type: 'success',
          duration: 3000
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await authAPI.updateAddress(addressId, addressData);
      const updatedAddress = response.data.addresses?.find(addr => addr._id === addressId);
      if (updatedAddress) {
        dispatch({ type: 'UPDATE_ADDRESS', payload: updatedAddress });
      }
      
      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Address updated successfully!',
          type: 'success',
          duration: 3000
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const response = await authAPI.deleteAddress(addressId);
      dispatch({ type: 'DELETE_ADDRESS', payload: addressId });
      
      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Address deleted successfully!',
          type: 'success',
          duration: 3000
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const selectAddress = (address) => {
    dispatch({ type: 'SELECT_ADDRESS', payload: address });
  };

  // User Profile actions
  const fetchUserProfile = async () => {
    try {
      dispatch({ type: 'PROFILE_LOADING' });
      const response = await authAPI.getProfile();
      dispatch({ type: 'SET_PROFILE', payload: response.data.user });
      return response.data;
    } catch (error) {
      dispatch({ type: 'PROFILE_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'PROFILE_LOADING' });
      const response = await authAPI.updateProfile(profileData);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: response.data.user });

      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Profile updated successfully',
          type: 'success',
          duration: 3000
        }
      });

      return response.data;
    } catch (error) {
      dispatch({ type: 'PROFILE_ERROR', payload: error.message });

      // Show error notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: error.response?.data?.message || 'Failed to update profile',
          type: 'error',
          duration: 5000
        }
      });

      throw error;
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      dispatch({ type: 'PROFILE_LOADING' });
      const response = await authAPI.updatePassword(passwordData);
      dispatch({ type: 'UPDATE_PASSWORD_SUCCESS' });

      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Password updated successfully',
          type: 'success',
          duration: 3000
        }
      });

      return response.data;
    } catch (error) {
      dispatch({ type: 'PROFILE_ERROR', payload: error.message });

      // Show error notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: error.response?.data?.message || 'Failed to update password',
          type: 'error',
          duration: 5000
        }
      });

      throw error;
    }
  };

  const uploadAvatar = async (formData) => {
    try {
      dispatch({ type: 'PROFILE_LOADING' });
      const response = await userAPI.uploadAvatar(formData);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: response.data.user });

      // Show success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: 'Profile picture updated successfully',
          type: 'success',
          duration: 3000
        }
      });

      return response.data;
    } catch (error) {
      dispatch({ type: 'PROFILE_ERROR', payload: error.message });

      // Show error notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          message: error.response?.data?.message || 'Failed to upload profile picture',
          type: 'error',
          duration: 5000
        }
      });

      throw error;
    }
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
    fetchOrders,
    fetchOrder,
    cancelOrder,
    updateOrderFilters,
    resetOrderFilters,
    // Payments
    createRazorpayOrder,
    verifyRazorpayPayment,
    handleRazorpayFailure,
    createCODOrder,
    fetchPayments,
    fetchPaymentDetails,
    updatePaymentFilters,
    // Checkout
    setCheckoutStep,
    setShippingAddress,
    setBillingAddress,
    setPaymentMethod,
    setOrderSummary,
    resetCheckout,
    // Reviews
    fetchProductReviews,
    addReview,
    // Addresses
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
    // User Profile
    fetchUserProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
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