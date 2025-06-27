// src/components/layout/Header.jsx - ENHANCED MODERN VERSION
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bike, 
  Menu, 
  X, 
  User, 
  LogIn, 
  Phone,
  MapPin,
  Zap,
  ChevronDown
} from 'lucide-react';

// Import header styles
import '../../styles/components/header.css';

/**
 * Enhanced Header Component with Logo and Employee Login
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Check if current route is active
  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Handle navigation to sections
  const handleSectionNavigation = (path, sectionId = null) => {
    if (sectionId && location.pathname === path) {
      // If already on the page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (sectionId) {
      // Navigate to page and then scroll to section
      navigate(path);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Regular navigation
      navigate(path);
    }
    
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // Main navigation items
  const navigationItems = [
    { 
      name: 'Home', 
      href: '/', 
      exact: true 
    },
    { 
      name: 'Products', 
      href: '/products',
      dropdown: [
        { name: 'All E-Bikes', href: '/products' },
        { name: 'City Bikes', href: '/products/city' },
        { name: 'Mountain Bikes', href: '/products/mountain' },
        { name: 'Cargo Bikes', href: '/products/cargo' },
        { name: 'Accessories', href: '/products/accessories' },
        { name: 'Spare Parts', href: '/products/parts' }
      ]
    },
    { 
      name: 'Services', 
      href: '/services',
      dropdown: [
        { name: 'Bike Servicing', href: '/services/maintenance' },
        { name: 'Battery Replacement', href: '/services/battery-replacement' },
        { name: 'Conversion Kits', href: '/services/conversion' },
        { name: 'Test Rides', href: '/services/test-ride' },
        { name: 'Warranty', href: '/services/warranty' }
      ]
    },
    { 
      name: 'About', 
      href: '/about',
      dropdown: [
        { name: 'Our Story', href: '/about', sectionId: 'mission' },
        { name: 'Team', href: '/about', sectionId: 'team' },
        { name: 'Our Values', href: '/about', sectionId: 'values' },
        { name: 'Our Journey', href: '/about', sectionId: 'timeline' },
        { name: 'Achievements', href: '/about', sectionId: 'achievements' }
      ]
    },
    { 
      name: 'Contact', 
      href: '/contact' 
    }
  ];

  return (
    <header className={`ebikes-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="ebikes-header-container">
        
        {/* Logo Section */}
        <div className="ebikes-header-logo-section">
          {/* Main Logo - Links to Home */}
          <Link to="/" className="ebikes-header-logo">
            <div className="ebikes-header-logo-icon">
              <Zap className="ebikes-header-bike-icon" />
            </div>
            <div className="ebikes-header-logo-text">
              <span className="ebikes-header-brand-name">EBIKES</span>
              <span className="ebikes-header-brand-location">AFRICA</span>
            </div>
          </Link>

          {/* Employee Login - Secret Button */}
          <Link 
            to="/employee-login" 
            className="ebikes-header-employee-login" 
            title="Employee Portal Access"
          >
            <div className="ebikes-header-employee-icon">
              <User className="ebikes-header-user-icon" />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="ebikes-header-nav">
          {navigationItems.map((item) => (
            <div key={item.name} className="ebikes-header-nav-item">
              {item.dropdown ? (
                <div className="ebikes-header-dropdown">
                  <button
                    className={`ebikes-header-nav-link dropdown-trigger ${
                      isActiveRoute(item.href) ? 'active' : ''
                    }`}
                    onClick={() => toggleDropdown(item.name)}
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.name}
                    <ChevronDown className={`ebikes-header-dropdown-icon ${
                      activeDropdown === item.name ? 'rotated' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === item.name && (
                    <div 
                      className="ebikes-header-dropdown-menu"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.dropdown.map((subItem) => (
                        <button
                          key={subItem.name}
                          onClick={() => handleSectionNavigation(subItem.href, subItem.sectionId)}
                          className="ebikes-header-dropdown-link"
                        >
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to={item.href} 
                  className={`ebikes-header-nav-link ${
                    isActiveRoute(item.href) ? 'active' : ''
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="ebikes-header-actions">
          {/* Quick Contact */}
          <a 
            href="tel:+254700123456" 
            className="ebikes-header-quick-contact"
            title="Call us now"
          >
            <Phone className="ebikes-header-contact-icon" />
            <span className="ebikes-header-contact-text">Call Now</span>
          </a>
          
          {/* Customer Login */}
          <Link to="/login" className="ebikes-header-login-link">
            <LogIn className="ebikes-header-login-icon" />
            <span>Login</span>
          </Link>
          
          {/* Primary CTA Button */}
          <Link to="/products" className="ebikes-header-cta-button">
            <Bike className="ebikes-header-cta-icon" />
            <span>Shop E-Bikes</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className={`ebikes-header-mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="ebikes-header-toggle-icon" />
          ) : (
            <Menu className="ebikes-header-toggle-icon" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="ebikes-header-mobile-menu">
          <nav className="ebikes-header-mobile-nav">
            
            {/* Mobile Navigation Links */}
            {navigationItems.map((item) => (
              <div key={item.name} className="ebikes-header-mobile-item">
                {item.dropdown ? (
                  <>
                    <button
                      className={`ebikes-header-mobile-link dropdown-trigger ${
                        isActiveRoute(item.href) ? 'active' : ''
                      }`}
                      onClick={() => toggleDropdown(`mobile-${item.name}`)}
                    >
                      {item.name}
                      <ChevronDown className={`ebikes-header-mobile-dropdown-icon ${
                        activeDropdown === `mobile-${item.name}` ? 'rotated' : ''
                      }`} />
                    </button>
                    
                    {activeDropdown === `mobile-${item.name}` && (
                      <div className="ebikes-header-mobile-dropdown">
                        {item.dropdown.map((subItem) => (
                          <button
                            key={subItem.name}
                            onClick={() => handleSectionNavigation(subItem.href, subItem.sectionId)}
                            className="ebikes-header-mobile-dropdown-link"
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    to={item.href} 
                    className={`ebikes-header-mobile-link ${
                      isActiveRoute(item.href) ? 'active' : ''
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile Actions */}
            <div className="ebikes-header-mobile-actions">
              
              {/* Mobile Quick Contact */}
              <a 
                href="tel:+254700123456" 
                className="ebikes-header-mobile-contact"
                onClick={toggleMobileMenu}
              >
                <Phone className="ebikes-header-mobile-contact-icon" />
                <span>Call +254 700 123 456</span>
              </a>
              
              {/* Mobile Location */}
              <Link 
                to="/contact" 
                className="ebikes-header-mobile-location"
                onClick={toggleMobileMenu}
              >
                <MapPin className="ebikes-header-mobile-location-icon" />
                <span>Visit Our Showroom</span>
              </Link>
              
              {/* Mobile Login */}
              <Link 
                to="/login" 
                className="ebikes-header-mobile-login" 
                onClick={toggleMobileMenu}
              >
                <LogIn className="ebikes-header-mobile-login-icon" />
                <span>Customer Login</span>
              </Link>
              
              {/* Mobile CTA */}
              <Link 
                to="/products" 
                className="ebikes-header-mobile-cta" 
                onClick={toggleMobileMenu}
              >
                <Bike className="ebikes-header-mobile-cta-icon" />
                <span>Shop E-Bikes</span>
              </Link>
            </div>
            
            {/* Mobile Footer Info */}
            <div className="ebikes-header-mobile-footer">
              <p className="ebikes-header-mobile-slogan">
                🌍 Electrifying East Africa's Future
              </p>
              <p className="ebikes-header-mobile-hours">
                Mon-Sat: 8AM-6PM | Sun: 10AM-4PM
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;