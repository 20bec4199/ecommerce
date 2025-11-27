// pages/ProductsPage.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProductsPage = () => {
  const { state, fetchProducts, updateFilters, addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);
  const previousFilters = useRef(state.products.filters);

  // Clean filters to match backend query parameters
  const cleanFilters = (filters) => {
    const cleaned = {};

    // Map frontend filter names to backend query parameters
    if (filters.searchQuery) cleaned.search = filters.searchQuery;
    if (filters.category) cleaned.category = filters.category;

    // Handle price range - convert to minPrice and maxPrice
    if (filters.priceRange) {
      if (filters.priceRange.min > 0) cleaned.minPrice = filters.priceRange.min;
      if (filters.priceRange.max < 100000) cleaned.maxPrice = filters.priceRange.max;
    }

    // Handle rating
    if (filters.rating && filters.rating > 0) cleaned.rating = filters.rating;

    // Handle sort
    if (filters.sortBy) {
      // Map frontend sort options to backend fields
      const sortMap = {
        'name': 'name',
        'price': 'price',
        'rating': 'rating.average',
        'newest': 'createdAt',
        'popular': 'rating.count'
      };
      cleaned.sortBy = sortMap[filters.sortBy] || 'createdAt';
      cleaned.sortOrder = filters.sortOrder || 'desc';
    }

    // Handle tags
    if (filters.tags && filters.tags.length > 0) {
      cleaned.tags = filters.tags.join(',');
    }

    // Handle inStock filter - you might need backend support for this
    if (filters.inStock === true) {
      // This would require your backend to support inventory filtering
      // For now, we'll skip this or you can implement it later
      console.log('In-stock filter selected - backend support needed');
    }

    // Pagination
    if (filters.page) cleaned.page = filters.page;
    if (filters.limit) cleaned.limit = filters.limit;

    // Always include active status by default
    cleaned.status = 'active';

    console.log('Cleaned filters for backend:', cleaned); // Debug log
    return cleaned;
  };

  // Load products from backend
  const loadProducts = useCallback(
    async (filters = state.products.filters) => {
      try {
        setLoading(true);
        setError(null);

        const cleanedFilters = cleanFilters(filters);
        
        // Ensure we have at least the default filters for initial load
        const finalFilters = {
          status: 'active',
          limit: 12,
          ...cleanedFilters
        };

        await fetchProducts(finalFilters);
      } catch (err) {
        if (err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError') {
          const msg =
            err.response?.data?.message ||
            'Failed to load products. Please try again.';
          setError(msg);
          addNotification(msg, 'error');
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchProducts, addNotification, state.products.filters]
  );

  // Load ALL products on first mount
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('Initial load - fetching all products');
      loadProducts({});
      isInitialMount.current = false;
    }
  }, [loadProducts]);

  // Load products when filters change
  useEffect(() => {
    if (!isInitialMount.current) {
      const filtersChanged =
        JSON.stringify(previousFilters.current) !==
        JSON.stringify(state.products.filters);

      if (filtersChanged) {
        console.log('Filters changed, reloading products:', state.products.filters);
        loadProducts(state.products.filters);
        previousFilters.current = state.products.filters;
      }
    }
  }, [state.products.filters, loadProducts]);

  // Search handler
  const handleSearch = useCallback(
    (searchQuery) => {
      updateFilters({ searchQuery, page: 1 }); // Reset to page 1 when searching
    },
    [updateFilters]
  );

  // Filter handler
  const handleFilterChange = useCallback(
    (newFilters) => {
      updateFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
    },
    [updateFilters]
  );

  // Reset filters
  const handleResetFilters = () => {
    updateFilters({
      category: '',
      searchQuery: '',
      priceRange: { min: 0, max: 100000 },
      rating: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      inStock: false,
      tags: [],
      page: 1
    });
    addNotification('Filters reset successfully', 'success');
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    loadProducts(state.products.filters);
  };

  // Render loading state
  if (loading && state.products.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
            <span className="ml-4 text-gray-600 dark:text-gray-400">
              Loading products...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !loading && state.products.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-red-500 dark:text-red-400 text-6xl mb-4">
                ⚠️
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Unable to Load Products
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover amazing products tailored just for you. Explore our collection and find exactly what you need.
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <ProductFilters
            filters={state.products.filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Section */}
        <div className="mt-8">

          {/* Results Info */}
          {state.products.items.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-900 dark:text-white">
                    {state.products.items.length}
                  </span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {state.products.pagination.totalProducts}
                  </span> products
                  {state.products.filters.searchQuery && (
                    <span> for "<span className="font-semibold">{state.products.filters.searchQuery}</span>"</span>
                  )}
                </p>
              </div>
              
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {state.products.items.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                  🔍
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {state.products.filters.searchQuery 
                    ? `No products found for "${state.products.filters.searchQuery}". Try adjusting your search terms.`
                    : 'No products match your current filters. Try adjusting your criteria.'
                  }
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {state.products.items.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    onAddToCart={() => {
                      // You can add cart functionality here if needed
                      addNotification(`${product.name} added to cart`, 'success');
                    }}
                    onAddToWishlist={() => {
                      // You can add wishlist functionality here if needed
                      addNotification(`${product.name} added to wishlist`, 'success');
                    }}
                  />
                ))}
              </div>

              {/* Loading overlay for subsequent loads */}
              {loading && state.products.items.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center">
                    <LoadingSpinner size="md" />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                      Loading more products...
                    </span>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {state.products.pagination.totalPages > 1 && (
                <div className="mt-12">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Page {state.products.pagination.currentPage} of {state.products.pagination.totalPages}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(state.products.pagination.currentPage - 1)}
                        disabled={state.products.pagination.currentPage === 1 || loading}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Previous
                      </button>

                      {/* Page numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, state.products.pagination.totalPages) }).map((_, index) => {
                          let pageNum;
                          const currentPage = state.products.pagination.currentPage;
                          const totalPages = state.products.pagination.totalPages;

                          if (totalPages <= 5) {
                            pageNum = index + 1;
                          } else if (currentPage <= 3) {
                            pageNum = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                          } else {
                            pageNum = currentPage - 2 + index;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                state.products.pagination.currentPage === pageNum
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(state.products.pagination.currentPage + 1)}
                        disabled={
                          state.products.pagination.currentPage === state.products.pagination.totalPages || loading
                        }
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;