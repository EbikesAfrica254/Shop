// src/pages/public/ProductsPage.jsx - UPDATED WITH CART AND CHECKOUT
import React, { useState, useCallback, useMemo, memo } from 'react';
import { useProductsAPI } from '../../hooks/useProductsAPI';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import SearchInput from '../../components/ui/SearchInput';
import CategoryFilter from '../../components/filters/CategoryFilter';
import ProductCard from '../../components/product/ProductCard';
import FloatingCartButton from '../../components/cart/FloatingCartButton';
import CartSidebar from '../../components/cart/CartSidebar';
import CheckoutModal from '../../components/checkout/CheckoutModal';
import { useCart } from '../../contexts/CartContext';
import "../../styles/pages/public/ProductsPage.css";

const ProductsPage = memo(() => {
  const { products, loading, error, retry } = useProductsAPI();
  const [addedToCart, setAddedToCart] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const { addToCart } = useCart();

  const calculateDiscountedPrice = (price, discountAmount = 0) => {
    return price - discountAmount;
  };

  // Your existing logic here...
  const categories = useMemo(() => {
    const categorySet = new Set();
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  const categorizedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  }, [products]);

  const processedProducts = useMemo(() => {
    let filteredCategories = selectedCategory === 'all' 
      ? categorizedProducts 
      : { [selectedCategory]: categorizedProducts[selectedCategory] || [] };

    const searchFilteredCategories = Object.entries(filteredCategories).reduce((acc, [category, categoryProducts]) => {
      const filtered = categoryProducts.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower)
        );
      });
      
      if (filtered.length > 0) {
        const sorted = [...filtered].sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'price':
              aValue = a.discount ? 
                calculateDiscountedPrice(a.price, a.discount_amount) : 
                a.price;
              bValue = b.discount ? 
                calculateDiscountedPrice(b.price, b.discount_amount) : 
                b.price;
              break;
            case 'name':
            default:
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        acc[category] = sorted;
      }
      return acc;
    }, {});

    return searchFilteredCategories;
  }, [categorizedProducts, selectedCategory, searchTerm, sortBy, sortOrder]);

  const handleAddToCart = useCallback((product) => {
    addToCart(product, 1);
    
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product.id]: false }));
    }, 3000);
  }, [addToCart]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    setSortOrder('asc');
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner text="Loading premium products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorDisplay 
          error={error}
          onRetry={retry}
          title="Failed to Load Products"
        />
      </div>
    );
  }

  const totalProducts = Object.values(processedProducts).reduce((sum, categoryProducts) => sum + categoryProducts.length, 0);

  return (
    <div className="page-container">
      {/* Enhanced Header */}
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

      {/* Enhanced Filters */}
      <div className="filters-section">
        <div className="search-container">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search products by name, description, or category..."
          />
        </div>
        
        <div className="filters-row">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <div className="sort-controls">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select 
              id="sort-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="sort-select"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
          
          {(searchTerm || selectedCategory !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
            <button 
              className="btn btn-secondary btn-reset"
              onClick={handleResetFilters}
              aria-label="Reset all filters"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Products Grid */}
      <main className="main-content">
        {Object.keys(processedProducts).length > 0 ? (
          Object.entries(processedProducts).map(([category, categoryProducts]) => (
            <section key={category} className="category-section">
              <div className="category-header">
                <h2 className="category-title">{category}</h2>
                <span className="category-count" aria-label={`${categoryProducts.length} items in ${category}`}>
                  {categoryProducts.length} items
                </span>
              </div>
              
              <div className="products-container">
                <div className="products-grid" role="grid" aria-label={`Products in ${category} category`}>
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      isAdded={addedToCart[product.id]}
                    />
                  ))}
                </div>
              </div>
            </section>
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon" aria-hidden="true">🔍</div>
            <h3>No products found</h3>
            <p>
              {searchTerm 
                ? `No products match "${searchTerm}". Try different keywords or browse all categories.`
                : 'No products available in the selected category.'
              }
            </p>
            <button 
              className="btn btn-primary"
              onClick={handleResetFilters}
            >
              Show All Products
            </button>
          </div>
        )}
      </main>
      
      {/* Cart Components */}
      <FloatingCartButton />
      <CartSidebar />
      <CheckoutModal />
    </div>
  );
});

ProductsPage.displayName = 'ProductsPage';
export default ProductsPage;