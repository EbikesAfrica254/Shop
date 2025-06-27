// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your components
import LandingPage from '../pages/public/LandingPage';
import AboutPage from '../pages/public/AboutPage';
import Header from '../components/layout/Header';

// Import service pages - CREATE THESE FILES
import BikeServicingPage from '../pages/services/BikeServicingPage';
import BatteryReplacementPage from '../pages/services/BatteryReplacementPage';
import ConversionKitsPage from '../pages/services/ConversionKitsPage';
import TestRidePage from '../pages/services/TestRidePage';
import WarrantyPage from '../pages/services/WarrantyPage';

// Layout wrapper component
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}> {/* Fixed header padding */}
        {children}
      </main>
    </>
  );
};

// Placeholder components for routes that don't exist yet
const PlaceholderPage = ({ title, description }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '2rem'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      maxWidth: '28rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '1rem'
      }}>{title}</h1>
      <p style={{
        color: '#6b7280',
        marginBottom: '1.5rem'
      }}>{description}</p>
      <a 
        href="/" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
      >
        ← Back to Home
      </a>
    </div>
  </div>
);

/**
 * Main App Routes Component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <Layout>
          <LandingPage />
        </Layout>
      } />
      
      {/* About Page */}
      <Route path="/about" element={
        <Layout>
          <AboutPage />
        </Layout>
      } />
      
      {/* Product Routes */}
      <Route path="/products" element={
        <Layout>
          <PlaceholderPage 
            title="Products" 
            description="Our complete collection of premium e-bikes is coming soon!" 
          />
        </Layout>
      } />
      
      <Route path="/products/city" element={
        <Layout>
          <PlaceholderPage 
            title="City E-Bikes" 
            description="Perfect for urban commuting and city adventures." 
          />
        </Layout>
      } />
      
      <Route path="/products/mountain" element={
        <Layout>
          <PlaceholderPage 
            title="Mountain E-Bikes" 
            description="Conquer any terrain with our powerful mountain e-bikes." 
          />
        </Layout>
      } />
      
      <Route path="/products/cargo" element={
        <Layout>
          <PlaceholderPage 
            title="Cargo E-Bikes" 
            description="Heavy-duty e-bikes for commercial and cargo needs." 
          />
        </Layout>
      } />
      
      <Route path="/products/accessories" element={
        <Layout>
          <PlaceholderPage 
            title="E-Bike Accessories" 
            description="Essential accessories to enhance your e-bike experience." 
          />
        </Layout>
      } />
      
      <Route path="/products/parts" element={
        <Layout>
          <PlaceholderPage 
            title="Spare Parts" 
            description="Quality replacement parts for your e-bike maintenance." 
          />
        </Layout>
      } />

      {/* SERVICE ROUTES - THE MISSING ROUTES! */}
      <Route path="/services" element={
        <Layout>
          <PlaceholderPage 
            title="Our Services" 
            description="Comprehensive e-bike services and support." 
          />
        </Layout>
      } />
      
      <Route path="/services/maintenance" element={
        <Layout>
          <BikeServicingPage />
        </Layout>
      } />
      
      <Route path="/services/battery" element={
        <Layout>
          <BatteryReplacementPage />
        </Layout>
      } />
      
      <Route path="/services/conversion" element={
        <Layout>
          <ConversionKitsPage />
        </Layout>
      } />
      
      <Route path="/services/test-ride" element={
        <Layout>
          <TestRidePage />
        </Layout>
      } />
      
      <Route path="/services/warranty" element={
        <Layout>
          <WarrantyPage />
        </Layout>
      } />

      {/* Contact Route */}
      <Route path="/contact" element={
        <Layout>
          <PlaceholderPage 
            title="Contact Us" 
            description="Get in touch with our team. We'd love to hear from you!" 
          />
        </Layout>
      } />

      {/* Auth Routes */}
      <Route path="/login" element={
        <Layout>
          <PlaceholderPage 
            title="Customer Login" 
            description="Customer portal access coming soon." 
          />
        </Layout>
      } />

      <Route path="/employee-login" element={
        <Layout>
          <PlaceholderPage 
            title="Employee Login" 
            description="Employee portal access coming soon." 
          />
        </Layout>
      } />

      {/* Dashboard Routes (Protected) */}
      <Route path="/admin-dashboard" element={
        <Layout>
          <PlaceholderPage 
            title="Admin Dashboard" 
            description="Admin panel access coming soon." 
          />
        </Layout>
      } />

      <Route path="/manager-dashboard" element={
        <Layout>
          <PlaceholderPage 
            title="Manager Dashboard" 
            description="Manager panel access coming soon." 
          />
        </Layout>
      } />

      <Route path="/cashier-dashboard" element={
        <Layout>
          <PlaceholderPage 
            title="Cashier Dashboard" 
            description="Cashier panel access coming soon." 
          />
        </Layout>
      } />

      <Route path="/employee-dashboard" element={
        <Layout>
          <PlaceholderPage 
            title="Employee Dashboard" 
            description="Employee panel access coming soon." 
          />
        </Layout>
      } />

      <Route path="/profile" element={
        <Layout>
          <PlaceholderPage 
            title="Profile" 
            description="User profile management coming soon." 
          />
        </Layout>
      } />

      {/* 404 Page */}
      <Route path="*" element={
        <Layout>
          <PlaceholderPage 
            title="Page Not Found" 
            description="The page you're looking for doesn't exist." 
          />
        </Layout>
      } />
    </Routes>
  );
};

export default AppRoutes;