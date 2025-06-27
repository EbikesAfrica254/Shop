// src/contexts/CartContext.jsx - Updated to include NotificationContainer
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, memo } from 'react';

// Constants
const STORAGE_KEY = 'professional_cart';
const BUSINESS_PHONE = '+254700000000';
const DEPOSIT_PERCENTAGE = 0.7;

// Utility functions
const formatCurrency = (amount) => {
  return `KSh ${Number(amount).toLocaleString()}`;
};

const calculateDiscountedPrice = (price, discountAmount = 0) => {
  return price - discountAmount;
};

// Enhanced localStorage hook with better error handling
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === "undefined" || item === "null" || item === "") {
        return initialValue;
      }
      const parsed = JSON.parse(item);
      return parsed !== null && parsed !== undefined ? parsed : initialValue;
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
      try {
        window.localStorage.removeItem(key);
      } catch (clearError) {
        console.warn(`Error clearing corrupted ${key}:`, clearError);
      }
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      if (value === undefined || value === null) {
        window.localStorage.removeItem(key);
      } else {
        const serializedValue = JSON.stringify(value);
        window.localStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error);
      try {
        window.localStorage.removeItem(key);
      } catch (clearError) {
        console.warn(`Error clearing ${key} after save failure:`, clearError);
      }
    }
  }, [key]);

  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error clearing ${key}:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
};

// Notification Component
const NotificationContainer = memo(() => {
  const { notifications } = useCart();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container" aria-live="polite">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          <span>{notification.message}</span>
        </div>
      ))}
    </div>
  );
});

NotificationContainer.displayName = 'NotificationContainer';

// Cart Context
const CartContext = createContext();

export const CartProvider = memo(({ children }) => {
  const [cartItems, setCartItems, clearCartStorage] = useLocalStorage(STORAGE_KEY, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Enhanced notification system
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  // Validate cart data on mount
  useEffect(() => {
    if (!Array.isArray(cartItems)) {
      console.warn('Cart items is not an array, resetting...');
      clearCartStorage();
      addNotification('Cart data was corrupted and has been reset', 'info');
    }
  }, [cartItems, clearCartStorage, addNotification]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    const shouldLockScroll = isCheckoutOpen || isProductModalOpen || isCartOpen;
    
    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isCheckoutOpen, isProductModalOpen, isCartOpen]);

  // Enhanced cart operations with validation
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.id || quantity < 1) {
      addNotification('Invalid product or quantity', 'error');
      return;
    }

    setCartItems(prevItems => {
      const safeItems = Array.isArray(prevItems) ? prevItems : [];
      const existingItem = safeItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        addNotification(`Updated ${product.name} quantity to ${newQuantity}`, 'success');
        return safeItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        addNotification(`Added ${product.name} to cart`, 'success');
        return [...safeItems, { ...product, quantity }];
      }
    });

    // Auto-open cart when item is added
    setIsCartOpen(true);
  }, [addNotification, setCartItems]);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => {
      const safeItems = Array.isArray(prevItems) ? prevItems : [];
      const item = safeItems.find(item => item.id === productId);
      if (item) {
        addNotification(`Removed ${item.name} from cart`, 'info');
      }
      return safeItems.filter(item => item.id !== productId);
    });
  }, [addNotification, setCartItems]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      const safeItems = Array.isArray(prevItems) ? prevItems : [];
      return safeItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, [removeFromCart, setCartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    addNotification('Cart cleared', 'info');
  }, [setCartItems, addNotification]);

  // Memoized calculations
  const cartStats = useMemo(() => {
    const safeItems = Array.isArray(cartItems) ? cartItems : [];
    const total = safeItems.reduce((sum, item) => {
      const itemPrice = item.discount ? 
        calculateDiscountedPrice(item.price, item.discount_amount) : 
        item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);

    const itemCount = safeItems.reduce((sum, item) => sum + item.quantity, 0);
    const depositAmount = total * DEPOSIT_PERCENTAGE;

    return { total, itemCount, depositAmount };
  }, [cartItems]);

  const openCheckout = useCallback(() => {
    const safeItems = Array.isArray(cartItems) ? cartItems : [];
    if (safeItems.length === 0) {
      addNotification('Your cart is empty. Please add items before checkout.', 'warning');
      return;
    }
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  }, [cartItems, addNotification]);

  const openProductModal = useCallback((product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  // Enhanced WhatsApp functionality with error handling
  const sendWhatsAppEnquiry = useCallback(async (businessPhone = BUSINESS_PHONE) => {
    const safeItems = Array.isArray(cartItems) ? cartItems : [];
    if (safeItems.length === 0) {
      addNotification('Your cart is empty. Please add items before making an enquiry.', 'warning');
      return;
    }

    try {
      const cartSummary = safeItems.map(item => {
        const itemPrice = item.discount ? 
          calculateDiscountedPrice(item.price, item.discount_amount) : 
          item.price;
        
        return `• ${item.name} (x${item.quantity}) - ${formatCurrency(itemPrice * item.quantity)}`;
      }).join('\n');

      const message = `🛒 *Professional Product Enquiry*

Hello! I'm interested in the following premium items:

${cartSummary}

📊 *Order Summary:*
- Total Items: ${cartStats.itemCount}
- Total Amount: ${formatCurrency(cartStats.total)}
- Deposit Required (70%): ${formatCurrency(cartStats.depositAmount)}

I would appreciate information about:
✓ Product availability & specifications
✓ Delivery timeline & shipping options  
✓ Payment methods & installment plans
✓ Warranty & after-sales support
✓ Current promotions or bulk discounts

Thank you for your professional service. I look forward to your prompt response.

Best regards,
${new Date().toLocaleDateString('en-KE', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${businessPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
      
      const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!opened || opened.closed || typeof opened.closed == 'undefined') {
        throw new Error('Popup blocked or failed to open');
      }
      
      addNotification('WhatsApp enquiry sent successfully!', 'success');
    } catch (error) {
      console.error('WhatsApp enquiry error:', error);
      addNotification('Failed to send WhatsApp enquiry. Please try again.', 'error');
    }
  }, [cartItems, cartStats, addNotification]);

  const value = useMemo(() => ({
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal: () => cartStats.total,
    getCartItemsCount: () => cartStats.itemCount,
    getDepositAmount: () => cartStats.depositAmount,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isProductModalOpen,
    selectedProduct,
    openCheckout,
    openProductModal,
    closeProductModal,
    closeCheckout,
    sendWhatsAppEnquiry,
    notifications,
    addNotification
  }), [
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartStats,
    isCartOpen,
    isCheckoutOpen,
    isProductModalOpen,
    selectedProduct,
    openCheckout,
    openProductModal,
    closeProductModal,
    closeCheckout,
    sendWhatsAppEnquiry,
    notifications,
    addNotification
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </CartContext.Provider>
  );
});

CartProvider.displayName = 'CartProvider';

// Custom hook with error handling
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};