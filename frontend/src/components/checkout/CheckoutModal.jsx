// src/components/checkout/CheckoutModal.jsx
import React, { useState, useCallback, useEffect, useMemo, memo, useRef } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useGoogleAuth } from '../../contexts/GoogleAuthContext';
import GoogleSignIn from '../auth/GoogleSignIn';

// Import from your utility files
import { 
  BUSINESS_PHONE, 
  STORE_LOCATION, 
  DELIVERY_RATE_PER_10KM,
  GOOGLE_MAPS_API_KEY,
  DEPOSIT_PERCENTAGE 
} from '../../utils/constants';

import { 
  formatCurrency, 
  calculateDiscountedPrice, 
  calculateDistance, 
  calculateDeliveryCost, 
  formatWorkingHours 
} from '../../utils/helpers';

// Enhanced API Configuration
const getApiBaseUrl = () => {
  // For Vite (most modern React setups)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }
  
  // For Create React App
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }
  
  // Fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Enhanced API helper with retry logic
const apiRequest = async (url, options = {}, retries = 2) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  };

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status >= 500 && i < retries) {
          // Retry on server errors
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      
      // Retry on network errors
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
};

// Enhanced API functions
const checkUserExists = async (email) => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/auth/check-user`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data.exists;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

const registerGoogleUser = async (googleCredential, userData) => {
  const data = await apiRequest(`${API_BASE_URL}/auth/register-google`, {
    method: 'POST',
    body: JSON.stringify({
      googleToken: googleCredential,
      userData: {
        name: userData.name,
        email: userData.email,
        google_id: userData.sub,
        picture: userData.picture,
        given_name: userData.given_name,
        family_name: userData.family_name,
      }
    }),
  });
  return data;
};

const loginGoogleUser = async (googleCredential, userData) => {
  const data = await apiRequest(`${API_BASE_URL}/auth/login-google`, {
    method: 'POST',
    body: JSON.stringify({
      googleToken: googleCredential,
      userData: {
        name: userData.name,
        email: userData.email,
        google_id: userData.sub,
        picture: userData.picture,
        given_name: userData.given_name,
        family_name: userData.family_name,
      }
    }),
  });
  return data;
};

const registerBasicUser = async (userData) => {
  const data = await apiRequest(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data;
};

const submitOrder = async (orderData) => {
  const data = await apiRequest(`${API_BASE_URL}/payments/orders`, {  // Add /payments
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  return data;
};

// Also update other payment-related API calls:

const initiateMpesaPayment = async (paymentData) => {
  const data = await apiRequest(`${API_BASE_URL}/payments/mpesa/stk-push`, {  // Update path
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
  return data;
};

const initiateBankTransfer = async (transferData) => {
  const data = await apiRequest(`${API_BASE_URL}/payments/bank-transfer`, {  // Update path
    method: 'POST',
    body: JSON.stringify(transferData),
  });
  return data;
};

const checkPaymentStatus = async (orderId, paymentId) => {
  const data = await apiRequest(`${API_BASE_URL}/payments/status/${orderId}/${paymentId}`, {  // Update path
    method: 'GET',
  });
  return data;
};

const uploadProofOfPayment = async (formData) => {
  const data = await apiRequest(`${API_BASE_URL}/payments/upload-proof`, {  // Update path
    method: 'POST',
    body: formData,
    headers: {}, // Remove Content-Type for FormData
  });
  return data;
};

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Enhanced LocationInput component
const LocationInput = memo(({ value, onChange, onLocationSelect, placeholder, disabled = false }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const checkGoogleMapsLoaded = useCallback(() => {
    return window.google && 
           window.google.maps && 
           window.google.maps.places && 
           window.google.maps.Geocoder;
  }, []);

  const handleGeocoding = useCallback((address) => {
    if (!checkGoogleMapsLoaded() || !address.trim() || disabled) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const geocoder = new window.google.maps.Geocoder();
    setIsLoading(true);
    setError(null);
    
    geocoder.geocode(
      { 
        address: address,
        componentRestrictions: { country: 'KE' },
        region: 'KE'
      },
      (results, status) => {
        setIsLoading(false);
        
        if (status === 'OK' && results && results.length > 0) {
          const suggestions = results.slice(0, 6).map((result, index) => ({
            id: result.place_id || `geocode_${index}`,
            address: result.formatted_address,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            name: result.formatted_address.split(',')[0],
            place_id: result.place_id,
            types: result.types || []
          }));
          
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          if (status === 'ZERO_RESULTS') {
            setError('No locations found for this search');
          } else if (status === 'OVER_QUERY_LIMIT') {
            setError('Search limit reached. Please try again later.');
          }
        }
      }
    );
  }, [checkGoogleMapsLoaded, disabled]);

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.length >= 3) {
        handleGeocoding(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
      }
    }, 500),
    [handleGeocoding]
  );

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (autocompleteRef.current) {
      try {
        autocompleteRef.current.set('place', null);
      } catch (error) {
        // Ignore if autocomplete not fully initialized
      }
    }
    
    if (newValue.trim() && !disabled) {
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
    }
  }, [onChange, debouncedSearch, disabled]);

  const handleSuggestionClick = useCallback((suggestion) => {
    const location = {
      address: suggestion.address,
      lat: suggestion.lat,
      lng: suggestion.lng,
      name: suggestion.name,
      place_id: suggestion.place_id,
      types: suggestion.types
    };
    
    onLocationSelect(location);
    onChange(suggestion.address);
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
  }, [onLocationSelect, onChange]);

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (!checkGoogleMapsLoaded()) {
          setError('Google Maps not loaded');
          setIsLoading(false);
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat: latitude, lng: longitude };

        geocoder.geocode({ location: latlng }, (results, status) => {
          setIsLoading(false);
          
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            const location = {
              address: result.formatted_address,
              lat: latitude,
              lng: longitude,
              name: result.formatted_address.split(',')[0],
              place_id: result.place_id,
              types: result.types || []
            };
            
            onLocationSelect(location);
            onChange(result.formatted_address);
          } else {
            setError('Could not determine your location address');
          }
        });
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('An unknown error occurred');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [checkGoogleMapsLoaded, onLocationSelect, onChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadGoogleMaps = () => {
      if (checkGoogleMapsLoaded()) {
        if (mounted) {
          setIsGoogleMapsLoaded(true);
        }
        return;
      }

      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (mounted && checkGoogleMapsLoaded()) {
            setIsGoogleMapsLoaded(true);
          }
        });
        return;
      }

      if (!GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key not found');
        setError('Maps service not configured');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&region=KE&language=en&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (mounted && checkGoogleMapsLoaded()) {
          setIsGoogleMapsLoaded(true);
        }
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
        if (mounted) {
          setIsLoading(false);
          setError('Failed to load maps service');
        }
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      mounted = false;
    };
  }, [checkGoogleMapsLoaded]);

  return (
    <div className="location-input-container" ref={inputRef}>
      <div className="input-wrapper">
        <input
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder || "Search for any location in Kenya..."}
          className={`location-input ${disabled ? 'disabled' : ''}`}
          autoComplete="off"
          disabled={disabled}
        />
        {isLoading && (
          <div className="input-loading-indicator">
            <div className="loading-spinner-small"></div>
          </div>
        )}
        <div className="input-actions">
          {isGoogleMapsLoaded && !disabled && (
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="current-location-btn"
              title="Use current location"
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 8C13.1046 8 14 8.89543 14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2V4M12 20V22M20 12H22M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          )}
          <div className="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="location-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="location-suggestions">
          <div className="suggestions-header">
            <small>🗺️ Found {suggestions.length} location{suggestions.length !== 1 ? 's' : ''} in Kenya:</small>
          </div>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="location-suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="suggestion-details">
                <div className="suggestion-name">{suggestion.name}</div>
                <div className="suggestion-address">{suggestion.address}</div>
                {suggestion.types && suggestion.types.length > 0 && (
                  <div className="suggestion-types">
                    {suggestion.types.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <small className="input-help-text">
        {!isGoogleMapsLoaded && "🗺️ Loading Google Maps services..."}
        {isGoogleMapsLoaded && !disabled && "🗺️ Search for any location in Kenya or use current location"}
        {disabled && "🔒 Location input is disabled"}
      </small>
    </div>
  );
});

LocationInput.displayName = 'LocationInput';

// Enhanced Payment Method Selector Component
const PaymentMethodSelector = memo(({ selectedMethod, onMethodChange, amount, depositAmount, disabled = false }) => {
  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Pay instantly with M-Pesa STK Push',
      instructions: 'Enter your phone number to receive an M-Pesa prompt',
      recommended: true,
      instant: true
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'Transfer to our bank account',
      instructions: 'Get bank details and upload proof of payment',
      instant: false
    }
  ];

  const depositPercentage = DEPOSIT_PERCENTAGE || 0.3;
  const formatCurrencyFallback = formatCurrency || ((amount) => `KSH ${amount?.toFixed?.(2) || 0}`);

  return (
    <div className="payment-methods">
      <h4>Select Payment Method</h4>
      <div className="payment-amount-summary">
        <div className="amount-row">
          <span>Deposit Required ({Math.round(depositPercentage * 100)}%):</span>
          <span className="amount">{formatCurrencyFallback(depositAmount || 0)}</span>
        </div>
        <div className="amount-row total">
          <span>Total Deposit Due:</span>
          <span className="amount">{formatCurrencyFallback(amount || 0)}</span>
        </div>
      </div>
      
      <div className="payment-options">
        {paymentMethods.map(method => (
          <label 
            key={method.id}
            className={`payment-option ${selectedMethod === method.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => onMethodChange(e.target.value)}
              disabled={disabled}
            />
            <div className="payment-option-content">
              <div className="payment-option-header">
                <div className="payment-icon">{method.icon}</div>
                <div className="payment-details">
                  <div className="payment-name">
                    <h5>{method.name}</h5>
                    {method.recommended && (
                      <span className="recommended-badge">Recommended</span>
                    )}
                    {method.instant && (
                      <span className="instant-badge">Instant</span>
                    )}
                  </div>
                  <p>{method.description}</p>
                </div>
              </div>
              <div className="payment-instructions">
                {method.instructions}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
});

