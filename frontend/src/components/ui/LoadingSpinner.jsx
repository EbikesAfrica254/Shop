// src/components/ui/LoadingSpinner.jsx
import React, { memo } from 'react';

const LoadingSpinner = memo(({ text = 'Loading...' }) => (
  <div className="loading-container">
    <div className="loading-spinner" />
    <p className="loading-text">{text}</p>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';
export default LoadingSpinner;