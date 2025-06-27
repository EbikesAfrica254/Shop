// src/components/common/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚴‍♂️</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Looks like you've taken a wrong turn on your e-bike journey! 
          The page you're looking for doesn't exist.
        </p>
      </div>
      
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-block w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
        >
          🏠 Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
        >
          ← Go Back
        </button>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Need help finding what you're looking for?</p>
        <Link
          to="/contact"
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors duration-300"
        >
          Contact Support →
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;