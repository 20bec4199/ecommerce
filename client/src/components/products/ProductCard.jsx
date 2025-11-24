// In your components
import { useApp } from '../../context/AppContext';
import { handleAPIError } from '../../services/api';

const ProductCard = ({ product }) => {
  const { addToCart, addToWishlist, addNotification } = useApp();
  
  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1);
      addNotification('Product added to cart!', 'success');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      addNotification(errorInfo.message, 'error');
    }
  };
  
  const handleAddToWishlist = async () => {
    try {
      await addToWishlist(product._id);
      addNotification('Product added to wishlist!', 'success');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      addNotification(errorInfo.message, 'error');
    }
  };
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handleAddToWishlist}>Add to Wishlist</button>
    </div>
  );
};

export default ProductCard;