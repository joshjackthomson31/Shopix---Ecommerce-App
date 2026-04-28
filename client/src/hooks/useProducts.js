import { useState, useCallback } from 'react';
import { productService } from '../services';
import catchAsync from '../utils/catchAsync';

/**
 * Hook for managing products data
 * @param {object} options - { immediate: boolean }
 */
const useProducts = (options = {}) => {
  const { immediate = true } = options;
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Fetch all products with optional filters (manages local state)
  // Note: Not using catchAsync here because response has special structure (categories at root level)
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getAll(params);
      setProducts(response.data || []);
      setCategories(response.categories || ['All']);
      setLoading(false);
      return { success: true, data: response.data, categories: response.categories };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch products';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Fetch single product by ID
  const fetchProduct = useCallback(
    async (id) => catchAsync(() => productService.getById(id))(),
    []
  );

  // Create new product (admin)
  const createProduct = useCallback(async (productData) => {
    const result = await catchAsync(() => productService.create(productData))();
    if (result.success) await fetchProducts();
    return result;
  }, [fetchProducts]);

  // Update product (admin)
  const updateProduct = useCallback(async (id, productData) => {
    const result = await catchAsync(() => productService.update(id, productData))();
    if (result.success) await fetchProducts();
    return result;
  }, [fetchProducts]);

  // Delete product (admin)
  const deleteProduct = useCallback(async (id) => {
    const result = await catchAsync(() => productService.delete(id))();
    if (result.success) await fetchProducts();
    return result;
  }, [fetchProducts]);

  // Create product review
  const createReview = useCallback(
    async (productId, reviewData) => catchAsync(() => productService.createReview(productId, reviewData))(),
    []
  );

  // Upload product image
  const uploadImage = useCallback(async (formData) => {
    const result = await catchAsync(() => productService.uploadImage(formData))();
    // uploadImage returns the path directly, not nested in data
    return result.success ? { success: true, data: result.data } : result;
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createReview,
    uploadImage,
  };
};

export default useProducts;
