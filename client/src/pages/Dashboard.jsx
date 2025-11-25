// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/products/ProductCard';
import Card from '../components/ui/Card';

const Dashboard = () => {
  const { user } = useAuth();
  const { state, fetchProducts, addToCart, addToWishlist } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch all products
      await fetchProducts({ limit: 8, sortBy: '-createdAt' });
      
      // For featured products, you might want to fetch with a featured filter
      // For now, we'll use the first 4 products as featured
      setFeaturedProducts(state.products.items.slice(0, 4));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      // You can add a success notification here
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await addToWishlist(product._id);
      // You can add a success notification here
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{state.orders.list.length}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Cart Items</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{state.cart.summary?.itemsCount || 0}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Wishlist</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{state.wishlist.items.length}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Addresses</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{state.addresses.list.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Here's what's happening with your orders and recommendations today.
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Featured Products */}
        <section className="mb-12 animate-slideIn">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Handpicked items just for you</p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Products */}
        <section className="animate-slideIn">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Discover our latest products</p>
            </div>
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.products.items.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;