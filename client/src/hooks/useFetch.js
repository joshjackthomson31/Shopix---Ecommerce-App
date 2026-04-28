import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Generic hook for fetching data from API
 * @param {string} url - API endpoint
 * @param {object} options - { immediate: boolean, initialData: any }
 */
const useFetch = (url, options = {}) => {
  const { immediate = true, initialData = null } = options;
  
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (fetchUrl = url) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(fetchUrl);
      const result = response.data.success ? response.data.data : response.data;
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [url]);

  const refetch = useCallback(() => {
    return fetchData(url);
  }, [fetchData, url]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, url, fetchData]);

  return { data, loading, error, refetch, setData };
};

export default useFetch;
