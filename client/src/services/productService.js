import api from '../utils/api';

/**
 * Product API service
 * All product-related API calls in one place
 */
const productService = {
  // Get all products with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (admin)
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (admin)
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (admin)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Create product review
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Upload product image
  uploadImage: async (formData) => {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default productService;
