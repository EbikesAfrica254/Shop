// src/components/cart/FloatingCartButton.jsx
import React, { memo } from 'react';
import { useCart } from '../../contexts/CartContext';

const FloatingCartButton = memo(() => {
  const { getCartItemsCount, setIsCartOpen } = useCart();
  const itemCount = getCartItemsCount();

  return (
    <div className="floating-cart">
      <button 
        className={`floating-cart-btn ${itemCount > 0 ? 'has-items' : ''}`}
        onClick={() => setIsCartOpen(true)}
        aria-label={`Open shopping cart with ${itemCount} items`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path 
            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {itemCount > 0 && (
          <>
            <span className="cart-badge">{itemCount}</span>
            <div className="cart-pulse" />
          </>
        )}
      </button>
    </div>
  );
});

FloatingCartButton.displayName = 'FloatingCartButton';
export default FloatingCartButton;