import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiTruck, FiCreditCard } from 'react-icons/fi';
import { useOrders } from '../hooks';
import { getImageUrl } from '../utils/imageUrl';
import { LoadingWrapper, Alert } from '../components/ui';

const OrderPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { fetchOrder, markAsPaid } = useOrders({ immediate: false });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  
  // Check if this is a newly placed order (coming from checkout)
  const isNewOrder = location.state?.newOrder || false;

  useEffect(() => {
    fetchOrder(id).then(result => {
      setOrder(result.success ? result.data : null);
      setError(result.success ? null : result.error);
      setLoading(false);
    });
  }, [id, fetchOrder]);

  const handlePayNow = async () => {
    setPaying(true);
    setPayError(null);

    const paymentResult = {
      id: `PAY-${Date.now()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: order.user?.email || 'customer@shopix.com',
    };

    const result = await markAsPaid(id, paymentResult);

    if (result.success) {
      // Refetch order to update all status badges
      const refreshed = await fetchOrder(id);
      if (refreshed.success) setOrder(refreshed.data);
    } else {
      setPayError(result.error || 'Payment failed');
    }

    setPaying(false);
  };

  if (loading) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-red-500 text-lg">{error || 'Order not found'}</p>
        <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/profile"
        className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center"
      >
        ← Back to My Orders
      </Link>

      {/* Success message for newly placed orders */}
      {isNewOrder && (
        <Alert 
          type="success" 
          message="Order placed successfully! Thank you for your purchase." 
          className="mb-6"
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              order.isPaid
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {order.isPaid ? 'Paid' : 'Pending Payment'}
          </span>
        </div>

        {/* Order Status */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <FiCheckCircle
              className={`mr-3 ${
                order.isPaid ? 'text-green-500' : 'text-gray-400'
              }`}
              size={24}
            />
            <div>
              <p className="font-medium">Order Placed</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <FiCreditCard
              className={`mr-3 ${
                order.isPaid ? 'text-green-500' : 'text-gray-400'
              }`}
              size={24}
            />
            <div>
              <p className="font-medium">Payment</p>
              <p className="text-sm text-gray-500">
                {order.isPaid
                  ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}`
                  : 'Not Paid'}
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <FiTruck
              className={`mr-3 ${
                order.isDelivered ? 'text-green-500' : 'text-gray-400'
              }`}
              size={24}
            />
            <div>
              <p className="font-medium">Delivery</p>
              <p className="text-sm text-gray-500">
                {order.isDelivered
                  ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}`
                  : 'Not Delivered'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-500">
                      {item.qty} x ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="font-bold">
                    ₹{(item.qty * item.price).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Shipping Address
              </h2>
              <div className="p-4 border rounded-lg">
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Payment Method
              </h2>
              <div className="p-4 border rounded-lg">
                <p>{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>₹{order.itemsPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{order.taxPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {order.shippingPrice === 0
                      ? 'Free'
                      : `₹${order.shippingPrice.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {!order.isPaid && (
                <>
                  {payError && <Alert type="error" message={payError} className="mt-4" />}
                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {paying ? 'Processing...' : 'Pay Now'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="text-indigo-600 hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderPage;
