import api from '../utils/api';

/**
 * Auth API service
 * All authentication-related API calls in one place
 */
const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Validate the stored token by fetching the current user's profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Get all users (admin)
  getAll: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  // Update user (admin)
  update: async (id, userData) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  },

  // Delete user (admin)
  delete: async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};

export default authService;
