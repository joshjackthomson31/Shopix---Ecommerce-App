import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiCheck, FiDollarSign, FiSearch } from 'react-icons/fi';
import { useOrders } from '../../hooks';
import { LoadingWrapper, Alert } from '../../components/ui';

const AdminOrders = () => {
  const { orders, loading, markAsPaid, markAsDelivered } = useOrders({ admin: true });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, unpaid, delivered, pending

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search || 
        order._id.toLowerCase().includes(search) ||
        order.user?.name?.toLowerCase().includes(search) ||
        order.user?.email?.toLowerCase().includes(search);
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'paid') matchesStatus = order.isPaid;
      else if (statusFilter === 'unpaid') matchesStatus = !order.isPaid;
      else if (statusFilter === 'delivered') matchesStatus = order.isDelivered;
      else if (statusFilter === 'pending') matchesStatus = !order.isDelivered;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleMarkPaid = async (orderId) => {
    if (!window.confirm('Mark this order as paid?')) {
      return;
    }
    setError('');

    const result = await markAsPaid(orderId, {
      id: 'MANUAL_ADMIN',
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      payer: { email_address: 'admin@manual.com' },
    });
    if (!result.success) {
      setError(result.error || 'Failed to update payment status');
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!window.confirm('Mark this order as delivered?')) {
      return;
    }
    setError('');

    const result = await markAsDelivered(orderId);
    if (!result.success) {
      setError(result.error || 'Failed to update order');
    }
  };

  if (loading) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Orders</h1>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Orders</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending Delivery</option>
        </select>
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Paid</th>
                <th className="text-left py-3 px-4">Delivered</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      ₹{order.totalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      {order.isPaid ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Not Paid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {order.isDelivered ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/order/${order._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </Link>
                        {!order.isPaid && (
                          <button
                            onClick={() => handleMarkPaid(order._id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Mark as Paid"
                          >
                            <FiDollarSign size={18} />
                          </button>
                        )}
                        {order.isPaid && !order.isDelivered && (
                          <button
                            onClick={() => handleMarkDelivered(order._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Mark as Delivered"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
