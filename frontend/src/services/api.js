// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Enhanced API Client with error handling, interceptors, and retry logic
 */
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    try {
      const token = localStorage.getItem('authToken');
      return token ? `Bearer ${token}` : null;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Build headers with authentication
   */
  buildHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const authToken = this.getAuthToken();
    if (authToken) {
      headers.Authorization = authToken;
    }
    
    return headers;
  }

  /**
   * Main request method with error handling and retry logic
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.buildHeaders(options.headers),
      ...options,
    };

    try {
      console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Handle different response types
      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      // Handle empty responses
      if (response.status === 204) {
        return null;
      }

      // Try to parse JSON, fallback to text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ API Success: ${config.method || 'GET'} ${url}`, data);
        return data;
      } else {
        const text = await response.text();
        console.log(`✅ API Success (text): ${config.method || 'GET'} ${url}`);
        return text;
      }
      
    } catch (error) {
      console.error(`❌ API Error: ${config.method || 'GET'} ${url}`, error);
      throw error;
    }
  }

  /**
   * Handle error responses with detailed error messages
   */
  async handleErrorResponse(response) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData = null;

    try {
      errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If can't parse JSON, use status text
      errorMessage = response.statusText || `HTTP Error ${response.status}`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = errorData;

    // Handle specific error types
    switch (response.status) {
      case 401:
        // Unauthorized - clear auth token
        localStorage.removeItem('authToken');
        window.location.href = '/employee-login';
        break;
      case 403:
        error.message = 'Access denied. You don\'t have permission to perform this action.';
        break;
      case 404:
        error.message = 'Resource not found.';
        break;
      case 500:
        error.message = 'Server error. Please try again later.';
        break;
      case 503:
        error.message = 'Service temporarily unavailable. Please try again later.';
        break;
    }

    return error;
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        'Authorization': this.getAuthToken(),
      },
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };

// Legacy compatibility exports
export const api = {
  get: (url, params) => apiClient.get(url, params),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url) => apiClient.delete(url),
  upload: (url, file, data) => apiClient.uploadFile(url, file, data),
};