import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import { useOrders, useProducts, useUsers } from '../../hooks';
import { LoadingWrapper } from '../../components/ui';

const AdminDashboard = () => {
  const { orders, loading: ordersLoading } = useOrders({ admin: true });
  const { products, loading: productsLoading, fetchProducts } = useProducts({ immediate: false });
  const { users, loading: usersLoading } = useUsers();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Compute stats from loaded data (useMemo instead of useState + useEffect)
  const stats = useMemo(() => {
    if (ordersLoading || productsLoading || usersLoading) {
      return { totalOrders: 0, totalProducts: 0, totalUsers: 0, totalRevenue: 0 };
    }
    const totalRevenue = orders.reduce(
      (acc, order) => (order.isPaid ? acc + order.totalPrice : acc),
      0
    );
    return {
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length,
      totalRevenue,
    };
  }, [orders, products, users, ordersLoading, productsLoading, usersLoading]);

  // Get last 5 orders
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (ordersLoading || productsLoading || usersLoading) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiShoppingBag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiPackage className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiUsers className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiDollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/products"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiPackage className="text-indigo-600 mb-3" size={32} />
          <h3 className="text-lg font-bold text-gray-800">Manage Products</h3>
          <p className="text-gray-500">Add, edit, or remove products</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiShoppingBag className="text-indigo-600 mb-3" size={32} />
          <h3 className="text-lg font-bold text-gray-800">Manage Orders</h3>
          <p className="text-gray-500">View and update order status</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <FiUsers className="text-indigo-600 mb-3" size={32} />
          <h3 className="text-lg font-bold text-gray-800">Manage Users</h3>
          <p className="text-gray-500">View and manage user accounts</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-indigo-600 hover:underline">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/order/${order._id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.isDelivered
                            ? 'bg-green-100 text-green-800'
                            : order.isPaid
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.isDelivered
                          ? 'Delivered'
                          : order.isPaid
                          ? 'Paid'
                          : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
