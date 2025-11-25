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

  // Clean filters so that backend gets only active filters
  const cleanFilters = (filters) => {
    const cleaned = {};

    if (filters.searchQuery) cleaned.searchQuery = filters.searchQuery;
    if (filters.category) cleaned.category = filters.category;

    if (filters.inStock === true) cleaned.inStock = true;
    if (filters.rating && filters.rating > 0) cleaned.rating = filters.rating;

    if (filters.sortBy) cleaned.sortBy = filters.sortBy;

    if (filters.tags && filters.tags.length > 0) cleaned.tags = filters.tags;

    // Only send custom price range when user modifies it
    if (
      filters.priceRange &&
      (filters.priceRange.min !== 0 || filters.priceRange.max !== 100000)
    ) {
      cleaned.priceRange = filters.priceRange;
    }

    // Pagination
    if (filters.page) cleaned.page = filters.page;

    return cleaned;
  };

  // Load products from backend
  const loadProducts = useCallback(
    async (filters = state.products.filters) => {
      try {
        setLoading(true);
        setError(null);

        const cleanedFilters = cleanFilters(filters);

        await fetchProducts(cleanedFilters);
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
        loadProducts(state.products.filters);
        previousFilters.current = state.products.filters;
      }
    }
  }, [state.products.filters, loadProducts]);

  // Search handler
  const handleSearch = useCallback(
    (searchQuery) => {
      updateFilters({ searchQuery });
    },
    [updateFilters]
  );

  // Filter handler
  const handleFilterChange = useCallback(
    (newFilters) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

  // Reset filters
  const handleResetFilters = () => {
    updateFilters({});
    addNotification('Filters reset successfully', 'success');
  };

  // Pagination
  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
  };

  const handleRetry = () => {
    loadProducts(state.products.filters);
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 text-lg mb-4">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Our Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our collection
          </p>
        </div>

        {/* Filters */}
        <ProductFilters
          filters={state.products.filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {/* Products */}
        <div className="mt-8">

          {loading && state.products.items.length === 0 ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : state.products.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No products found.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 mt-4 bg-purple-600 text-white rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing {state.products.items.length} of{' '}
                  {state.products.pagination.totalProducts} products
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-purple-600 dark:text-purple-400"
                >
                  Clear Filters
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {state.products.items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {state.products.pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center space-x-2">
                  <button
                    onClick={() =>
                      handlePageChange(
                        state.products.pagination.currentPage - 1
                      )
                    }
                    disabled={
                      state.products.pagination.currentPage === 1 || loading
                    }
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from({
                    length: state.products.pagination.totalPages,
                  }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        state.products.pagination.currentPage === index + 1
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      handlePageChange(
                        state.products.pagination.currentPage + 1
                      )
                    }
                    disabled={
                      state.products.pagination.currentPage ===
                        state.products.pagination.totalPages || loading
                    }
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
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
