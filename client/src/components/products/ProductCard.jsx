// components/products/ProductCard.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, state, addNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if product is in wishlist
  const isInWishlist = state.wishlist.items.some(
    (item) => item.product?._id === product._id || item.product === product._id
  );

  const handleAddToCart = async () => {
    console.log(product)
    if (!user) {
      addNotification('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product, 1);
     
      addNotification(`${product.name} added to cart!`, 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
      addNotification(errorMessage, 'error');
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      addNotification('Please login to manage wishlist', 'warning');
      navigate('/login');
      return;
    }

    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        const wishlistItem = state.wishlist.items.find(
          (item) => item.product?._id === product._id || item.product === product._id
        );
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem._id);
          addNotification('Removed from wishlist', 'info');
        }
      } else {
        await addToWishlist(product._id);
        addNotification('Added to wishlist!', 'success');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update wishlist';
      addNotification(errorMessage, 'error');
      console.error('Error updating wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      addNotification('Please login to continue', 'warning');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product, 1);
      addNotification('Product added to cart!', 'success');
      navigate('/cart');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
      addNotification(errorMessage, 'error');
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleProductClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = getDiscountPercentage();
  const isOutOfStock = product.inventory?.quantity === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700">
      {/* Product Image */}
      <div className="relative overflow-hidden cursor-pointer" onClick={handleProductClick}>
        <img
          src={imageError ? '/placeholder-product.jpg' : product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discountPercentage}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle();
          }}
          disabled={wishlistLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white'
          } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg
            className="w-4 h-4"
            fill={isInWishlist ? 'currentColor' : 'none'}
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

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <h3 
          className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors cursor-pointer"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(product.rating)
                      ? 'fill-current'
                      : 'fill-gray-300 dark:fill-gray-600'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          {!isOutOfStock && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
              In Stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isOutOfStock}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            {addingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={addingToCart || isOutOfStock}
            className="flex-1 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;