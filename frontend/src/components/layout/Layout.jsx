// src/components/layout/Layout.jsx - CLEAN PRODUCTION VERSION
import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ArrowUp, Loader2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '../common/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

// Import layout styles
import '../../styles/components/layout.css';

/**
 * Layout component that wraps all pages
 * Provides consistent header, footer, navigation, and error handling
 */
const Layout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle route changes - scroll to top and show loading
  useEffect(() => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="ebikes-layout-loading-container">
      <div className="ebikes-layout-loading-content">
        <Loader2 className="ebikes-layout-loading-spinner" />
        <p className="ebikes-layout-loading-text">Loading...</p>
      </div>
    </div>
  );

  // Error fallback component
  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="ebikes-layout-error-container">
      <div className="ebikes-layout-error-content">
        <div className="ebikes-layout-error-inner">
          <div className="ebikes-layout-error-icon">
            <span className="ebikes-layout-error-emoji">😵</span>
          </div>
          <h2 className="ebikes-layout-error-title">
            Oops! Something went wrong
          </h2>
          <p className="ebikes-layout-error-description">
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
        </div>
        
        <div className="ebikes-layout-error-actions">
          <button
            onClick={resetErrorBoundary}
            className="ebikes-layout-error-button-primary"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="ebikes-layout-error-button-secondary"
          >
            Refresh Page
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="ebikes-layout-error-details">
            <summary className="ebikes-layout-error-summary">
              Error Details (Development)
            </summary>
            <pre className="ebikes-layout-error-code">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );

  return (
    <div className="ebikes-layout-wrapper">
      {/* Header */}
      <Header />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="ebikes-layout-toast"
        bodyClassName="ebikes-layout-toast-body"
        progressClassName="ebikes-layout-toast-progress"
      />

      {/* Main Content */}
      <ErrorBoundary fallback={ErrorFallback}>
        <main className="ebikes-layout-main">
          <div className="ebikes-layout-page-container">
            <div className="ebikes-layout-page-content">
              <Suspense fallback={<LoadingSpinner />}>
                {isLoading ? <LoadingSpinner /> : <Outlet />}
              </Suspense>
            </div>
          </div>
        </main>
      </ErrorBoundary>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="ebikes-layout-scroll-top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="ebikes-layout-scroll-icon" />
        </button>
      )}
    </div>
  );
};

export default Layout;