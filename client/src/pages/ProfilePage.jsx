import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks';
import { LoadingSpinner } from '../components/ui';

const ProfilePage = () => {
  const { user } = useAuth();
  const { orders, loading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const search = searchTerm.toLowerCase();
    return orders.filter(order => 
      order._id.toLowerCase().includes(search)
    );
  }, [orders, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/"
        className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center"
      >
        ← Back to Shop
      </Link>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500">Name</label>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Role</label>
                <p className="font-medium">
                  {user?.isAdmin ? 'Administrator' : 'Customer'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Orders</h2>

            {/* Search */}
            {orders.length > 0 && (
              <div className="relative max-w-xs mb-4">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No orders yet.</p>
                <Link
                  to="/"
                  className="text-indigo-600 hover:underline"
                >
                  Start Shopping
                </Link>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders match your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Paid</th>
                      <th className="text-left py-3 px-4">Delivered</th>
                      <th className="text-left py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          ₹{order.totalPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {order.isPaid ? (
                            <span className="text-green-600">
                              {new Date(order.paidAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {order.isDelivered ? (
                            <span className="text-green-600">
                              {new Date(order.deliveredAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/order/${order._id}`}
                            className="text-indigo-600 hover:underline"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
