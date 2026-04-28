import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUrl';

const ProductCard = ({ product, compact = false }) => {
  if (compact) {
    // Compact version for category preview
    return (
      <Link 
        to={`/product/${product._id}`} 
        className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
      >
        <div className="relative aspect-square">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <h3 className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-indigo-600 mt-1">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        </div>
      </Link>
    );
  }
  
  // Full version
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/product/${product._id}`} className="relative block">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={i < Math.round(product.rating) ? 'fill-current' : ''}
                size={16}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-2">
            ({product.numReviews})
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-2xl font-bold text-indigo-600">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {product.countInStock === 0 && (
            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
