// src/components/ui/SafeImage.jsx
import React, { useState, useCallback, useEffect, memo } from 'react';

const SafeImage = memo(({ src, alt, className, fallback, onError, onLoad, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback((e) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasError(false);
      setIsLoading(true);
    }
    
    onError?.(e);
  }, [fallback, imageSrc, onError]);

  useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src);
      setIsLoading(!!src);
      setHasError(false);
    }
  }, [src, imageSrc]);

  if (!src || (hasError && !fallback)) {
    return (
      <div className={`image-placeholder ${className || ''}`} {...props}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`image-loading ${className || ''}`}>
          <div className="loading-spinner-small" />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className || ''} ${isLoading ? 'loading' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        style={isLoading ? { display: 'none' } : {}}
        {...props}
      />
    </>
  );
});

SafeImage.displayName = 'SafeImage';
export default SafeImage;