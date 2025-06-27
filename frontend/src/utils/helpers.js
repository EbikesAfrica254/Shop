// src/utils/helpers.js
import { DELIVERY_RATE_PER_10KM, WORKING_HOURS } from './constants';

export const formatCurrency = (amount) => {
  return `KSh ${Number(amount).toLocaleString()}`;
};

export const calculateDiscountedPrice = (price, discountAmount = 0) => {
  return price - discountAmount;
};

export const calculateDiscountPercentage = (originalPrice, discountAmount) => {
  return Math.round((discountAmount / originalPrice) * 100);
};

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateDeliveryCost = (distanceKm) => {
  const blocks = Math.ceil(distanceKm / 10);
  return blocks * DELIVERY_RATE_PER_10KM;
};

export const formatWorkingHours = () => {
  return `Weekdays: ${WORKING_HOURS.weekday.open} - ${WORKING_HOURS.weekday.close}, Weekends: ${WORKING_HOURS.weekend.open} - ${WORKING_HOURS.weekend.close}`;
};