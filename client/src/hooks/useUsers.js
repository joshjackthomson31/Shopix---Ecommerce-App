import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services';
import catchAsync from '../utils/catchAsync';

/**
 * Hook for managing users data (admin)
 * @param {object} options - { immediate: boolean }
 */
const useUsers = (options = {}) => {
  const { immediate = true } = options;
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await catchAsync(() => authService.getAll())();
    if (result.success) {
      setUsers(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
    return result;
  }, []);

  // Update user (toggle admin)
  const updateUser = useCallback(async (id, userData) => {
    const result = await catchAsync(() => authService.update(id, userData))();
    if (result.success) {
      await fetchUsers(); // Refresh list
    }
    return result;
  }, [fetchUsers]);

  // Delete user
  const deleteUser = useCallback(async (id) => {
    const result = await catchAsync(() => authService.delete(id))();
    if (result.success) {
      await fetchUsers(); // Refresh list
    }
    return result;
  }, [fetchUsers]);

  // Auto-fetch on mount if immediate
  useEffect(() => {
    if (immediate) {
      fetchUsers();
    }
  }, [immediate, fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
  };
};

export default useUsers;
