import { useState, useMemo } from 'react';
import { FiTrash2, FiShield, FiShieldOff, FiSearch } from 'react-icons/fi';
import { useUsers } from '../../hooks';
import { LoadingWrapper, Alert } from '../../components/ui';

const AdminUsers = () => {
  const { users, loading, updateUser, deleteUser } = useUsers();
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, admin, customer

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user._id.toLowerCase().includes(search);
      
      let matchesRole = true;
      if (roleFilter === 'admin') matchesRole = user.isAdmin;
      else if (roleFilter === 'customer') matchesRole = !user.isAdmin;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleToggleAdmin = async (userId, currentStatus) => {
    const action = currentStatus ? 'remove admin rights from' : 'make admin';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    setError('');

    const result = await updateUser(userId, { isAdmin: !currentStatus });
    if (!result.success) {
      setError(result.error || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    setError('');

    const result = await deleteUser(userId);
    if (!result.success) {
      setError(result.error || 'Failed to delete user');
    }
  };

  if (loading) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Users</h1>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Users</option>
          <option value="admin">Admins</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      {user._id.slice(-8)}
                    </td>
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.isAdmin
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                          className={`p-2 rounded ${
                            user.isAdmin
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        >
                          {user.isAdmin ? (
                            <FiShieldOff size={18} />
                          ) : (
                            <FiShield size={18} />
                          )}
                        </button>
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete User"
                          >
                            <FiTrash2 size={18} />
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

export default AdminUsers;
