import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiMinus, FiPlus, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useProducts } from '../hooks';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import { LoadingWrapper, Alert } from '../components/ui';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { fetchProduct, createReview } = useProducts({ immediate: false });

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    const result = await fetchProduct(id);
    setProduct(result.success ? result.data : null);
    setError(result.success ? null : result.error);
    setLoading(false);
  }, [fetchProduct, id]);

  useEffect(() => {
    loadProduct();
    setAddedToCart(false);
  }, [loadProduct]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAddedToCart(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);
    setReviewSuccess(false);

    const result = await createReview(id, {
      rating: Number(rating),
      comment,
    });

    if (result.success) {
      setReviewSuccess(true);
      setComment('');
      setRating(5);
      // Refresh product to show new review
      loadProduct();
    } else {
      setReviewError(result.error);
    }
    setReviewLoading(false);
  };

  if (loading) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-red-500 text-lg">{error || 'Product not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center"
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-96 object-contain"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {product.name}
          </h1>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={
                    i < Math.round(product.rating) ? 'fill-current' : ''
                  }
                  size={20}
                />
              ))}
            </div>
            <span className="text-gray-500 ml-2">
              ({product.numReviews} reviews)
            </span>
          </div>

          <p className="text-3xl font-bold text-indigo-600 mb-4">
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Brand:</span>
              <span className="font-medium">{product.brand}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Category:</span>
              <span className="font-medium">{product.category}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Status:</span>
              <span
                className={`font-medium ${
                  product.countInStock > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.countInStock > 0 && (
              <>
                {/* Quantity Selector */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-700">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      <FiMinus />
                    </button>
                    <span className="px-4 py-2 border-x">{qty}</span>
                    <button
                      onClick={() =>
                        setQty(Math.min(product.countInStock, qty + 1))
                      }
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button / Success State */}
                {addedToCart ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center text-green-600 py-3 bg-green-50 rounded-lg">
                      <FiCheck size={20} className="mr-2" />
                      <span className="font-medium">Added to Cart!</span>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to="/cart"
                        className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                      >
                        View Cart
                      </Link>
                      <button
                        onClick={() => navigate(-1)}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>

        {product.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.name}</span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={i < review.rating ? 'fill-current' : ''}
                        size={14}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write a Review Form */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>
          
          {!isAuthenticated ? (
            <p className="text-gray-500">
              Please{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:underline"
              >
                sign in
              </button>{' '}
              to write a review.
            </p>
          ) : (
            <form onSubmit={handleSubmitReview}>
              <Alert type="error" message={reviewError} />
              <Alert type="success" message={reviewSuccess ? 'Review submitted successfully!' : null} />

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <FiStar
                        size={28}
                        className={`${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } cursor-pointer hover:text-yellow-400`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">{rating} / 5</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Share your thoughts about this product..."
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
