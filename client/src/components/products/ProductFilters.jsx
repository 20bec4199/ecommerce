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
    const newFilters = { ...localFilters, inStock: inStock === 'true' };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status) => {
    const newFilters = { ...localFilters, status };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range
          </label>
          <select
            value={`${localFilters.priceRange?.min}-${localFilters.priceRange?.max}`}
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

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating">Highest Rated</option>
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
            value={localFilters.rating}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value={0}>All Ratings</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={1}>1+ Stars</option>
          </select>
        </div>

        {/* Stock Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stock Status
          </label>
          <select
            value={localFilters.inStock?.toString()}
            onChange={(e) => handleInStockChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="">All Status</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        {localFilters.searchQuery && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Search: "{localFilters.searchQuery}"
            <button
              onClick={() => {
                const newFilters = { ...localFilters, searchQuery: '' };
                setLocalFilters(newFilters);
                onFilterChange(newFilters);
                setSearchQuery('');
              }}
              className="ml-1 hover:text-purple-900"
            >
              ×
            </button>
          </span>
        )}
        
        {localFilters.priceRange && (localFilters.priceRange.min > 0 || localFilters.priceRange.max < 100000) && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Price: ${localFilters.priceRange.min} - ${localFilters.priceRange.max}
            <button
              onClick={() => handlePriceRangeChange(0, 100000)}
              className="ml-1 hover:text-blue-900"
            >
              ×
            </button>
          </span>
        )}
        
        {localFilters.rating > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Rating: {localFilters.rating}+ stars
            <button
              onClick={() => handleRatingChange(0)}
              className="ml-1 hover:text-green-900"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;