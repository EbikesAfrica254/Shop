// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'default', message = 'Loading E-Bikes Africa' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          
          {/* Main spinner */}
          <div className="relative bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-full">
            <svg 
              className={`${sizeClasses[size]} text-white animate-spin`} 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="opacity-25"
              />
              <path 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                className="opacity-75"
              />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">{message}</h3>
          <p className="text-sm text-gray-500">Preparing your sustainable journey...</p>
          <div className="mt-3 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;