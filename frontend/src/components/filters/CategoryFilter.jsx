// src/components/filters/CategoryFilter.jsx
import React, { useCallback, memo } from 'react';

const CategoryFilter = memo(({ categories, selectedCategory, onCategoryChange }) => {
  const handleCategoryChange = useCallback((category) => {
    onCategoryChange(category);
  }, [onCategoryChange]);

  return (
    <div className="category-filters">
      <button 
        className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
        onClick={() => handleCategoryChange('all')}
      >
        All Categories
      </button>
      {categories.map(category => (
        <button 
          key={category}
          className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => handleCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
export default CategoryFilter;