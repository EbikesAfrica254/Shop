// src/components/ui/SearchInput.jsx
import React, { useState, useCallback, memo } from 'react';

const SearchInput = memo(({ value, onChange, placeholder = "Search products..." }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className="search-wrapper">
      <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="search-input"
      />
      {localValue && (
        <button 
          className="search-clear" 
          onClick={handleClear}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
export default SearchInput;