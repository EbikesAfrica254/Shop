// src/contexts/GoogleAuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GOOGLE_CLIENT_ID } from '../utils/constants';

const GoogleAuthContext = createContext();

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};

export const GoogleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Google Auth
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        // Check if Google Client ID is available
        if (!GOOGLE_CLIENT_ID) {
          console.warn('Google Client ID not found. Google authentication will be disabled.');
          setIsLoading(false);
          return;
        }

        await new Promise((resolve, reject) => {
          // Check if script is already loaded
          if (window.google && window.google.accounts) {
            resolve();
            return;
          }

          const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
          if (existingScript) {
            existingScript.addEventListener('load', resolve);
            existingScript.addEventListener('error', reject);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Check if user is already signed in
        const savedUser = localStorage.getItem('googleUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('googleUser');
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGoogleAuth();
  }, []);

  const handleCredentialResponse = (response) => {
    try {
      // Decode JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const userData = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        verified_email: payload.email_verified,
        locale: payload.locale,
      };

      setUser(userData);
      localStorage.setItem('googleUser', JSON.stringify(userData));
      
      // Optional: Trigger custom event for other components
      window.dispatchEvent(new CustomEvent('googleSignIn', { detail: userData }));
    } catch (error) {
      console.error('Error handling credential response:', error);
    }
  };

  const signIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      return;
    }

    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google Sign-In prompt not displayed or skipped');
        }
      });
    } else {
      console.error('Google Identity Services not loaded');
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('googleUser');
    
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Optional: Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('googleSignOut'));
  };

  // Check if Google Auth is available
  const isGoogleAuthAvailable = () => {
    return !!(GOOGLE_CLIENT_ID && window.google && window.google.accounts && isInitialized);
  };

  const value = {
    user,
    isLoading,
    isInitialized,
    isGoogleAuthAvailable: isGoogleAuthAvailable(),
    signIn,
    signOut,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};
