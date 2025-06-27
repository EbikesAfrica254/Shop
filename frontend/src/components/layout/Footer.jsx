// src/components/layout/Footer.jsx - ENHANCED MODERN VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Leaf,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Battery,
  Bike,
  Award,
  Users,
  MessageCircle,
  Calendar,
  Send,
  Shield,
  Globe,
  Heart,
  Settings,
  ChevronUp
} from 'lucide-react';

// Import footer styles
import '../../styles/components/footer.css';

/**
 * Enhanced Modern Footer Component for E-Bikes Africa
 */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const currentYear = new Date().getFullYear();

  // WhatsApp number for direct messaging
  const WHATSAPP_NUMBER = "+254700000000"; // Replace with actual number

  // Handle newsletter subscription
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Open WhatsApp with pre-filled message
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "🚴‍♂️ Hi Ebikes Africa! I'm interested in learning more about your electric bikes and services. Please share more information!"
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // Essential links organized by category with icons
  const companyLinks = [
    { name: "About Us", href: "/about", icon: Users },
    { name: "Our Story", href: "/story", icon: Heart },
    { name: "Team", href: "/team", icon: Users },
    { name: "Careers", href: "/careers", icon: Award }
  ];

  const productLinks = [
    { name: "E-Bikes", href: "/products", icon: Bike },
    { name: "Accessories", href: "/accessories", icon: Battery },
    { name: "Spare Parts", href: "/parts", icon: Settings },
    { name: "Conversion Kits", href: "/conversion", icon: Zap }
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help", icon: MessageCircle },
    { name: "Contact Us", href: "/contact", icon: Phone },
    { name: "Warranty", href: "/warranty", icon: Shield },
    { name: "Service Centers", href: "/service", icon: MapPin }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Accessibility", href: "/accessibility" }
  ];

  // Social media links with brand colors
  const socialLinks = [
    { 
      name: "Facebook", 
      icon: Facebook, 
      href: "https://facebook.com/ebikesafrica", 
      color: "#1877F2",
      hoverText: "Follow us on Facebook"
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      href: "https://twitter.com/ebikesafrica", 
      color: "#1DA1F2",
      hoverText: "Follow us on Twitter"
    },
    { 
      name: "Instagram", 
      icon: Instagram, 
      href: "https://instagram.com/ebikesafrica", 
      color: "#E4405F",
      hoverText: "Follow us on Instagram"
    },
    { 
      name: "LinkedIn", 
      icon: Linkedin, 
      href: "https://linkedin.com/company/ebikesafrica", 
      color: "#0A66C2",
      hoverText: "Connect on LinkedIn"
    }
  ];

  // Impact stats
  const impactStats = [
    { value: "1000+", label: "Happy Customers", icon: Users },
    { value: "50,000+", label: "KM Carbon Saved", icon: Leaf },
    { value: "5", label: "Cities Served", icon: Globe },
    { value: "99%", label: "Satisfaction Rate", icon: Award }
  ];

  return (
    <footer className="ebikes-footer-main">
      <div className="ebikes-footer-container">
        
        {/* Impact Stats Section */}
        <div className="ebikes-footer-stats">
          <div className="ebikes-footer-stats-grid">
            {impactStats.map((stat, index) => (
              <div key={index} className="ebikes-footer-stat-card">
                <div className="ebikes-footer-stat-icon">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ebikes-footer-stat-content">
                  <span className="ebikes-footer-stat-value">{stat.value}</span>
                  <span className="ebikes-footer-stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="ebikes-footer-content">
          
          {/* Brand Section */}
          <div className="ebikes-footer-brand">
            <div className="ebikes-footer-logo">
              <div className="ebikes-footer-logo-bg">
                <Zap className="ebikes-footer-logo-icon" />
              </div>
              <div className="ebikes-footer-brand-info">
                <span className="ebikes-footer-brand-name">Ebikes Africa</span>
                <div className="ebikes-footer-eco-badge">
                  <Leaf className="ebikes-footer-leaf-icon" />
                  <span className="ebikes-footer-eco-text">Electrifying East Africa</span>
                </div>
              </div>
            </div>
            
            <p className="ebikes-footer-description">
              Leading Africa's sustainable mobility revolution with premium electric bikes designed specifically for East African roads. Empowering communities through eco-friendly transportation solutions.
            </p>

            {/* Contact Info */}
            <div className="ebikes-footer-contact">
              <div className="ebikes-footer-contact-item">
                <MapPin className="ebikes-footer-contact-icon" />
                <span>Nairobi, Kenya - East Africa HQ</span>
              </div>
              <div className="ebikes-footer-contact-item">
                <Phone className="ebikes-footer-contact-icon" />
                <span>+254 700 123 456</span>
              </div>
              <div className="ebikes-footer-contact-item">
                <Mail className="ebikes-footer-contact-icon" />
                <span>hello@ebikesafrica.co.ke</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ebikes-footer-quick-actions">
              <button 
                className="ebikes-footer-whatsapp-btn"
                onClick={openWhatsApp}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </button>
              <Link to="/contact" className="ebikes-footer-contact-btn">
                <Calendar className="w-5 h-5" />
                <span>Book Test Ride</span>
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          <div className="ebikes-footer-links-grid">
            
            {/* Company Links */}
            <div className="ebikes-footer-links-section">
              <h3 className="ebikes-footer-section-title">
                <Users className="ebikes-footer-section-icon" />
                Company
              </h3>
              <ul className="ebikes-footer-links-list">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="ebikes-footer-link">
                      <link.icon className="ebikes-footer-link-icon" />
                      <span>{link.name}</span>
                      <ArrowRight className="ebikes-footer-link-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Links */}
            <div className="ebikes-footer-links-section">
              <h3 className="ebikes-footer-section-title">
                <Bike className="ebikes-footer-section-icon" />
                Products
              </h3>
              <ul className="ebikes-footer-links-list">
                {productLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="ebikes-footer-link">
                      <link.icon className="ebikes-footer-link-icon" />
                      <span>{link.name}</span>
                      <ArrowRight className="ebikes-footer-link-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="ebikes-footer-links-section">
              <h3 className="ebikes-footer-section-title">
                <Shield className="ebikes-footer-section-icon" />
                Support
              </h3>
              <ul className="ebikes-footer-links-list">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="ebikes-footer-link">
                      <link.icon className="ebikes-footer-link-icon" />
                      <span>{link.name}</span>
                      <ArrowRight className="ebikes-footer-link-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Social */}
            <div className="ebikes-footer-links-section">
              <h3 className="ebikes-footer-section-title">
                <Mail className="ebikes-footer-section-icon" />
                Stay Connected
              </h3>
              <p className="ebikes-footer-newsletter-text">
                Get updates on new models, sustainability initiatives, and exclusive offers.
              </p>
              
              {/* Newsletter Form */}
              <form className="ebikes-footer-newsletter" onSubmit={handleNewsletterSubmit}>
                <div className="ebikes-footer-newsletter-input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="ebikes-footer-newsletter-input"
                    required
                  />
                  <button type="submit" className="ebikes-footer-newsletter-btn">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {isSubscribed && (
                  <div className="ebikes-footer-newsletter-success">
                    <span>✅ Thanks for subscribing!</span>
                  </div>
                )}
              </form>
              
              {/* Social Links */}
              <div className="ebikes-footer-social">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a 
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ebikes-footer-social-link"
                      aria-label={social.hoverText}
                      style={{'--social-color': social.color}}
                      onMouseEnter={() => setHoveredSocial(index)}
                      onMouseLeave={() => setHoveredSocial(null)}
                    >
                      <IconComponent className="ebikes-footer-social-icon" />
                      {hoveredSocial === index && (
                        <span className="ebikes-footer-social-tooltip">
                          {social.hoverText}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ebikes-footer-bottom">
          <div className="ebikes-footer-bottom-left">
            <span className="ebikes-footer-copyright">
              © {currentYear} Ebikes Africa. All rights reserved.
            </span>
            <span className="ebikes-footer-tagline">
              🚴‍♂️ Electrifying sustainable transport across East Africa
            </span>
            <div className="ebikes-footer-legal-links">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link to={link.href} className="ebikes-footer-legal-link">
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && <span className="ebikes-footer-legal-separator">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="ebikes-footer-bottom-right">
            <div className="ebikes-footer-certifications">
              <span className="ebikes-footer-cert ebikes-footer-cert-iso">
                <Award className="w-3 h-3" />
                ISO 14001
              </span>
              <span className="ebikes-footer-cert ebikes-footer-cert-carbon">
                <Leaf className="w-3 h-3" />
                Carbon Neutral
              </span>
              <span className="ebikes-footer-cert ebikes-footer-cert-africa">
                <Globe className="w-3 h-3" />
                Made in Africa
              </span>
            </div>
            <div className="ebikes-footer-back-to-top">
              <button 
                className="ebikes-footer-scroll-top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
              >
                <ChevronUp className="ebikes-footer-scroll-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;