// src/components/product/ProductCard.jsx
import React, { useMemo, useCallback, memo } from 'react';

const ProductCard = memo(({ product, onAddToCart, isAdded }) => {
  const handleAddToCartClick = useCallback((e) => {
    e.stopPropagation();
    onAddToCart(product);
  }, [onAddToCart, product]);

  const formatCurrency = (amount) => {
    return `KSh ${Number(amount).toLocaleString()}`;
  };

  const calculateDiscountedPrice = (price, discountAmount = 0) => {
    return price - discountAmount;
  };

  const calculateDiscountPercentage = (originalPrice, discountAmount) => {
    return Math.round((discountAmount / originalPrice) * 100);
  };

  const finalPrice = useMemo(() => 
    product.discount ? 
      calculateDiscountedPrice(product.price, product.discount_amount) : 
      product.price,
    [product.discount, product.price, product.discount_amount]
  );

  const discountPercentage = useMemo(() => 
    product.discount ? 
      calculateDiscountPercentage(product.price, product.discount_amount) : 0,
    [product.discount, product.price, product.discount_amount]
  );

  const depositAmount = useMemo(() => finalPrice * 0.7, [finalPrice]);

  return (
    <div className="product-card">
      {product.discount && (
        <div className="discount-badge">
          -{discountPercentage}%
        </div>
      )}
      
      <div className="product-image-container">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>

      <div className="product-content">
        <div className="product-header">
          <h3 className="product-title">{product.name}</h3>
          {product.category && (
            <span className="category-badge">{product.category}</span>
          )}
        </div>
        
        <div className="product-price">
          {product.discount ? (
            <div className="price-with-discount">
              <span className="price-original">
                {formatCurrency(product.price)}
              </span>
              <span className="price-current">
                {formatCurrency(finalPrice)}
              </span>
            </div>
          ) : (
            <span className="price-current">
              {formatCurrency(product.price)}
            </span>
          )}
          <div className="deposit-display">
            <span className="deposit-label">70% Deposit:</span>
            <span className="deposit-amount">{formatCurrency(depositAmount)}</span>
          </div>
        </div>
        
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        <div className="product-actions">
          <button 
            className={`btn-compact btn-primary ${isAdded ? 'btn-added' : ''}`}
            onClick={handleAddToCartClick}
            disabled={isAdded}
          >
            {isAdded ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Added
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;