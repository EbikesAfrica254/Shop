// src/utils/validators.js
import { VALIDATION_RULES, UI_CONSTANTS } from './constants';

/**
 * FORM VALIDATION UTILITIES
 * Comprehensive validation functions for forms and user input
 */

/**
 * Basic Field Validators
 */

// Validate required fields
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '' || 
      (Array.isArray(value) && value.length === 0)) {
    return `${fieldName} is required`;
  }
  return null;
};

// Validate email
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  
  if (!VALIDATION_RULES.EMAIL.REGEX.test(email)) {
    return VALIDATION_RULES.EMAIL.MESSAGE;
  }
  
  return null;
};

// Validate password
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`;
  }
  
  if (!VALIDATION_RULES.PASSWORD.REGEX.test(password)) {
    return VALIDATION_RULES.PASSWORD.MESSAGE;
  }
  
  return null;
};

// Validate password confirmation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) return 'Password confirmation is required';
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  
  // Remove spaces and check format
  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!VALIDATION_RULES.PHONE.REGEX.test(cleanPhone)) {
    return VALIDATION_RULES.PHONE.MESSAGE;
  }
  
  return null;
};

// Validate name fields
export const validateName = (name, fieldName = 'Name') => {
  if (!name) return `${fieldName} is required`;
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (name.trim().length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return null;
};

/**
 * Product Validation
 */

// Validate product name
export const validateProductName = (name) => {
  if (!name) return 'Product name is required';
  
  if (name.trim().length < VALIDATION_RULES.PRODUCT_NAME.MIN_LENGTH) {
    return `Product name must be at least ${VALIDATION_RULES.PRODUCT_NAME.MIN_LENGTH} characters long`;
  }
  
  if (name.trim().length > VALIDATION_RULES.PRODUCT_NAME.MAX_LENGTH) {
    return `Product name must be less than ${VALIDATION_RULES.PRODUCT_NAME.MAX_LENGTH} characters`;
  }
  
  return null;
};

// Validate product price
export const validatePrice = (price) => {
  if (!price && price !== 0) return 'Price is required';
  
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) {
    return 'Price must be a valid number';
  }
  
  if (numPrice < VALIDATION_RULES.PRICE.MIN) {
    return `Price must be at least ${VALIDATION_RULES.PRICE.MIN}`;
  }
  
  if (numPrice > VALIDATION_RULES.PRICE.MAX) {
    return `Price must be less than ${VALIDATION_RULES.PRICE.MAX.toLocaleString()}`;
  }
  
  return null;
};

// Validate stock quantity
export const validateStockQuantity = (quantity) => {
  if (quantity === null || quantity === undefined || quantity === '') {
    return 'Stock quantity is required';
  }
  
  const numQuantity = parseInt(quantity);
  
  if (isNaN(numQuantity)) {
    return 'Stock quantity must be a valid number';
  }
  
  if (numQuantity < 0) {
    return 'Stock quantity cannot be negative';
  }
  
  if (numQuantity > 10000) {
    return 'Stock quantity cannot exceed 10,000';
  }
  
  return null;
};

// Validate product description
export const validateDescription = (description, maxLength = 1000) => {
  if (description && description.length > maxLength) {
    return `Description must be less than ${maxLength} characters`;
  }
  
  return null;
};

/**
 * File Validation
 */

// Validate file upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = UI_CONSTANTS.MAX_FILE_SIZE,
    allowedTypes = UI_CONSTANTS.ALLOWED_IMAGE_TYPES,
    required = false
  } = options;
  
  if (!file) {
    return required ? 'File is required' : null;
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `File size must be less than ${maxSizeMB}MB`;
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => 
      type.split('/')[1].toUpperCase()
    ).join(', ');
    return `File must be one of: ${allowedExtensions}`;
  }
  
  return null;
};

// Validate image file specifically
export const validateImage = (file, required = false) => {
  return validateFile(file, {
    maxSize: UI_CONSTANTS.MAX_FILE_SIZE,
    allowedTypes: UI_CONSTANTS.ALLOWED_IMAGE_TYPES,
    required
  });
};

/**
 * Employee/User Validation
 */

// Validate employee data
export const validateEmployee = (employee) => {
  const errors = {};
  
  // Validate first name
  const firstNameError = validateName(employee.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  // Validate last name
  const lastNameError = validateName(employee.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  // Validate email
  const emailError = validateEmail(employee.email);
  if (emailError) errors.email = emailError;
  
  // Validate phone (optional)
  if (employee.phone) {
    const phoneError = validatePhone(employee.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  // Validate role
  if (!employee.role) {
    errors.role = 'Role is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Form Validation Schemas
 */

// Login form validation
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validateRequired(formData.password, 'Password');
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Signup form validation
export const validateSignupForm = (formData) => {
  const errors = {};
  
  // Validate first name
  const firstNameError = validateName(formData.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  // Validate last name
  const lastNameError = validateName(formData.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  // Validate password
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  // Validate password confirmation
  const confirmPasswordError = validatePasswordConfirmation(
    formData.password, 
    formData.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  // Validate phone (optional)
  if (formData.phone) {
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Product form validation
export const validateProductForm = (formData) => {
  const errors = {};
  
  // Validate product name
  const nameError = validateProductName(formData.name);
  if (nameError) errors.name = nameError;
  
  // Validate price
  const priceError = validatePrice(formData.price);
  if (priceError) errors.price = priceError;
  
  // Validate category
  const categoryError = validateRequired(formData.category, 'Category');
  if (categoryError) errors.category = categoryError;
  
  // Validate stock quantity
  if (formData.stockQuantity !== undefined) {
    const stockError = validateStockQuantity(formData.stockQuantity);
    if (stockError) errors.stockQuantity = stockError;
  }
  
  // Validate description
  const descriptionError = validateDescription(formData.description);
  if (descriptionError) errors.description = descriptionError;
  
  // Validate discount amount if discount is enabled
  if (formData.discount && formData.discountAmount) {
    const discountPrice = parseFloat(formData.discountAmount);
    const originalPrice = parseFloat(formData.price);
    
    if (isNaN(discountPrice)) {
      errors.discountAmount = 'Discount amount must be a valid number';
    } else if (discountPrice >= originalPrice) {
      errors.discountAmount = 'Discount amount must be less than the original price';
    } else if (discountPrice < 0) {
      errors.discountAmount = 'Discount amount cannot be negative';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Real-time Validation Helpers
 */

// Validate field on blur
export const validateFieldOnBlur = (fieldName, value, validationRules = {}) => {
  switch (fieldName) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'phone':
      return validatePhone(value);
    case 'firstName':
    case 'lastName':
      return validateName(value, fieldName);
    case 'name':
    case 'productName':
      return validateProductName(value);
    case 'price':
      return validatePrice(value);
    case 'stockQuantity':
      return validateStockQuantity(value);
    default:
      if (validationRules.required) {
        return validateRequired(value, fieldName);
      }
      return null;
  }
};

// Validate form on submit
export const validateFormOnSubmit = (formType, formData) => {
  switch (formType) {
    case 'login':
      return validateLoginForm(formData);
    case 'signup':
      return validateSignupForm(formData);
    case 'product':
      return validateProductForm(formData);
    case 'employee':
      return validateEmployee(formData);
    default:
      return { isValid: true, errors: {} };
  }
};

/**
 * Custom Validation Rules
 */

// Create custom validator
export const createValidator = (validationFn, errorMessage) => {
  return (value) => {
    if (!validationFn(value)) {
      return errorMessage;
    }
    return null;
  };
};

// Validate using multiple rules
export const validateWithRules = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

// Common validation rules
export const validationRules = {
  required: (fieldName = 'Field') => createValidator(
    value => value !== null && value !== undefined && value !== '',
    `${fieldName} is required`
  ),
  
  minLength: (min, fieldName = 'Field') => createValidator(
    value => !value || value.length >= min,
    `${fieldName} must be at least ${min} characters long`
  ),
  
  maxLength: (max, fieldName = 'Field') => createValidator(
    value => !value || value.length <= max,
    `${fieldName} must be less than ${max} characters`
  ),
  
  pattern: (regex, message) => createValidator(
    value => !value || regex.test(value),
    message
  ),
  
  min: (minValue, fieldName = 'Value') => createValidator(
    value => !value || parseFloat(value) >= minValue,
    `${fieldName} must be at least ${minValue}`
  ),
  
  max: (maxValue, fieldName = 'Value') => createValidator(
    value => !value || parseFloat(value) <= maxValue,
    `${fieldName} must be less than or equal to ${maxValue}`
  )
};