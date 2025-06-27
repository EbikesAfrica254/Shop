// src/components/cart/CartSidebar.jsx
import React, { useCallback, memo, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';

const CartSidebar = memo(() => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    getCartItemsCount,
    isCartOpen, 
    setIsCartOpen,
    sendWhatsAppEnquiry,
    openCheckout
  } = useCart();

  const formatCurrency = (amount) => {
    return `KSh ${Number(amount).toLocaleString()}`;
  };

  const calculateDiscountedPrice = (price, discountAmount = 0) => {
    return price - discountAmount;
  };

  const calculateItemPrice = (item) => {
    return item.discount ? calculateDiscountedPrice(item.price, item.discount_amount) : item.price;
  };

  // Close cart on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isCartOpen, setIsCartOpen]);

  const handleClearCart = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return;
    openCheckout();
  }, [cartItems.length, openCheckout]);

  if (!isCartOpen) return null;

  const totalAmount = getCartTotal();
  const itemCount = getCartItemsCount();
  const depositAmount = totalAmount * 0.7; // 70% deposit

  return (
    <>
      {/* Overlay */}
      <div 
        className="cart-overlay" 
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      
      {/* Cart Sidebar */}
      <div 
        className="cart-sidebar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-section">
            <h2 id="cart-title">Shopping Cart</h2>
            <span className="cart-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
          <button 
            className="cart-close-btn" 
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Discover our amazing products and add them to your cart!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map(item => {
                  const itemPrice = calculateItemPrice(item);
                  const itemTotal = itemPrice * item.quantity;
                  
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="cart-item-img"
                          />
                        ) : (
                          <div className="cart-item-placeholder">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                              <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <div className="cart-item-price">
                          {formatCurrency(itemPrice)} 
                          {item.discount && (
                            <span className="original-price">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>
                        
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="qty-btn"
                              disabled={item.quantity <= 1}
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="qty-btn"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                          
                          <button 
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                        
                        <div className="cart-item-total">
                          Total: {formatCurrency(itemTotal)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Cart Footer */}
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="summary-row deposit">
                    <span>70% Deposit Required</span>
                    <span>{formatCurrency(depositAmount)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
                
                <div className="cart-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleCheckout}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Checkout
                  </button>
                  
                  <button 
                    className="btn btn-whatsapp"
                    onClick={() => sendWhatsAppEnquiry()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.22 21 7.21 20.24 5.67 18.96L2.5 21L4.33 17.4C3.24 15.88 2.5 14.01 2.5 11.97C2.5 6.73 6.73 2.5 11.97 2.5C17.22 2.5 21.45 6.73 21.45 11.97" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    WhatsApp Order
                  </button>
                  
                  <button 
                    className="btn btn-secondary"
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </button>
                  
                  <button 
                    className="btn btn-outline"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
});

CartSidebar.displayName = 'CartSidebar';
export default CartSidebar;