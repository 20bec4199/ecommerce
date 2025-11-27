// components/products/ProductFilters.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

const ProductFilters = ({ filters, onFilterChange, onSearch }) => {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.searchQuery) {
        onSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters.searchQuery, onSearch]);

  // Update local filters when global filters change
  useEffect(() => {
    setLocalFilters(filters);
    setSearchQuery(filters.searchQuery || '');
  }, [filters]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceRangeChange = (min, max) => {
    const newFilters = { ...localFilters, priceRange: { min, max } };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category) => {
    const newFilters = { ...localFilters, category: category || '' };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy) => {
    const newFilters = { ...localFilters, sortBy };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = { ...localFilters, rating: Number(rating) };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleInStockChange = (inStock) => {
    const newFilters = { ...localFilters, inStock };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status) => {
    const newFilters = { ...localFilters, status };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Reset all filters
  const handleResetFilters = () => {
    const resetFilters = {
      searchQuery: '',
      category: '',
      priceRange: { min: 0, max: 100000 },
      rating: 0,
      sortBy: 'name', // Match your initial state
      inStock: false,
      status: 'active',
      tags: []
    };
    setLocalFilters(resetFilters);
    setSearchQuery('');
    onFilterChange(resetFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    localFilters.searchQuery ||
    localFilters.category ||
    localFilters.rating > 0 ||
    localFilters.inStock ||
    localFilters.status !== 'active' ||
    (localFilters.priceRange && (localFilters.priceRange.min > 0 || localFilters.priceRange.max < 100000));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Products
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, description..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={localFilters.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {state.categories.list.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range
          </label>
          <select
            value={`${localFilters.priceRange?.min || 0}-${localFilters.priceRange?.max || 100000}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split('-').map(Number);
              handlePriceRangeChange(min, max);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="0-100000">All Prices</option>
            <option value="0-25">Under $25</option>
            <option value="25-50">$25 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-500">$200 - $500</option>
            <option value="500-100000">Over $500</option>
          </select>
        </div>

        {/* Sort By - Updated to work with your backend and initial state */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={localFilters.sortBy || 'name'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating.average">Highest Rated</option>
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Rating
          </label>
          <select
            value={localFilters.rating || 0}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value={0}>All Ratings</option>
            <option value={4.5}>4.5+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={2}>2+ Stars</option>
          </select>
        </div>

        {/* Stock Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stock Status
          </label>
          <select
            value={localFilters.inStock ? 'true' : 'false'}
            onChange={(e) => handleInStockChange(e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="false">All Stock</option>
            <option value="true">In Stock Only</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Status
          </label>
          <select
            value={localFilters.status || 'active'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="">All Status</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters:
            </span>
            <button
              onClick={handleResetFilters}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localFilters.searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Search: "{localFilters.searchQuery}"
                <button
                  onClick={() => {
                    const newFilters = { ...localFilters, searchQuery: '' };
                    setLocalFilters(newFilters);
                    onFilterChange(newFilters);
                    setSearchQuery('');
                  }}
                  className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {localFilters.category && state.categories.list.find(cat => cat._id === localFilters.category) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Category: {state.categories.list.find(cat => cat._id === localFilters.category)?.name}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {localFilters.priceRange && (localFilters.priceRange.min > 0 || localFilters.priceRange.max < 100000) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Price: ${localFilters.priceRange.min} - ${localFilters.priceRange.max}
                <button
                  onClick={() => handlePriceRangeChange(0, 100000)}
                  className="ml-2 hover:text-green-900 dark:hover:text-green-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {localFilters.rating > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Rating: {localFilters.rating}+ stars
                <button
                  onClick={() => handleRatingChange(0)}
                  className="ml-2 hover:text-yellow-900 dark:hover:text-yellow-100"
                >
                  ×
                </button>
              </span>
            )}

            {localFilters.inStock && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                In Stock Only
                <button
                  onClick={() => handleInStockChange(false)}
                  className="ml-2 hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  ×
                </button>
              </span>
            )}

            {localFilters.status && localFilters.status !== 'active' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Status: {localFilters.status}
                <button
                  onClick={() => handleStatusChange('active')}
                  className="ml-2 hover:text-red-900 dark:hover:text-red-100"
                >
                  ×
                </button>
              </span>
            )}

            {localFilters.sortBy && localFilters.sortBy !== 'name' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Sort: {localFilters.sortBy}
                <button
                  onClick={() => handleSortChange('name')}
                  className="ml-2 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;