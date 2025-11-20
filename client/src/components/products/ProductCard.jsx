import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  return (
    <Card hover className="overflow-hidden group">
      <div className="relative overflow-hidden">
        <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
          <img
            src={product.images?.[0]?.url || '/api/placeholder/300/200'}
            alt={product.images?.[0]?.alt || product.name}
            className={`w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isFeatured && (
            <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
              Featured
            </span>
          )}
          {product.comparePrice && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
        >
          <svg
            className={`w-4 h-4 transition-colors duration-300 ${
              isWishlisted
                ? 'text-red-500 fill-current'
                : 'text-gray-400 hover:text-red-500'
            }`}
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${product.price}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${product.comparePrice}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              {product.rating?.average || '4.5'}
            </span>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
        >
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;