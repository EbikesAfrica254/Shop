// src/hooks/useProductsAPI.js
import { useState, useEffect, useCallback } from 'react';

export const useProductsAPI = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;
  const retryDelay = 1000;

  const fetchProducts = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/items/public', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      const filteredProducts = data.filter(item => 
        item && 
        typeof item === 'object' && 
        item.id && 
        item.name && 
        !item.suspended
      );
      
      setProducts(filteredProducts);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Fetch error:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else if (err.message.includes('401')) {
        setError('Authentication required. Please log in.');
      } else if (err.message.includes('403')) {
        setError('Access denied. Please check your permissions.');
      } else if (err.message.includes('404')) {
        setError('Products endpoint not found.');
      } else if (err.message.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Failed to load products');
      }

      if (retryCount < maxRetries && err.name !== 'AbortError') {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchProducts(true);
        }, retryDelay * Math.pow(2, retryCount));
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const retry = useCallback(() => {
    setRetryCount(0);
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, retry };
};