// src/utils/constants.js
export const STORAGE_KEY = 'professional_cart';
export const BUSINESS_PHONE = '+254700000000';
export const DEBOUNCE_DELAY = 300;
export const STORE_LOCATION = { lat: -1.3019295, lng: 36.7985027 };
export const DELIVERY_RATE_PER_10KM = 50;
export const DEPOSIT_PERCENTAGE = 0.7;
export const WORKING_HOURS = {
  weekday: { open: '9:00 AM', close: '4:00 PM' },
  weekend: { open: '10:00 AM', close: '2:00 PM' }
};

// Google API Keys - with fallback for undefined process
export const GOOGLE_MAPS_API_KEY = 'AIzaSyABpMswcGYJwpwSyXE4WgsUPyzQuqpOzo4';
export const GOOGLE_CLIENT_ID = (typeof process !== 'undefined' && process.env) 
  ? process.env.REACT_APP_GOOGLE_CLIENT_ID 
  : import.meta.env.VITE_GOOGLE_CLIENT_ID;
