import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    itemsCount,
    subtotal,
    tax,
    shipping,
    total,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Continue Shopping
        </Link>
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

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
            >
              {/* Product Image */}
              <Link to={`/product/${item._id}`}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
              </Link>

              {/* Product Details */}
              <div className="flex-grow">
                <Link
                  to={`/product/${item._id}`}
                  className="text-lg font-medium text-gray-800 hover:text-indigo-600"
                >
                  {item.name}
                </Link>
                <p className="text-indigo-600 font-bold">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => updateQuantity(item._id, item.qty - 1)}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <FiMinus size={16} />
                </button>
                <span className="px-4 py-2 border-x">{item.qty}</span>
                <button
                  onClick={() => updateQuantity(item._id, Math.min(item.qty + 1, item.countInStock))}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={item.qty >= item.countInStock}
                >
                  <FiPlus size={16} />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right min-w-[80px]">
                <p className="font-bold text-gray-800">
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span>Items ({itemsCount})</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              {subtotal < 5000 && (
                <p className="text-sm text-green-600">
                  Add ₹{(5000 - subtotal).toLocaleString('en-IN')} more for free shipping!
                </p>
              )}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
