// src/hooks/useLocalStorage.js
import { useState, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === "undefined" || item === "null" || item === "") {
        return initialValue;
      }
      const parsed = JSON.parse(item);
      return parsed !== null && parsed !== undefined ? parsed : initialValue;
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
      try {
        window.localStorage.removeItem(key);
      } catch (clearError) {
        console.warn(`Error clearing corrupted ${key}:`, clearError);
      }
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      if (value === undefined || value === null) {
        window.localStorage.removeItem(key);
      } else {
        const serializedValue = JSON.stringify(value);
        window.localStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error);
      try {
        window.localStorage.removeItem(key);
      } catch (clearError) {
        console.warn(`Error clearing ${key} after save failure:`, clearError);
      }
    }
  }, [key]);

  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error clearing ${key}:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
};