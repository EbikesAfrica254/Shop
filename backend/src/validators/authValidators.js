// src/validators/authValidators.js

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Google user data validation
export const validateGoogleUserData = (userData) => {
  const errors = [];
  
  // Required fields
  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!userData.email || !validateEmail(userData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!userData.google_id || typeof userData.google_id !== 'string') {
    errors.push('Google ID is required');
  }
  
  // Optional fields validation
  if (userData.picture && typeof userData.picture !== 'string') {
    errors.push('Picture URL must be a string');
  }
  
  if (userData.given_name && typeof userData.given_name !== 'string') {
    errors.push('Given name must be a string');
  }
  
  if (userData.family_name && typeof userData.family_name !== 'string') {
    errors.push('Family name must be a string');
  }
  
  // Name length validation
  if (userData.name && userData.name.length > 255) {
    errors.push('Name must be less than 255 characters');
  }
  
  // Email length validation
  if (userData.email && userData.email.length > 255) {
    errors.push('Email must be less than 255 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Optional: Add more password complexity requirements
  /*
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  */
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Phone number validation (Kenyan format)
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Kenyan phone number patterns
  const patterns = [
    /^254[17]\d{8}$/, // International format: 254700000000 or 254100000000
    /^0[17]\d{8}$/, // Local format: 0700000000 or 0100000000
    /^\+254[17]\d{8}$/, // International with +: +254700000000
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleanPhone));
  
  return {
    isValid,
    error: isValid ? null : 'Please enter a valid Kenyan phone number'
  };
};

// User profile update validation
export const validateUserProfileUpdate = (updateData) => {
  const errors = [];
  
  // Name validation
  if (updateData.name !== undefined) {
    if (!updateData.name || typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (updateData.name.length > 255) {
      errors.push('Name must be less than 255 characters');
    }
  }
  
  // Phone validation
  if (updateData.phone !== undefined) {
    const phoneValidation = validatePhoneNumber(updateData.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error);
    }
  }
  
  // Picture URL validation
  if (updateData.picture !== undefined && updateData.picture !== null) {
    if (typeof updateData.picture !== 'string') {
      errors.push('Picture URL must be a string');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};