PaymentMethodSelector.displayName = 'PaymentMethodSelector';

// M-Pesa Phone Input Component
const MpesaPhoneInput = memo(({ value, onChange, disabled = false, error = null }) => {
  const handlePhoneChange = (e) => {
    let phone = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format the phone number
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    } else if (phone.startsWith('7') || phone.startsWith('1')) {
      phone = '254' + phone;
    } else if (!phone.startsWith('254')) {
      phone = '254' + phone;
    }
    
    // Limit to 12 digits (254 + 9 digits)
    if (phone.length > 12) {
      phone = phone.substring(0, 12);
    }
    
    onChange(phone);
  };

  const formatDisplayPhone = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('254')) {
      return `+${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6, 9)} ${phone.substring(9)}`;
    }
    return phone;
  };

  return (
    <div className="mpesa-phone-input">
      <label htmlFor="mpesa-phone">M-Pesa Phone Number *</label>
      <div className="phone-input-wrapper">
        <span className="country-code">+254</span>
        <input
          id="mpesa-phone"
          type="tel"
          value={value ? value.replace('254', '') : ''}
          onChange={handlePhoneChange}
          placeholder="7XXXXXXXX"
          disabled={disabled}
          className={error ? 'error' : ''}
          maxLength="9"
        />
      </div>
      {value && value.length === 12 && (
        <small className="phone-preview">
          Your M-Pesa number: {formatDisplayPhone(value)}
        </small>
      )}
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      <small className="help-text">
        Enter your Safaricom M-Pesa number to receive payment prompt
      </small>
    </div>
  );
});

MpesaPhoneInput.displayName = 'MpesaPhoneInput';

