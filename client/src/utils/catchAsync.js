/**
 * Client-side async handler wrapper
 * Eliminates need for try/catch in every hook method
 * Handles API response format { success, data } automatically
 * Returns consistent { success, data, error } format
 * 
 * Usage:
 * const result = await catchAsync(() => productService.getById(id))();
 * // or
 * const fetchProduct = catchAsync((id) => productService.getById(id));
 * const result = await fetchProduct(id);
 */
const catchAsync = (fn) => {
  return async (...args) => {
    try {
      const response = await fn(...args);
      // Handle API response format { success, data }
      if (response.success !== false) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message || 'Operation failed' };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'An error occurred' 
      };
    }
  };
};

export default catchAsync;
