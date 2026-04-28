import { useCallback } from 'react';
import { orderService } from '../services';
import catchAsync from '../utils/catchAsync';
import useFetch from './useFetch';

/**
 * Hook for managing orders data
 * @param {object} options - { admin: boolean, immediate: boolean }
 */
const useOrders = (options = {}) => {
  const { admin = false, immediate = true } = options;
  const endpoint = admin ? '/orders' : '/orders/myorders';
  
  const { data: orders, loading, error, refetch } = useFetch(endpoint, { 
    immediate, 
    initialData: [] 
  });

  // Fetch single order by ID
  const fetchOrder = useCallback(
    async (id) => catchAsync(() => orderService.getById(id))(),
    []
  );

  // Create new order
  const createOrder = useCallback(
    async (orderData) => catchAsync(() => orderService.create(orderData))(),
    []
  );

  // Mark order as paid
  const markAsPaid = useCallback(async (id, paymentResult) => {
    const result = await catchAsync(() => orderService.markAsPaid(id, paymentResult))();
    if (result.success) await refetch();
    return result;
  }, [refetch]);

  // Mark order as delivered (admin)
  const markAsDelivered = useCallback(async (id) => {
    const result = await catchAsync(() => orderService.markAsDelivered(id))();
    if (result.success) await refetch();
    return result;
  }, [refetch]);

  return {
    orders,
    loading,
    error,
    refetch,
    fetchOrder,
    createOrder,
    markAsPaid,
    markAsDelivered,
  };
};

export default useOrders;
