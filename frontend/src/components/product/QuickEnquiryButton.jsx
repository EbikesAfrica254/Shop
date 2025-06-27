// src/components/product/QuickEnquiryButton.jsx
import React, { useCallback, memo } from 'react';
import { useCart } from '../../contexts/CartContext';

const QuickEnquiryButton = memo(({ product }) => {
  const { addToCart, sendWhatsAppEnquiry } = useCart();

  const handleQuickEnquiry = useCallback(() => {
    addToCart(product, 1);
    setTimeout(() => sendWhatsAppEnquiry(), 200);
  }, [product, addToCart, sendWhatsAppEnquiry]);

  return (
    <button className="btn-compact btn-outline" onClick={handleQuickEnquiry}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.22 21 7.21 20.24 5.67 18.96L2.5 21L4.33 17.4C3.24 15.88 2.5 14.01 2.5 11.97C2.5 6.73 6.73 2.5 11.97 2.5C17.22 2.5 21.45 6.73 21.45 11.97" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Quick Enquiry
    </button>
  );
});

QuickEnquiryButton.displayName = 'QuickEnquiryButton';
export default QuickEnquiryButton;