// Payment Processing Component
const PaymentProcessor = memo(({ 
  paymentMethod, 
  orderData, 
  mpesaPhone, 
  onPaymentSuccess, 
  onPaymentError, 
  onPaymentCancel,
  disabled = false 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const formatCurrencyFallback = formatCurrency || ((amount) => `KSH ${amount?.toFixed?.(2) || 0}`);

  const handleMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.length !== 12) {
      onPaymentError('Please enter a valid M-Pesa phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('initiating');
    setStatusMessage('Initiating M-Pesa payment...');

    try {
      const paymentData = {
        orderId: orderData.orderId,
        amount: orderData.amount,
        phoneNumber: mpesaPhone,
        accountReference: `ORDER-${orderData.orderId}`,
        transactionDesc: `E-Bikes Order Payment - ${orderData.orderId}`
      };

      const response = await initiateMpesaPayment(paymentData);

      if (response.success) {
        setPaymentId(response.checkoutRequestId);
        setPaymentStatus('pending');
        setStatusMessage('Check your phone for M-Pesa prompt and enter your PIN...');

        // Start polling for payment status
        pollPaymentStatus(orderData.orderId, response.checkoutRequestId);
      } else {
        throw new Error(response.message || 'Failed to initiate M-Pesa payment');
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setPaymentStatus('failed');
      setStatusMessage('Payment failed. Please try again.');
      onPaymentError(error.message);
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    setIsProcessing(true);
    setPaymentStatus('initiating');
    setStatusMessage('Getting bank transfer details...');

    try {
      const transferData = {
        orderId: orderData.orderId,
        amount: orderData.amount,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone
      };

      const response = await initiateBankTransfer(transferData);

      if (response.success) {
        setBankDetails(response.bankDetails);
        setShowBankDetails(true);
        setPaymentStatus('pending');
        setStatusMessage('Bank details provided. Please complete the transfer.');
        setIsProcessing(false);
      } else {
        throw new Error(response.message || 'Failed to get bank transfer details');
      }
    } catch (error) {
      console.error('Bank transfer error:', error);
      setPaymentStatus('failed');
      setStatusMessage('Failed to get bank details. Please try again.');
      onPaymentError(error.message);
      setIsProcessing(false);
    }
  };

  const handleProofUpload = async () => {
    if (!proofFile) {
      onPaymentError('Please select a proof of payment file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      formData.append('orderId', orderData.orderId);
      formData.append('reference', bankDetails.reference);
      formData.append('amount', orderData.amount);

      const response = await uploadProofOfPayment(formData);

      if (response.success) {
        setPaymentStatus('completed');
        setStatusMessage('Proof uploaded successfully! Your payment is being verified.');
        onPaymentSuccess({
          method: 'bank_transfer',
          reference: bankDetails.reference,
          status: 'pending_verification',
          proofUploaded: true
        });
      } else {
        throw new Error(response.message || 'Failed to upload proof');
      }
    } catch (error) {
      console.error('Proof upload error:', error);
      onPaymentError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const pollPaymentStatus = async (orderId, paymentId) => {
    const maxAttempts = 30; // 30 attempts = 2.5 minutes
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await checkPaymentStatus(orderId, paymentId);

        if (response.status === 'completed') {
          setPaymentStatus('completed');
          setStatusMessage('Payment successful!');
          setIsProcessing(false);
          onPaymentSuccess(response);
        } else if (response.status === 'failed' || response.status === 'cancelled') {
          setPaymentStatus('failed');
          setStatusMessage(response.message || 'Payment failed');
          setIsProcessing(false);
          onPaymentError(response.message || 'Payment failed');
        } else if (attempts >= maxAttempts) {
          setPaymentStatus('timeout');
          setStatusMessage('Payment verification timed out. Please contact support.');
          setIsProcessing(false);
          onPaymentError('Payment verification timed out');
        } else {
          // Continue polling
          setTimeout(poll, 5000); // Poll every 5 seconds
       }
     } catch (error) {
       console.error('Error checking payment status:', error);
       if (attempts >= maxAttempts) {
         setPaymentStatus('failed');
         setStatusMessage('Unable to verify payment. Please contact support.');
         setIsProcessing(false);
         onPaymentError('Unable to verify payment');
       } else {
         setTimeout(poll, 5000);
       }
     }
   };

   poll();
 };

 const handleCancelPayment = () => {
   setIsProcessing(false);
   setPaymentStatus(null);
   setStatusMessage('');
   setShowBankDetails(false);
   setBankDetails(null);
   setProofFile(null);
   onPaymentCancel();
 };

 if (paymentMethod === 'mpesa') {
   return (
     <div className="payment-processor mpesa">
       {!isProcessing && !paymentStatus && (
         <button
           onClick={handleMpesaPayment}
           disabled={disabled || !mpesaPhone}
           className="btn btn-primary btn-large mpesa-pay-btn"
         >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
             <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
           </svg>
           Pay {formatCurrencyFallback(orderData.amount)} via M-Pesa
         </button>
       )}

       {isProcessing && (
         <div className="payment-status processing">
           <div className="status-content">
             <div className="loading-spinner"></div>
             <h4>Processing M-Pesa Payment</h4>
             <p>{statusMessage}</p>
             {paymentStatus === 'pending' && (
               <div className="mpesa-instructions">
                 <div className="instruction-item">
                   <span className="step">1</span>
                   <span>Check your phone for the M-Pesa prompt</span>
                 </div>
                 <div className="instruction-item">
                   <span className="step">2</span>
                   <span>Enter your M-Pesa PIN</span>
                 </div>
                 <div className="instruction-item">
                   <span className="step">3</span>
                   <span>Wait for confirmation</span>
                 </div>
               </div>
             )}
             <button
               onClick={handleCancelPayment}
               className="btn btn-secondary btn-small"
             >
               Cancel Payment
             </button>
           </div>
         </div>
       )}

       {paymentStatus === 'completed' && (
         <div className="payment-status success">
           <div className="status-icon success">✅</div>
           <h4>Payment Successful!</h4>
           <p>Your M-Pesa payment has been processed successfully.</p>
         </div>
       )}

       {paymentStatus === 'failed' && (
         <div className="payment-status failed">
           <div className="status-icon error">❌</div>
           <h4>Payment Failed</h4>
           <p>{statusMessage}</p>
           <button
             onClick={() => {
               setPaymentStatus(null);
               setIsProcessing(false);
               setStatusMessage('');
             }}
             className="btn btn-primary"
           >
             Try Again
           </button>
         </div>
       )}
     </div>
   );
 }

 if (paymentMethod === 'bank') {
   return (
     <div className="payment-processor bank">
       {!showBankDetails && (
         <button
           onClick={handleBankTransfer}
           disabled={disabled || isProcessing}
           className="btn btn-primary btn-large bank-pay-btn"
         >
           {isProcessing ? (
             <>
               <div className="loading-spinner-small"></div>
               Getting Bank Details...
             </>
           ) : (
             <>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                 <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
               </svg>
               Get Bank Transfer Details
             </>
           )}
         </button>
       )}

       {showBankDetails && bankDetails && (
         <div className="bank-transfer-details">
           <div className="bank-details-card">
             <h4>🏦 Bank Transfer Details</h4>
             <div className="bank-info">
               <div className="bank-row">
                 <span className="label">Bank Name:</span>
                 <span className="value">{bankDetails.bankName}</span>
               </div>
               <div className="bank-row">
                 <span className="label">Account Number:</span>
                 <span className="value account-number">{bankDetails.accountNumber}</span>
                 <button
                   onClick={() => navigator.clipboard.writeText(bankDetails.accountNumber)}
                   className="copy-btn"
                   title="Copy account number"
                 >
                   📋
                 </button>
               </div>
               <div className="bank-row">
                 <span className="label">Account Name:</span>
                 <span className="value">{bankDetails.accountName}</span>
               </div>
               <div className="bank-row">
                 <span className="label">Branch Code:</span>
                 <span className="value">{bankDetails.branchCode}</span>
               </div>
               <div className="bank-row amount">
                 <span className="label">Amount:</span>
                 <span className="value">{formatCurrencyFallback(orderData.amount)}</span>
               </div>
               <div className="bank-row">
                 <span className="label">Reference:</span>
                 <span className="value reference">{bankDetails.reference}</span>
                 <button
                   onClick={() => navigator.clipboard.writeText(bankDetails.reference)}
                   className="copy-btn"
                   title="Copy reference"
                 >
                   📋
                 </button>
               </div>
             </div>

             <div className="transfer-instructions">
               <h5>📋 Transfer Instructions</h5>
               <ol>
                 <li>Transfer the exact amount to the account above</li>
                 <li>Use the reference number provided</li>
                 <li>Take a screenshot or save the receipt</li>
                 <li>Upload proof of payment below</li>
               </ol>
             </div>

             <div className="proof-upload">
               <label htmlFor="proof-upload" className="upload-label">
                 Upload Proof of Payment *
               </label>
               <input
                 id="proof-upload"
                 type="file"
                 accept="image/*,.pdf"
                 onChange={(e) => {
                   const file = e.target.files[0];
                   if (file) {
                     setProofFile(file);
                   }
                 }}
                 className="file-input"
               />
               {proofFile && (
                 <div className="file-preview">
                   <span className="file-name">{proofFile.name}</span>
                   <span className="file-size">({(proofFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                   <button
                     type="button"
                     onClick={() => setProofFile(null)}
                     className="remove-file"
                   >
                     ✕
                   </button>
                 </div>
               )}
               <small className="help-text">
                 Upload a screenshot or photo of your transfer receipt (JPG, PNG, or PDF)
               </small>
             </div>

             <div className="bank-actions">
               <button
                 onClick={handleCancelPayment}
                 className="btn btn-secondary"
                 disabled={isUploading}
               >
                 Cancel
               </button>
               <button
                 onClick={handleProofUpload}
                 className="btn btn-primary"
                 disabled={!proofFile || isUploading}
               >
                 {isUploading ? (
                   <>
                     <div className="loading-spinner-small"></div>
                     Uploading...
                   </>
                 ) : (
                   'Submit Proof & Complete Order'
                 )}
               </button>
             </div>
           </div>
         </div>
       )}

       {paymentStatus === 'completed' && (
         <div className="payment-status success">
           <div className="status-icon success">✅</div>
           <h4>Proof Uploaded Successfully!</h4>
           <p>Your payment proof has been submitted for verification. You'll receive confirmation once verified.</p>
         </div>
       )}
     </div>
   );
 }

 return null;
});

PaymentProcessor.displayName = 'PaymentProcessor';

// Enhanced Order Summary Component
const OrderSummary = memo(({ 
 items, 
 subtotal, 
 deliveryCost, 
 totalAmount, 
 depositAmount, 
 onEditCart 
}) => {
 const formatCurrencyFallback = formatCurrency || ((amount) => `KSH ${amount?.toFixed?.(2) || 0}`);
 const calculateDiscountedPriceFallback = calculateDiscountedPrice || ((price, discount) => price - discount);
 
 return (
   <div className="order-summary">
     <div className="order-summary-header">
       <h4>Order Summary</h4>
       {onEditCart && (
         <button type="button" onClick={onEditCart} className="edit-cart-btn">
           Edit Cart
         </button>
       )}
     </div>
     
     <div className="order-items">
       {items.map(item => {
         const itemPrice = item.discount ? 
           calculateDiscountedPriceFallback(item.price, item.discount_amount) : 
           item.price;
         
         return (
           <div key={item.id} className="order-item">
             <div className="item-details">
               <span className="item-name">{item.name}</span>
               <span className="item-quantity">x{item.quantity}</span>
             </div>
             <div className="item-pricing">
               {item.discount && (
                 <span className="original-price">{formatCurrencyFallback(item.price * item.quantity)}</span>
               )}
               <span className="item-price">{formatCurrencyFallback(itemPrice * item.quantity)}</span>
             </div>
           </div>
         );
       })}
     </div>

     <div className="order-totals">
       <div className="total-row">
         <span>Subtotal:</span>
         <span>{formatCurrencyFallback(subtotal)}</span>
       </div>
       <div className="total-row">
         <span>Delivery Fee:</span>
         <span>{formatCurrencyFallback(deliveryCost)}</span>
       </div>
       <div className="total-row">
         <span>Deposit ({Math.round((DEPOSIT_PERCENTAGE || 0.3) * 100)}%):</span>
         <span>{formatCurrencyFallback(depositAmount)}</span>
       </div>
       <div className="total-row final">
         <span>Total Amount:</span>
         <span>{formatCurrencyFallback(totalAmount)}</span>
       </div>
     </div>
   </div>
 );
});

OrderSummary.displayName = 'OrderSummary';

// Main CheckoutModal Component
const CheckoutModal = memo(() => {
 const cartContext = useCart();
 const authContext = useGoogleAuth();
 
 const { 
   cartItems = [], 
   getCartTotal = () => 0, 
   getCartItemsCount = () => 0,
   getDepositAmount = () => 0,
   isCheckoutOpen = false, 
   closeCheckout = () => {},
   clearCart = () => {},
   addNotification = () => {}
 } = cartContext || {};

 const { user, signOut } = authContext || {};

 // State management
 const [selectedOption, setSelectedOption] = useState('');
 const [customerInfo, setCustomerInfo] = useState({
   name: '',
   phone: '',
   email: '',
   address: '',
   notes: ''
 });
 const [deliveryLocation, setDeliveryLocation] = useState(null);
 const [deliveryCost, setDeliveryCost] = useState(0);
 const [distance, setDistance] = useState(0);
 const [paymentMethod, setPaymentMethod] = useState('');
 const [mpesaPhone, setMpesaPhone] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [currentStep, setCurrentStep] = useState(1);
 const [validationErrors, setValidationErrors] = useState({});

 // Enhanced state for user authentication and registration
 const [isCheckingUser, setIsCheckingUser] = useState(false);
 const [isRegistering, setIsRegistering] = useState(false);
 const [userRegistrationStatus, setUserRegistrationStatus] = useState(null);
 const [authenticationError, setAuthenticationError] = useState(null);
 const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(true);
 const [orderSubmissionError, setOrderSubmissionError] = useState(null);
 const [orderData, setOrderData] = useState(null);
 const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

 // Check if Google authentication is available on backend
 const checkGoogleAuthAvailability = useCallback(async () => {
   try {
     const response = await fetch(`${API_BASE_URL}/auth/test`, {
       method: 'GET',
       credentials: 'include',
     });
     
     if (response.ok) {
       const data = await response.json();
       setIsGoogleAuthAvailable(data.google_client_configured && data.success);
     } else {
       setIsGoogleAuthAvailable(false);
     }
   } catch (error) {
     console.log('Google auth availability check failed:', error.message);
     setIsGoogleAuthAvailable(false);
   }
 }, []);

 // Enhanced Google Sign-In handler
 const handleGoogleSignIn = useCallback(async (credentialResponse) => {
   setIsCheckingUser(true);
   setAuthenticationError(null);
   
   try {
     if (!isGoogleAuthAvailable) {
       throw new Error('Google authentication is not available. Please fill the form manually.');
     }

     if (!credentialResponse.credential) {
       throw new Error('No credential received from Google');
     }

     // Decode the JWT to get user information
     const base64Url = credentialResponse.credential.split('.')[1];
     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
     const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
     }).join(''));
     
     const googleUser = JSON.parse(jsonPayload);

     // Check if user exists in database
     const userExists = await checkUserExists(googleUser.email);
     
     if (userExists) {
       // User exists - try to log them in
       try {
         const loginResult = await loginGoogleUser(credentialResponse.credential, {
           name: googleUser.name,
           email: googleUser.email,
           picture: googleUser.picture,
           given_name: googleUser.given_name,
           family_name: googleUser.family_name,
           sub: googleUser.sub
         });
         
         if (loginResult.success) {
           setUserRegistrationStatus('existing');
           setCustomerInfo(prev => ({
             ...prev,
             name: googleUser.name || prev.name,
             email: googleUser.email || prev.email,
           }));
           
           setValidationErrors(prev => ({
             ...prev,
             name: '',
             email: ''
           }));
           
           addNotification(
             `Welcome back ${googleUser.given_name || googleUser.name}! You're now signed in.`, 
             'success'
           );
         }
       } catch (loginError) {
         console.warn('Google login failed, but user exists. Continuing with form pre-fill.', loginError);
         setUserRegistrationStatus('existing');
         setCustomerInfo(prev => ({
           ...prev,
           name: googleUser.name || prev.name,
           email: googleUser.email || prev.email,
         }));
         
         addNotification(
           `Welcome back ${googleUser.given_name || googleUser.name}! Your information has been loaded.`, 
           'success'
         );
       }
     } else {
       // User doesn't exist - try to register them
       setIsRegistering(true);
       setUserRegistrationStatus('new');
       
       try {
         const registrationResult = await registerGoogleUser(credentialResponse.credential, {
           name: googleUser.name,
           email: googleUser.email,
           picture: googleUser.picture,
           given_name: googleUser.given_name,
           family_name: googleUser.family_name,
           sub: googleUser.sub
         });
         
         if (registrationResult.success) {
           setCustomerInfo(prev => ({
             ...prev,
             name: googleUser.name || prev.name,
             email: googleUser.email || prev.email,
           }));
           
           setValidationErrors(prev => ({
             ...prev,
             name: '',
             email: ''
           }));
           
           addNotification(
             `Welcome ${googleUser.given_name || googleUser.name}! Account created successfully.`,
             'success'
           );
         }
       } catch (registrationError) {
         console.warn('Google registration failed, falling back to basic registration.', registrationError);
         
         try {
           const basicRegistrationResult = await registerBasicUser({
             name: googleUser.name,
             email: googleUser.email,
             password: null,
             google_id: googleUser.sub
           });
           
           if (basicRegistrationResult.success) {
             setCustomerInfo(prev => ({
               ...prev,
               name: googleUser.name || prev.name,
               email: googleUser.email || prev.email,
             }));
             
             addNotification(
               `Welcome ${googleUser.given_name || googleUser.name}! Account created successfully.`,
               'success'
             );
           }
         } catch (basicRegError) {
           console.warn('All registration methods failed, just pre-filling form:', basicRegError);
           setCustomerInfo(prev => ({
             ...prev,
             name: googleUser.name || prev.name,
             email: googleUser.email || prev.email,
           }));
           
           addNotification(
             `Hello ${googleUser.given_name || googleUser.name}! Your information has been loaded. Please continue with your order.`,
             'info'
           );
         }
       }
     }
   } catch (error) {
     console.error('Google sign-in process error:', error);
     setAuthenticationError(error.message);
     
     addNotification(
       'Google sign-in had an issue, but you can still fill the form manually.',
       'warning'
     );
     
     setUserRegistrationStatus(null);
   } finally {
     setIsCheckingUser(false);
     setIsRegistering(false);
   }
 }, [addNotification, isGoogleAuthAvailable]);

 // Check Google auth availability on component mount
 useEffect(() => {
   if (isCheckoutOpen) {
     checkGoogleAuthAvailability();
   }
 }, [isCheckoutOpen, checkGoogleAuthAvailability]);

 // Enhanced validation
 const validateStep = useCallback((step) => {
   const errors = {};
   
   if (step === 1 && !selectedOption) {
     errors.delivery = 'Please select a delivery option';
   }
   
   if (step === 2) {
     if (!customerInfo.name?.trim()) {
       errors.name = user ? 'Google account name is required' : 'Name is required';
     }
     
     if (!customerInfo.phone?.trim()) {
       errors.phone = 'Phone number is required';
     } else if (!/^[0-9+\-\s()]+$/.test(customerInfo.phone)) {
       errors.phone = 'Please enter a valid phone number';
     }
     
     if (!user && customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
       errors.email = 'Please enter a valid email address';
     }
     
     if (selectedOption === 'delivery') {
       if (!customerInfo.address?.trim()) {
         errors.address = 'Delivery address is required';
       }
       if (!deliveryLocation) {
         errors.address = 'Please select a valid location from the search results';
       }
     }
   }
   
   if (step === 4 && !paymentMethod) {
     errors.payment = 'Please select a payment method';
   }

   if (step === 4 && paymentMethod === 'mpesa') {
     if (!mpesaPhone || mpesaPhone.length !== 12) {
       errors.mpesaPhone = 'Please enter a valid M-Pesa phone number';
     }
   }
   
   setValidationErrors(errors);
   return Object.keys(errors).length === 0;
 }, [selectedOption, customerInfo, paymentMethod, deliveryLocation, user, mpesaPhone]);

 // Handle location selection with distance calculation
 const handleLocationSelect = useCallback((location) => {
   setDeliveryLocation(location);
   
   if (STORE_LOCATION && calculateDistance && calculateDeliveryCost) {
     try {
       const distanceKm = calculateDistance(
         STORE_LOCATION.lat,
         STORE_LOCATION.lng,
         location.lat,
         location.lng
       );
       
       const cost = calculateDeliveryCost(distanceKm);
       
       setDistance(distanceKm);
       setDeliveryCost(cost);
       
       const formatCurrencyFallback = formatCurrency || ((amount) => `KSH ${amount?.toFixed?.(2) || 0}`);
       addNotification(
         `📍 ${location.name} selected • Distance: ${distanceKm.toFixed(1)}km • Delivery: ${formatCurrencyFallback(cost)}`, 
         'success'
       );
     } catch (error) {
       console.error('Error calculating distance/cost:', error);
       addNotification('Error calculating delivery cost. Please try again.', 'error');
     }
   }
 }, [addNotification]);

 // Handle address change for LocationInput
 const handleAddressChange = useCallback((address) => {
   setCustomerInfo(prev => ({ ...prev, address }));
   
   if (validationErrors.address) {
     setValidationErrors(prev => ({
       ...prev,
       address: ''
     }));
   }
 }, [validationErrors.address]);

 // Enhanced order submission with backend integration
 const handleSubmitOrder = useCallback(async () => {
  if (!validateStep(4)) {
    addNotification('Please fix the errors before submitting', 'error');
    return;
  }

  setIsSubmitting(true);
  setOrderSubmissionError(null);

  try {
    const safeItems = Array.isArray(cartItems) ? cartItems : [];
    const subtotal = getCartTotal();
    const finalDeliveryCost = selectedOption === 'delivery' ? deliveryCost : 0;
    const totalAmount = subtotal + finalDeliveryCost;
    const depositAmount = getDepositAmount();
    const finalDepositDue = depositAmount + finalDeliveryCost;

    // Step 1: Validate order first
    const orderPayload = {
      customer: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || null,
        google_user: !!user,
        registration_status: userRegistrationStatus
      },
      delivery: {
        method: selectedOption,
        address: selectedOption === 'delivery' ? customerInfo.address : null,
        location: deliveryLocation,
        distance: distance,
        cost: finalDeliveryCost
      },
      payment: {
        method: paymentMethod,
        deposit_amount: depositAmount,
        total_deposit_due: finalDepositDue,
        total_amount: totalAmount
      },
      items: safeItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        discount_amount: item.discount_amount || 0,
        quantity: item.quantity
      })),
      notes: customerInfo.notes || null,
      metadata: {
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        source: 'web_checkout'
      }
    };

    // Validate order
    const validationResult = await apiRequest(`${API_BASE_URL}/payments/validate-order`, {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });

    if (validationResult.success) {
      // Store order data and move to payment
      setOrderData({
        tempOrderRef: validationResult.temp_order_ref,
        amount: validationResult.payment_required,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        paymentMethod: paymentMethod,
        orderData: orderPayload // Store for payment
      });

      addNotification('Order validated! Proceeding to payment...', 'success');
      setCurrentStep(5); // Move to payment step
    } else {
      throw new Error(validationResult.message || 'Order validation failed');
    }

  } catch (error) {
    console.error('Order validation error:', error);
    setOrderSubmissionError(error.message);
    addNotification('Order validation failed. Please try again.', 'error');
  } finally {
    setIsSubmitting(false);
  }
 }, [validateStep, cartItems, getCartTotal, getDepositAmount, selectedOption, customerInfo, distance, deliveryCost, paymentMethod, user, userRegistrationStatus, addNotification]);

 // Handle payment success
 const handlePaymentSuccess = useCallback((paymentResult) => {
   addNotification('Payment successful! Your order has been confirmed.', 'success');
   clearCart();
   closeCheckout();
   
   // You can redirect to order confirmation page here
   // window.location.href = `/orders/${orderData.orderId}`;
 }, [addNotification, clearCart, closeCheckout, orderData]);

 // Handle payment error
 const handlePaymentError = useCallback((error) => {
   addNotification(`Payment failed: ${error}`, 'error');
   setIsPaymentProcessing(false);
 }, [addNotification]);

 // Handle payment cancel
 const handlePaymentCancel = useCallback(() => {
   setCurrentStep(4); // Go back to payment method selection
   setIsPaymentProcessing(false);
 }, []);

 // Auto-set M-Pesa phone from customer phone
 useEffect(() => {
   if (customerInfo.phone && !mpesaPhone) {
     let phone = customerInfo.phone.replace(/\D/g, '');
     if (phone.startsWith('0')) {
       phone = '254' + phone.substring(1);
     } else if (phone.startsWith('7') || phone.startsWith('1')) {
       phone = '254' + phone;
     }
     if (phone.length === 12) {
       setMpesaPhone(phone);
     }
   }
 }, [customerInfo.phone, mpesaPhone]);

 // Reset form when modal opens
 useEffect(() => {
   if (isCheckoutOpen) {
     setCurrentStep(1);
     setSelectedOption('');
     setCustomerInfo({
       name: user?.name || '',
       phone: '',
       email: user?.email || '',
       address: '',
       notes: ''
     });
     setDeliveryLocation(null);
     setDeliveryCost(0);
     setDistance(0);
     setPaymentMethod('');
     setMpesaPhone('');
     setValidationErrors({});
     setUserRegistrationStatus(null);
     setAuthenticationError(null);
     setOrderSubmissionError(null);
     setOrderData(null);
     setIsPaymentProcessing(false);
   }
 }, [isCheckoutOpen, user]);

 const handleInputChange = useCallback((e) => {
   const { name, value } = e.target;
   
   // Don't allow changes to Google-provided fields
   if (user && (name === 'name' || name === 'email')) {
     return;
   }
   
   setCustomerInfo(prev => ({
     ...prev,
     [name]: value
   }));
   
   // Clear validation error when user starts typing
   if (validationErrors[name]) {
     setValidationErrors(prev => ({
       ...prev,
       [name]: ''
     }));
   }
 }, [validationErrors, user]);

 const handleNextStep = useCallback(() => {
   if (validateStep(currentStep)) {
     setCurrentStep(prev => Math.min(prev + 1, 5));
   } else {
     addNotification('Please fix the errors before continuing', 'error');
   }
 }, [currentStep, validateStep, addNotification]);

 const handlePrevStep = useCallback(() => {
   setCurrentStep(prev => Math.max(prev - 1, 1));
 }, []);

 // Don't render if checkout is not open
 if (!isCheckoutOpen) return null;

 const subtotal = getCartTotal();
 const finalDeliveryCost = selectedOption === 'delivery' ? deliveryCost : 0;
 const totalAmount = subtotal + finalDeliveryCost;
 const depositAmount = getDepositAmount();
 const finalDepositDue = depositAmount + finalDeliveryCost;
 const formatCurrencyFallback = formatCurrency || ((amount) => `KSH ${amount?.toFixed?.(2) || 0}`);
 const formatWorkingHoursFallback = formatWorkingHours || (() => 'Mon-Fri 9AM-6PM, Sat 9AM-5PM');

 return (
   <>
     <div 
       className="checkout-overlay" 
       onClick={closeCheckout}
       aria-hidden="true"
     />
     
     <div 
       className="checkout-modal-container"
       role="dialog"
       aria-modal="true"
       aria-labelledby="checkout-title"
     >
       <div className="checkout-modal">
         {/* Header with Progress */}
         <div className="checkout-header">
           <div className="checkout-header-content">
             <h2 id="checkout-title">Secure Checkout</h2>
             <div className="checkout-progress">
               <div className="progress-bar" role="progressbar" aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax="5">
                 <div 
                   className="progress-fill" 
                   style={{ width: `${(currentStep / 5) * 100}%` }}
                 ></div>
               </div>
               <div className="progress-steps">
                 <span className={`step ${currentStep >= 1 ? 'active' : ''}`} aria-label="Step 1">1</span>
                 <span className={`step ${currentStep >= 2 ? 'active' : ''}`} aria-label="Step 2">2</span>
                 <span className={`step ${currentStep >= 3 ? 'active' : ''}`} aria-label="Step 3">3</span>
                 <span className={`step ${currentStep >= 4 ? 'active' : ''}`} aria-label="Step 4">4</span>
                 <span className={`step ${currentStep >= 5 ? 'active' : ''}`} aria-label="Step 5">5</span>
               </div>
             </div>
           </div>
           <button 
             className="checkout-close-btn" 
             onClick={closeCheckout}
             aria-label="Close checkout"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
             </svg>
           </button>
         </div>

         <div className="checkout-content">
           {/* Step 1: Delivery Options */}
           {currentStep === 1 && (
             <div className="checkout-step">
               <div className="step-header">
                 <h3>Choose Delivery Method</h3>
                 <p>How would you like to receive your order?</p>
               </div>

               <div className="delivery-options" role="radiogroup" aria-labelledby="delivery-method">
                 <label className={`delivery-option ${selectedOption === 'delivery' ? 'selected' : ''}`}>
                   <input
                     type="radio"
                     name="deliveryOption"
                     value="delivery"
                     checked={selectedOption === 'delivery'}
                     onChange={(e) => setSelectedOption(e.target.value)}
                     aria-describedby="delivery-description"
                   />
                   <div className="delivery-option-content">
                     <div className="delivery-option-icon" aria-hidden="true">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                         <path d="M8 17H16M8 17C8 18.1046 7.10457 19 6 19C4.89543 19 4 18.1046 4 17M8 17C8 15.8954 7.10457 15 6 15C4.89543 15 4 15.8954 4 17M16 17C16 18.1046 16.8954 19 18 19C19.1046 19 20 18.1046 20 17M16 17C16 15.8954 16.8954 15 18 15C19.1046 15 20 15.8954 20 17M10 5V2H14V5M2 7H22L20 15H4L2 7Z" stroke="currentColor" strokeWidth="2"/>
                       </svg>
                     </div>
                     <div className="delivery-option-details">
                       <h4>Home Delivery</h4>
                       <p id="delivery-description">Fast delivery to your doorstep within 24-48 hours</p>
                       <div className="delivery-features">
                         <span>✓ Live location tracking</span>
                         <span>✓ Contactless delivery</span>
                         <span>✓ Secure packaging</span>
                       </div>
                     </div>
                     <div className="delivery-pricing">
                       <span className="delivery-fee">Distance-based</span>
                       <span className="delivery-time">1-2 Days</span>
                     </div>
                   </div>
                 </label>

                 <label className={`delivery-option ${selectedOption === 'pickup' ? 'selected' : ''}`}>
                   <input
                     type="radio"
                     name="deliveryOption"
                     value="pickup"
                     checked={selectedOption === 'pickup'}
                     onChange={(e) => setSelectedOption(e.target.value)}
                     aria-describedby="pickup-description"
                   />
                   <div className="delivery-option-content">
                     <div className="delivery-option-icon" aria-hidden="true">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                         <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21L12 18L19 21Z" stroke="currentColor" strokeWidth="2"/>
                       </svg>
                     </div>
                     <div className="delivery-option-details">
                       <h4>Store Pickup</h4>
                       <p id="pickup-description">Collect your order from our convenient store location</p>
                       <div className="delivery-features">
                         <span>✓ Ready in 2-4 hours</span>
                         <span>✓ No delivery charges</span>
                         <span>✓ Inspect before pickup</span>
                       </div>
                       <div className="pickup-hours">
                         <strong>Pickup Hours:</strong><br/>
                         {formatWorkingHoursFallback()}
                       </div>
                     </div>
                     <div className="delivery-pricing">
                       <span className="delivery-fee free">Free</span>
                       <span className="delivery-time">2-4 Hours</span>
                     </div>
                   </div>
                 </label>
               </div>
               
               {validationErrors.delivery && (
                 <div className="error-message" role="alert">
                   {validationErrors.delivery}
                 </div>
               )}
             </div>
           )}

           {/* Step 2: Customer Information */}
           {currentStep === 2 && (
             <div className="checkout-step">
               <div className="step-header">
                 <h3>Your Information</h3>
                 <p>Please provide your contact details for order confirmation</p>
               </div>

               <div className="customer-form">
                 {/* Google Sign-In Section */}
                 {!user ? (
                   <div className="google-signin-section-top">
                     <div className="signin-prompt">
                       <h4>Quick Sign-In {!isGoogleAuthAvailable && '(Currently Unavailable)'}</h4>
                       <p>
                         {isGoogleAuthAvailable 
                           ? 'Sign in with Google to auto-fill your information and create an account'
                           : 'Google sign-in is temporarily unavailable. Please fill the form manually.'
                         }
                       </p>
                     </div>
                     
                     {isGoogleAuthAvailable && GoogleSignIn && (
                       <GoogleSignIn 
                         onSuccess={handleGoogleSignIn}
                         className="full-width google-signin-primary"
                         disabled={isCheckingUser || isRegistering}
                       />
                     )}
                     
                     {(isCheckingUser || isRegistering) && (
                       <div className="signin-status">
                         <div className="loading-spinner-small"></div>
                         <span>
                           {isCheckingUser && "Checking account..."}
                           {isRegistering && "Creating your account..."}
                         </span>
                       </div>
                     )}
                     
                     {authenticationError && (
                       <div className="auth-error">
                         <span className="error-icon">⚠️</span>
                         <span>{authenticationError}</span>
                       </div>
                     )}
                     
                     <div className="signin-divider">
                       <span>Or fill your details below</span>
                     </div>
                   </div>
                 ) : (
                   // Google Account Info
                   <div className="google-account-info">
                     <div className="account-card">
                       <div className="account-status">
                         {userRegistrationStatus === 'existing' && (
                           <span className="status-badge existing">✅ Existing Account</span>
                         )}
                         {userRegistrationStatus === 'new' && (
                           <span className="status-badge new">🆕 New Account Created</span>
                         )}
                         {!userRegistrationStatus && (
                           <span className="status-badge info">📋 Information Loaded</span>
                         )}
                       </div>
                       {user.picture && (
                         <div className="account-avatar">
                           <img 
                             src={user.picture} 
                             alt={user.name} 
                             onError={(e) => {
                               e.target.style.display = 'none';
                               e.target.nextElementSibling.style.display = 'flex';
                             }} 
                           />
                           <div className="avatar-fallback" style={{ display: 'none' }}>
                             {user.name?.charAt(0)?.toUpperCase() || '👤'}
                           </div>
                         </div>
                       )}
                       <div className="account-details">
                         <h4>{user.name}</h4>
                         <p>{user.email}</p>
                         <small>
                           {userRegistrationStatus === 'existing' 
                             ? 'Signed in with existing Google account' 
                             : userRegistrationStatus === 'new'
                             ? 'New account created with Google'
                             : 'Information loaded from Google'
                           }
                         </small>
                       </div>
                       {signOut && (
                         <button 
                           type="button"
                           onClick={signOut}
                           className="btn btn-text btn-small"
                           title="Sign out"
                         >
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                             <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                             <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                             <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                         </button>
                       )}
                     </div>
                     
                     {userRegistrationStatus === 'new' && (
                       <div className="new-user-info">
                         <div className="info-card success">
                           <div className="info-icon">🎉</div>
                           <div className="info-content">
                             <h5>Welcome to Our Platform!</h5>
                             <p>Your account has been created successfully using Google Sign-In.</p>
                             <small>You can now enjoy a faster checkout experience in future orders.</small>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 )}

                 {/* Form Fields */}
                 <div className="form-row">
                   <div className="form-group">
                     <label htmlFor="customer-name">
                       Full Name *
                       {user && <span className="field-source"> (from Google)</span>}
                     </label>
                     <input
                       id="customer-name"
                       type="text"
                       name="name"
                       value={customerInfo.name || ''}
                       onChange={handleInputChange}
                       placeholder="Enter your full name"
                       required
                       disabled={!!user}
                       aria-invalid={validationErrors.name ? 'true' : 'false'}
                       className={user ? 'disabled-input' : ''}
                     />
                     {validationErrors.name && (
                       <div className="error-message" role="alert">
                         {validationErrors.name}
                       </div>
                     )}
                   </div>
                   
                   <div className="form-group">
                     <label htmlFor="customer-phone">Phone Number *</label>
                     <input
                       id="customer-phone"
                       type="tel"
                       name="phone"
                       value={customerInfo.phone || ''}
                       onChange={handleInputChange}
                       placeholder="0700000000"
                       required
                       aria-invalid={validationErrors.phone ? 'true' : 'false'}
                     />
                     {validationErrors.phone && (
                       <div className="error-message" role="alert">
                         {validationErrors.phone}
                       </div>
                     )}
                   </div>
                 </div>

                 <div className="form-group">
                   <label htmlFor="customer-email">
                     Email Address
                     {user && <span className="field-source"> (from Google)</span>}
                   </label>
                   <input
                     id="customer-email"
                     type="email"
                     name="email"
                     value={customerInfo.email || ''}
                     onChange={handleInputChange}
                     placeholder="your.email@example.com"
                     disabled={!!user}
                     aria-invalid={validationErrors.email ? 'true' : 'false'}
                     className={user ? 'disabled-input' : ''}
                   />
                   {validationErrors.email && (
                     <div className="error-message" role="alert">
                       {validationErrors.email}
                     </div>
                   )}
                 </div>

                 {/* Delivery Address */}
                 {selectedOption === 'delivery' && (
                   <div className="form-group">
                     <label htmlFor="customer-address">Delivery Address *</label>
                     <LocationInput
                       value={customerInfo.address || ''}
                       onChange={handleAddressChange}
                       onLocationSelect={handleLocationSelect}
                       placeholder="Search for any location in Kenya..."
                       disabled={isSubmitting}
                     />
                     {distance > 0 && deliveryLocation && (
                       <div className="delivery-info">
                         <div className="delivery-info-card">
                           <h5>📍 Selected Location</h5>
                           <p><strong>{deliveryLocation.name || 'Selected Address'}</strong></p>
                           <p>{deliveryLocation.address}</p>
                           <div className="delivery-stats">
                             <span>📏 Distance: <strong>{distance.toFixed(1)} km</strong></span>
                             <span>🚚 Delivery Cost: <strong>{formatCurrencyFallback(deliveryCost)}</strong></span>
                           </div>
                           {deliveryLocation.types && deliveryLocation.types.length > 0 && (
                             <div className="location-types">
                               <small>Location type: {deliveryLocation.types.slice(0, 3).join(', ')}</small>
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                     {validationErrors.address && (
                       <div className="error-message" role="alert">
                         {validationErrors.address}
                       </div>
                     )}
                   </div>
                 )}

                 <div className="form-group">
                   <label htmlFor="customer-notes">Special Notes</label>
                   <textarea
                     id="customer-notes"
                     name="notes"
                     value={customerInfo.notes || ''}
                     onChange={handleInputChange}
                     placeholder="Any special instructions, landmarks, or notes for your order"
                     rows="3"
                     disabled={isSubmitting}
                   />
                 </div>
               </div>
             </div>
           )}

           {/* Step 3: Order Review */}
           {currentStep === 3 && (
             <div className="checkout-step">
               <div className="step-header">
                 <h3>Review Your Order</h3>
                 <p>Please confirm your order details before proceeding to payment</p>
               </div>

               <div className="order-review">
                 <OrderSummary
                   items={cartItems}
                   subtotal={subtotal}
                   deliveryCost={finalDeliveryCost}
                   totalAmount={totalAmount}
                   depositAmount={depositAmount}
                   onEditCart={() => setCurrentStep(1)}
                 />

                 <div className="review-section">
                   <h4>Delivery Information</h4>
                   <div className="review-delivery">
                     <div className="delivery-method">
                       <strong>{selectedOption === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</strong>
                       <span className={`delivery-badge ${selectedOption}`}>
                         {selectedOption === 'delivery' ? '🚚' : '🏪'}
                       </span>
                     </div>
                     
                     {selectedOption === 'delivery' ? (
                       <>
                         <p className="review-address">{customerInfo.address}</p>
                         {distance > 0 && deliveryLocation && (
                           <div className="delivery-details">
                             <div className="detail-grid">
                               <div className="detail-item">
                                 <span className="detail-label">📍 Location:</span>
                                 <span className="detail-value">{deliveryLocation.name}</span>
                               </div>
                               <div className="detail-item">
                                 <span className="detail-label">📏 Distance:</span>
                                 <span className="detail-value">{distance.toFixed(1)} km</span>
                               </div>
                               <div className="detail-item">
                                 <span className="detail-label">🚚 Delivery Cost:</span>
                                 <span className="detail-value">{formatCurrencyFallback(deliveryCost)}</span>
                               </div>
                               <div className="detail-item">
                                 <span className="detail-label">⏰ Estimated Time:</span>
                                 <span className="detail-value">24-48 hours</span>
                               </div>
                             </div>
                           </div>
                         )}
                       </>
                     ) : (
                       <div className="pickup-details">
                         <p>🏪 Store Address - Main Street, Nairobi</p>
                         <p>⏰ Pickup Hours: {formatWorkingHoursFallback()}</p>
                         <p>💡 Ready for pickup in 2-4 hours</p>
                       </div>
                     )}
                   </div>
                 </div>

                 <div className="review-section">
                   <h4>Customer Details</h4>
                   <div className="review-customer">
                     <div className="customer-grid">
                       <div className="customer-item">
                         <span className="customer-label">Name:</span>
                         <span className="customer-value">
                           {customerInfo.name} 
                           {user && <span className="google-badge">Google</span>}
                         </span>
                       </div>
                       <div className="customer-item">
                         <span className="customer-label">Phone:</span>
                         <span className="customer-value">{customerInfo.phone}</span>
                       </div>
                       {customerInfo.email && (
                         <div className="customer-item">
                           <span className="customer-label">Email:</span>
                           <span className="customer-value">
                             {customerInfo.email}
                             {user && <span className="google-badge">Google</span>}
                           </span>
                         </div>
                       )}
                       {userRegistrationStatus && (
                         <div className="customer-item">
                           <span className="customer-label">Account:</span>
                           <span className={`customer-value account-status-text ${userRegistrationStatus}`}>
                             {userRegistrationStatus === 'new' ? 'New account created' : 'Existing account'}
                           </span>
                         </div>
                       )}
                       {customerInfo.notes && (
                         <div className="customer-item full-width">
                           <span className="customer-label">Notes:</span>
                           <span className="customer-value">{customerInfo.notes}</span>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Step 4: Payment Method Selection */}
           {currentStep === 4 && (
             <div className="checkout-step">
               <div className="step-header">
                 <h3>Payment Method</h3>
                 <p>Choose your preferred payment method</p>
               </div>

               <PaymentMethodSelector
                 selectedMethod={paymentMethod}
                 onMethodChange={setPaymentMethod}
                 amount={finalDepositDue}
                 depositAmount={depositAmount}
                 disabled={isSubmitting}
               />

               {paymentMethod === 'mpesa' && (
                 <div className="mpesa-setup">
                   <MpesaPhoneInput
                     value={mpesaPhone}
                     onChange={setMpesaPhone}
                     disabled={isSubmitting}
                     error={validationErrors.mpesaPhone}
                   />
                 </div>
               )}

               {validationErrors.payment && (
                 <div className="error-message" role="alert">
                   {validationErrors.payment}
                 </div>
               )}

               {orderSubmissionError && (
                 <div className="error-message" role="alert">
                   <strong>Order Error:</strong> {orderSubmissionError}
                 </div>
               )}

               <div className="payment-summary">
                 <h4>Final Payment Summary</h4>
                 <div className="summary-breakdown">
                   <div className="summary-row">
                     <span>Subtotal ({getCartItemsCount()} items):</span>
                     <span>{formatCurrencyFallback(subtotal)}</span>
                   </div>
                   <div className="summary-row">
                     <span>Product Deposit ({Math.round((DEPOSIT_PERCENTAGE || 0.3) * 100)}%):</span>
                     <span>{formatCurrencyFallback(depositAmount)}</span>
                   </div>
                   <div className="summary-row">
                     <span>Delivery Fee:</span>
                     <span>{formatCurrencyFallback(finalDeliveryCost)}</span>
                   </div>
                   <div className="summary-row total">
                     <span>Total Deposit Due Now:</span>
                     <span>{formatCurrencyFallback(finalDepositDue)}</span>
                   </div>
                   <div className="summary-row balance">
                     <span>Balance on {selectedOption === 'delivery' ? 'Delivery' : 'Pickup'}:</span>
                     <span>{formatCurrencyFallback(totalAmount - depositAmount)}</span>
                   </div>
                   <div className="summary-row grand-total">
                     <span>Grand Total:</span>
                     <span>{formatCurrencyFallback(totalAmount)}</span>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Step 5: Payment Processing */}
           {currentStep === 5 && orderData && (
             <div className="checkout-step">
               <div className="step-header">
                 <h3>Complete Payment</h3>
                 <p>Complete your payment to confirm the order</p>
               </div>

               <div className="order-confirmation">
                 <div className="order-success">
                   <div className="success-icon">✅</div>
                   <h4>Order Created Successfully!</h4>
                   <p>Order ID: <strong>{orderData.orderId}</strong></p>
                   <p>Amount Due: <strong>{formatCurrencyFallback(orderData.amount)}</strong></p>
                 </div>
               </div>

               <PaymentProcessor
                 paymentMethod={paymentMethod}
                 orderData={orderData}
                 mpesaPhone={mpesaPhone}
                 onPaymentSuccess={handlePaymentSuccess}
                 onPaymentError={handlePaymentError}
                 onPaymentCancel={handlePaymentCancel}
                 disabled={isPaymentProcessing}
               />
             </div>
           )}
         </div>

         {/* Enhanced Footer */}
         <div className="checkout-footer">
           <div className="checkout-summary">
             <div className="summary-compact">
               <div className="summary-row">
                 <span>Subtotal ({getCartItemsCount()} items)</span>
                 <span>{formatCurrencyFallback(subtotal)}</span>
               </div>
               <div className="summary-row">
                 <span>Delivery Fee</span>
                 <span>{formatCurrencyFallback(finalDeliveryCost)}</span>
               </div>
               <div className="summary-row total">
                 <span>Total Amount</span>
                 <span>{formatCurrencyFallback(totalAmount)}</span>
               </div>
               {currentStep >= 4 && (
                 <div className="summary-row deposit">
                   <span>Deposit Due Now</span>
                   <span>{formatCurrencyFallback(finalDepositDue)}</span>
                 </div>
               )}
             </div>
           </div>

           <div className="checkout-actions">
             {currentStep > 1 && currentStep < 5 && (
               <button 
                 className="btn btn-secondary"
                 onClick={handlePrevStep}
                 disabled={isSubmitting || isPaymentProcessing}
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                   <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                 </svg>
                 Back
               </button>
             )}
             
             {currentStep < 4 ? (
               <button 
                 className="btn btn-primary"
                 onClick={handleNextStep}
                 disabled={isSubmitting || isPaymentProcessing}
               >
                 Continue
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                   <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                 </svg>
               </button>
             ) : currentStep === 4 ? (
               <button 
                 className="btn btn-primary btn-large"
                 onClick={handleSubmitOrder}
                 disabled={isSubmitting || isPaymentProcessing}
               >
                 {isSubmitting ? (
                   <>
                     <div className="loading-spinner-small" aria-hidden="true"></div>
                     Creating Order...
                   </>
                 ) : (
                   <>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                       <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17" stroke="currentColor" strokeWidth="2"/>
                     </svg>
                     Create Order & Proceed to Payment
                   </>
                 )}
               </button>
             ) : (
               // Step 5 - Payment processing, no footer buttons needed
               <div className="payment-info-text">
                 <small>Complete your payment above to finalize your order</small>
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   </>
 );
});

CheckoutModal.displayName = 'CheckoutModal';
export default CheckoutModal;