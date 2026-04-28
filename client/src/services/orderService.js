import api from '../utils/api';

/**
 * Order API service
 * All order-related API calls in one place
 */
const orderService = {
  // Create new order
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get order by ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order to paid
  markAsPaid: async (id, paymentResult) => {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
  },

  // Update order to delivered (admin)
  markAsDelivered: async (id) => {
    const response = await api.put(`/orders/${id}/deliver`);
    return response.data;
  },
};

export default orderService;
