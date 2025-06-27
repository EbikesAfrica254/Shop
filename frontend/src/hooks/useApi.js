// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

/**
 * Custom hook for API calls with loading and error state management
 * Provides a consistent interface for handling async operations
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      onSuccess = null, 
      onError = null, 
      showLoading = true,
      retries = 0,
      retryDelay = 1000
    } = options;

    if (showLoading) setLoading(true);
    setError(null);

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await apiCall();
        
        if (showLoading) setLoading(false);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        lastError = err;
        console.error(`❌ API call failed (attempt ${attempt + 1}/${retries + 1}):`, err);
        
        // Don't retry on client errors (4xx)
        if (err.status >= 400 && err.status < 500) {
          break;
        }
        
        // Wait before retrying
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // All attempts failed
    setError(lastError?.message || 'API call failed');
    if (showLoading) setLoading(false);
    
    if (onError) {
      onError(lastError);
    }
    
    throw lastError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError
  };
};

/**
 * Hook for handling form submissions with API calls
 */
export const useApiForm = (apiCall, options = {}) => {
  const { execute, loading, error, clearError } = useApi();
  const [success, setSuccess] = useState(false);

  const {
    onSuccess = null,
    onError = null,
    resetOnSuccess = true,
    successMessage = 'Operation completed successfully'
  } = options;

  const submit = useCallback(async (formData) => {
    setSuccess(false);
    
    try {
      const result = await execute(() => apiCall(formData), {
        onSuccess: (data) => {
          setSuccess(true);
          if (onSuccess) {
            onSuccess(data);
          }
        },
        onError
      });

      if (resetOnSuccess) {
        setTimeout(() => setSuccess(false), 3000);
      }

      return result;
    } catch (err) {
      // Error is already handled by useApi
      throw err;
    }
  }, [execute, apiCall, onSuccess, onError, resetOnSuccess]);

  const reset = useCallback(() => {
    setSuccess(false);
    clearError();
  }, [clearError]);

  return {
    submit,
    loading,
    error,
    success,
    reset,
    clearError
  };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (apiCall, options = {}) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { execute, loading, error } = useApi();

  const {
    pageSize = 10,
    autoFetch = true
  } = options;

  const fetchPage = useCallback(async (page = currentPage) => {
    try {
      const response = await execute(() => apiCall({
        page,
        limit: pageSize
      }));

      setData(response.data || response);
      setCurrentPage(page);
      setTotalPages(response.totalPages || Math.ceil((response.total || response.length) / pageSize));
      setTotalItems(response.total || response.length);

      return response;
    } catch (err) {
      console.error('❌ Paginated fetch failed:', err);
      throw err;
    }
  }, [execute, apiCall, pageSize, currentPage]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchPage(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchPage(currentPage - 1);
    }
  }, [currentPage, fetchPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      fetchPage(page);
    }
  }, [totalPages, fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(currentPage);
  }, [fetchPage, currentPage]);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    refresh,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * Hook for infinite scroll/load more functionality
 */
export const useInfiniteApi = (apiCall, options = {}) => {
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { execute, loading, error } = useApi();

  const { pageSize = 10 } = options;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      const response = await execute(() => apiCall({
        page,
        limit: pageSize
      }));

      const newData = response.data || response;
      
      if (page === 1) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }

      setHasMore(newData.length === pageSize);
      setPage(prev => prev + 1);

      return response;
    } catch (err) {
      console.error('❌ Load more failed:', err);
      throw err;
    }
  }, [execute, apiCall, pageSize, page, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  const refresh = useCallback(() => {
    reset();
    setTimeout(() => loadMore(), 0);
  }, [reset, loadMore]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refresh
  };
};