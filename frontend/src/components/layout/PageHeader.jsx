// src/components/layout/PageHeader.jsx
import React, { memo } from 'react';

const PageHeader = memo(({ products, categories, totalProducts }) => {
  return (
    <header className="page-header">
      <div className="header-content">
        <div className="header-title">
          <h1>Premium Products</h1>
          <p>Discover our curated collection with flexible payment options</p>
          <div className="payment-highlight">
            <span className="highlight-badge">💳 Pay 70% Deposit</span>
            <span className="highlight-badge">🚚 Distance-based Delivery</span>
            <span className="highlight-badge">💰 M-Pesa & Bank Transfer</span>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{products.length}</span>
            <span className="stat-label">Total Products</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{totalProducts}</span>
            <span className="stat-label">Showing</span>
          </div>
        </div>
      </div>
    </header>
  );
});

PageHeader.displayName = 'PageHeader';
export default PageHeader;