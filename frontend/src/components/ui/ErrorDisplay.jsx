// src/components/ui/ErrorDisplay.jsx
import React, { memo } from 'react';

const ErrorDisplay = memo(({ error, onRetry, title = "Oops! Something went wrong" }) => (
  <div className="error-container">
    <div className="error-icon">⚠️</div>
    <h3>{title}</h3>
    <p>{error}</p>
    {onRetry && (
      <button className="btn btn-primary" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';
export default ErrorDisplay;