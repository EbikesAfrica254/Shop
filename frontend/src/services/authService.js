// src/services/authService.js
import { apiClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Authentication Service - All auth-related API calls
 */
export const authService = {
  /**
   * AUTHENTICATION METHODS
   */

  // Employee login
  async login(credentials) {
    try {
      console.log('🔐 Attempting employee login...');
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      });

      if (response.token && response.user) {
        // Store authentication data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Store refresh token if provided
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        console.log('✅ Login successful:', response.user);
        return {
          success: true,
          user: response.user,
          token: response.token,
          message: 'Login successful'
        };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      // Handle specific error cases
      if (error.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.status === 403) {
        throw new Error('Account is suspended. Contact administrator.');
      } else if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  // Employee signup/registration
  async signup(userData) {
    try {
      console.log('📝 Attempting employee registration...');
      
      // Validate input
      const validation = this.validateSignupData(userData);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        phone: userData.phone?.trim(),
        role: userData.role || 'employee',
        department: userData.department?.trim()
      });

      console.log('✅ Registration successful');
      return {
        success: true,
        message: 'Registration successful. Please wait for admin approval.',
        user: response.user
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      
      // Handle specific error cases
      if (error.status === 409) {
        throw new Error('Email already exists. Please use a different email.');
      } else if (error.status === 400) {
        throw new Error(error.message || 'Invalid registration data');
      }
      
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  // Logout
  async logout() {
    try {
      console.log('🔐 Logging out...');
      
      // Call server logout endpoint if available
      try {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        console.warn('Server logout failed, continuing with local logout:', error);
      }

      // Clear local storage
      this.clearAuthData();
      
      console.log('✅ Logout successful');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if server logout fails, clear local data
      this.clearAuthData();
      return { success: true, message: 'Logged out successfully' };
    }
  },

  // Refresh authentication token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing authentication token...');
      
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        console.log('✅ Token refreshed successfully');
        return response.token;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Clear auth data if refresh fails
      this.clearAuthData();
      throw error;
    }
  },

  /**
   * PASSWORD MANAGEMENT
   */

  // Request password reset
  async requestPasswordReset(email) {
    try {
      console.log('🔐 Requesting password reset...');
      
      if (!email || !this.isValidEmail(email)) {
        throw new Error('Valid email address is required');
      }

      await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.toLowerCase().trim()
      });

      console.log('✅ Password reset email sent');
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      console.error('❌ Password reset request failed:', error);
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      console.log('🔐 Resetting password...');
      
      if (!token) {
        throw new Error('Reset token is required');
      }

      if (!this.isValidPassword(newPassword)) {
        throw new Error('Password must be at least 8 characters long and contain letters and numbers');
      }

      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword
      });

      console.log('✅ Password reset successful');
      return {
        success: true,
        message: 'Password reset successfully. Please login with your new password.'
      };
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      throw new Error(error.message || 'Password reset failed. Please try again.');
    }
  },

  // Change password (authenticated user)
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔐 Changing password...');
      
      if (!currentPassword || !newPassword) {
        throw new Error('Current and new passwords are required');
      }

      if (!this.isValidPassword(newPassword)) {
        throw new Error('New password must be at least 8 characters long and contain letters and numbers');
      }

      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      });

      console.log('✅ Password changed successfully');
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('❌ Password change failed:', error);
      
      if (error.status === 401) {
        throw new Error('Current password is incorrect');
      }
      
      throw new Error(error.message || 'Password change failed. Please try again.');
    }
  },

  /**
   * USER PROFILE MANAGEMENT
   */

  // Get current user profile
  async getCurrentUser() {
    try {
      const user = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('❌ Failed to fetch current user:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      console.log('👤 Updating user profile...');
      
      const user = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, userData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Profile updated successfully');
      return user;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  /**
   * UTILITY METHODS
   */

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }

    try {
      // Basic token validation (you might want to add JWT expiry check)
      const parsedUser = JSON.parse(user);
      return !!(token && parsedUser.id);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.clearAuthData();
      return false;
    }
  },

  // Get current user from storage
  getCurrentUserFromStorage() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  // Get auth token from storage
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Check user role
  hasRole(requiredRole) {
    const user = this.getCurrentUserFromStorage();
    return user && user.role === requiredRole;
  },

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUserFromStorage();
    return user && roles.includes(user.role);
  },

  /**
   * VALIDATION METHODS
   */

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword(password) {
    // At least 8 characters, contains letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Validate phone number (basic validation)
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate signup data
  validateSignupData(userData) {
    const errors = [];

    if (!userData.firstName || userData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (!userData.lastName || userData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email address is required');
    }

    if (!userData.password || !this.isValidPassword(userData.password)) {
      errors.push('Password must be at least 8 characters long and contain letters and numbers');
    }

    if (userData.phone && !this.isValidPhone(userData.phone)) {
      errors.push('Valid phone number is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};