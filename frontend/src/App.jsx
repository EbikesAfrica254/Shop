// src/App.jsx - UPDATED WITH GOOGLE AUTH PROVIDER
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { GoogleAuthProvider } from './contexts/GoogleAuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import ProductsPage from './pages/public/ProductsPage';
import BatteryReplacementPage from './pages/services/BatteryReplacementPage';
import BikeServicingPage from './pages/services/BikeServicingPage';
import ConversionKitsPage from './pages/services/ConversionKitsPage';
import TestRidePage from './pages/services/TestRidePage';
import WarrantyPage from './pages/services/WarrantyPage';

function App() {
  return (
    <GoogleAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              
              {/* Products Page - Full E-commerce Experience */}
              <Route path="/products" element={<ProductsPage />} />
              
              {/* Service Routes - Match Header Navigation */}
              <Route path="/services/maintenance" element={<BikeServicingPage />} />
              <Route path="/services/battery-replacement" element={<BatteryReplacementPage />} />
              <Route path="/services/conversion" element={<ConversionKitsPage />} />
              <Route path="/services/test-ride" element={<TestRidePage />} />
              <Route path="/services/warranty" element={<WarrantyPage />} />
              
              {/* Alternative routes for backward compatibility */}
              <Route path="/services/bike-servicing" element={<BikeServicingPage />} />
              <Route path="/services/conversion-kits" element={<ConversionKitsPage />} />
              
              {/* Public Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </GoogleAuthProvider>
  );
}

export default App;