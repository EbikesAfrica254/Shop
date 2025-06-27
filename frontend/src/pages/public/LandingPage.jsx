// src/pages/public/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Add this import
import { 
  Zap, 
  Battery, 
  Leaf, 
  Shield, 
  ArrowRight, 
  Play, 
  Star, 
  CheckCircle, 
  Users, 
  Award, 
  Bike, 
  MessageCircle,
  Calendar,
  X,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Wrench,
  Package,
  Truck,
  UserCheck,
  Settings,
  BarChart3
} from 'lucide-react';
import "../../styles/pages/public/landing.css";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // WhatsApp number (replace with actual Ebikes Africa WhatsApp number)
  const WHATSAPP_NUMBER = "+254700000000"; // Replace with actual number

  useEffect(() => {
    setIsVisible(true);
    
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-animation');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Handle modal open/close
  const openModal = (serviceId) => {
    setActiveModal(serviceId);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.classList.remove('modal-open');
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // WhatsApp message templates for each service
  const getWhatsAppMessage = (serviceId) => {
    const messages = {
      'lease-to-own': `🚴‍♂️ *Hi Ebikes Africa!*

I'm interested in your *Lease-to-Own* program and would like to learn more about:

📋 *My Requirements:*
- E-bike model preference: 
- Monthly budget range: 
- Intended use: (commuting/delivery/personal)
- Preferred payment term: 

💬 Could you please provide:
✅ Available models and monthly payment options
✅ Application process and requirements
✅ Timeline for approval and delivery
✅ Any current promotions or discounts

Looking forward to joining the e-mobility revolution! 🌱

Best regards,
[Your Name]`,

      'delivery-services': `🚚 *Hi Ebikes Africa!*

I'm interested in your *Delivery Services* solution for my business and need more information about:

📋 *My Business Details:*
- Business type: 
- Current delivery volume per day: 
- Coverage area: 
- Team size: 

💬 Please provide information about:
✅ Complete delivery packages and pricing
✅ Rider training program details
✅ Fleet management system features
✅ Route optimization capabilities
✅ Timeline for setup and implementation

Ready to transform my delivery business! 🚀

Best regards,
[Your Name]`,

      'support-service': `🔧 *Hi Ebikes Africa!*

I'm interested in your *Support & Service* packages and would like to know more about:

📋 *My Needs:*
- Current e-bike model: 
- Service type needed: (maintenance/repair/warranty)
- Location: 
- Preferred service schedule: 

💬 Please provide details about:
✅ Available service packages and pricing
✅ Response times for support requests
✅ Mobile service availability in my area
✅ Warranty extension options
✅ Scheduled maintenance programs

Looking forward to excellent service support! 👍

Best regards,
[Your Name]`,

      'conversion-kits': `⚡ *Hi Ebikes Africa!*

I'm interested in your *Conversion Kits* to electrify my bicycle and need information about:

📋 *My Current Bike:*
- Bike type: (mountain/road/hybrid)
- Wheel size: 
- Current condition: 
- Intended use after conversion: 

💬 Please provide details about:
✅ Suitable conversion kit options
✅ Installation process and timeline
✅ Total cost including installation
✅ Performance specifications (range, speed)
✅ Warranty and support included

Ready to go electric! ⚡🚴‍♂️

Best regards,
[Your Name]`,

      'general': `🚴‍♂️ *Hi Ebikes Africa!*

I'm interested in your e-mobility solutions and would like to learn more about:

📋 *My Interest:*
- E-bike models and pricing
- Available financing options
- Test ride opportunities
- Local service and support

💬 Could you please provide:
✅ Current e-bike models and specifications
✅ Pricing and payment options
✅ How to schedule a test ride
✅ Service locations near me

Looking forward to joining the sustainable transport revolution! 🌱

Best regards,
[Your Name]`
    };

    return messages[serviceId] || messages['general'];
  };

  // Function to open WhatsApp with pre-filled message
  const openWhatsApp = (serviceId = 'general') => {
    const message = getWhatsAppMessage(serviceId);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab/window
    window.open(whatsappUrl, '_blank');
    
    // Close modal if open
    if (activeModal) {
      closeModal();
    }
  };

  // Function to handle phone call
  const handlePhoneCall = () => {
    window.open(`tel:${WHATSAPP_NUMBER}`, '_self');
  };

  const features = [
    {
      icon: Battery,
      title: "Long Battery Life",
      description: "Up to 100km range with fast charging capability for all-day rides.",
      link: "Learn more"
    },
    {
      icon: Zap,
      title: "Powerful Motors",
      description: "High-efficiency motors perfect for Nairobi's hills and terrain.",
      link: "View specs"
    },
    {
      icon: Leaf,
      title: "Zero Emissions",
      description: "100% electric with no carbon footprint for cleaner air.",
      link: "Environmental impact"
    },
    {
      icon: Shield,
      title: "African Built",
      description: "Designed for African roads with local service support.",
      link: "Durability"
    }
  ];

  const products = [
    {
      name: "Urban Commuter",
      description: "Perfect for daily city commutes with efficient performance.",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=300&fit=crop",
      price: "KSh 99,000",
      originalPrice: "KSh 130,000",
      features: ["50km Range", "Fast Charge", "LED Lights", "Anti-theft"],
      badge: "Sale"
    },
    {
      name: "Delivery Pro",
      description: "Heavy-duty e-bike for delivery services and cargo.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
      price: "KSh 150,000",
      originalPrice: null,
      features: ["80km Range", "Cargo Rack", "GPS Track", "Heavy Duty"],
      badge: null
    }
  ];

  const services = [
    {
      id: 'lease-to-own',
      icon: Bike,
      title: "Lease to Own",
      description: "Flexible payments with Lipa Pole Pole program.",
      fullDescription: "Our innovative Lease-to-Own program makes electric mobility accessible to everyone. With our 'Lipa Pole Pole' (Pay Slowly) system, you can own your dream e-bike through affordable monthly payments.",
      features: [
        {
          icon: DollarSign,
          title: "Low Monthly Payments",
          description: "Start from as low as KSh 8,000 per month with flexible payment terms up to 18 months."
        },
        {
          icon: CheckCircle,
          title: "No Hidden Fees",
          description: "Transparent pricing with no processing fees, hidden charges, or penalty fees for early completion."
        },
        {
          icon: Clock,
          title: "Quick Approval",
          description: "Get approved within 24 hours with minimal documentation required."
        },
        {
          icon: Shield,
          title: "Full Ownership",
          description: "Own your e-bike completely after completing all payments. No strings attached."
        }
      ],
      pricing: [
        { name: "Urban Commuter", price: "KSh 8,500/month" },
        { name: "Delivery Pro", price: "KSh 12,000/month" },
        { name: "Cargo Master", price: "KSh 15,000/month" }
      ]
    },
    {
      id: 'delivery-services',
      icon: Users,
      title: "Delivery Services",
      description: "Complete delivery solutions with training.",
      fullDescription: "Transform your delivery business with our comprehensive e-bike delivery solutions. We provide everything you need to run an efficient, profitable, and sustainable delivery service.",
      features: [
        {
          icon: UserCheck,
          title: "Rider Training Program",
          description: "Comprehensive 3-day training covering safe riding, customer service, and bike maintenance."
        },
        {
          icon: BarChart3,
          title: "Fleet Management",
          description: "Advanced tracking system to monitor your fleet's performance, routes, and efficiency."
        },
        {
          icon: MapPin,
          title: "Route Optimization",
          description: "AI-powered route planning to maximize deliveries and minimize travel time."
        },
        {
          icon: Truck,
          title: "Cargo Solutions",
          description: "Custom cargo attachments and delivery boxes designed for maximum capacity and security."
        }
      ],
      pricing: [
        { name: "Basic Package", price: "KSh 25,000 setup" },
        { name: "Premium Package", price: "KSh 45,000 setup" },
        { name: "Enterprise Solution", price: "Custom pricing" }
      ]
    },
    {
      id: 'support-service',
      icon: Award,
      title: "Support & Service",
      description: "24/7 support and professional servicing.",
      fullDescription: "We stand behind our e-bikes with comprehensive support and maintenance services. Our certified technicians ensure your e-bike performs at its best throughout its lifetime.",
      features: [
        {
          icon: Phone,
          title: "24/7 Helpline",
          description: "Round-the-clock customer support via phone, WhatsApp, and email for any issues or questions."
        },
        {
          icon: Wrench,
          title: "Professional Servicing",
          description: "Certified technicians provide regular maintenance, repairs, and performance optimization."
        },
        {
          icon: MapPin,
          title: "Mobile Service",
          description: "On-site repairs and maintenance at your location for maximum convenience."
        },
        {
          icon: Shield,
          title: "Extended Warranty",
          description: "Comprehensive warranty coverage with options to extend up to 3 years."
        }
      ],
      pricing: [
        { name: "Basic Service", price: "KSh 2,500/visit" },
        { name: "Annual Package", price: "KSh 15,000/year" },
        { name: "Premium Care", price: "KSh 25,000/year" }
      ]
    },
    {
      id: 'conversion-kits',
      icon: Zap,
      title: "Conversion Kits",
      description: "Convert your bike to electric easily.",
      fullDescription: "Transform your existing bicycle into a powerful electric bike with our high-quality conversion kits. Professional installation and support included to ensure optimal performance.",
      features: [
        {
          icon: Package,
          title: "Complete Kit",
          description: "Everything included: motor, battery, controller, display, and all necessary hardware."
        },
        {
          icon: Settings,
          title: "Professional Installation",
          description: "Expert installation by certified technicians with 2-year workmanship warranty."
        },
        {
          icon: Battery,
          title: "High-Quality Components",
          description: "Premium lithium batteries and efficient motors from trusted international manufacturers."
        },
        {
          icon: CheckCircle,
          title: "Performance Guarantee",
          description: "30-day money-back guarantee if you're not satisfied with the performance."
        }
      ],
      pricing: [
        { name: "Basic Kit", price: "KSh 45,000" },
        { name: "Premium Kit", price: "KSh 65,000" },
        { name: "Pro Kit", price: "KSh 85,000" }
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mwangi",
      role: "Business Owner",
      content: "My delivery business transformed with Ebikes Africa. Great performance and amazing support!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c886?w=60&h=60&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "James Kiprotich",
      role: "Commuter",
      content: "No more traffic stress! My e-bike gets me to work fast and I arrive refreshed.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Grace Nyong'o",
      role: "Eco Advocate",
      content: "Perfect solution for sustainable transport. Quality bikes with excellent local support.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      rating: 5
    }
  ];

  const getServiceById = (id) => services.find(service => service.id === id);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="landing-hero">
        <img 
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop" 
          alt="Ebikes Africa"
          className="landing-hero-bg"
        />

        <div className="landing-hero-content">
          <div className="landing-hero-grid">
            <div className="landing-hero-content-main">
              <h1>
                The Future of
                <span className="landing-hero-title-highlight">
                  African Mobility
                </span>
                is Electric
              </h1>
              
              <p className="landing-hero-subtitle">
                Sustainable • Affordable • Designed for Africa
              </p>
              
              <p className="landing-hero-description">
                Join the e-mobility revolution with premium electric bicycles designed for East African roads. Zero emissions, maximum impact.
              </p>
              
              <div className="landing-hero-actions">
                {/* UPDATED: Link to products page */}
                <Link 
                  to="/products"
                  className="landing-hero-btn-primary"
                >
                  <span>Shop E-Bikes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="landing-hero-btn-secondary">
                  <Play className="w-4 h-4" />
                  <span>Watch Video</span>
                </button>
              </div>
              
              <div className="landing-hero-stats">
                <div className="landing-hero-stat">
                  <span className="landing-hero-stat-value">1000+</span>
                  <span className="landing-hero-stat-label">Customers</span>
                </div>
                <div className="landing-hero-stat">
                  <span className="landing-hero-stat-value">100km</span>
                  <span className="landing-hero-stat-label">Range</span>
                </div>
                <div className="landing-hero-stat">
                  <span className="landing-hero-stat-value">99%</span>
                  <span className="landing-hero-stat-label">Satisfied</span>
                </div>
              </div>
            </div>
            
            <div className="landing-hero-visual">
              <img 
                src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop" 
                alt="Ebikes Africa Electric Bicycle"
                className="landing-hero-ebike"
              />
              
              <div className="landing-hero-features">
                <div className="landing-hero-feature">
                  <Battery className="landing-hero-feature-icon" />
                  <span className="landing-hero-feature-text">Long Range</span>
                </div>
                <div className="landing-hero-feature">
                  <Zap className="landing-hero-feature-icon" />
                  <span className="landing-hero-feature-text">Fast Charge</span>
                </div>
                <div className="landing-hero-feature">
                  <Shield className="landing-hero-feature-icon" />
                  <span className="landing-hero-feature-text">Durable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="landing-features scroll-animation">
        <div className="landing-features-container">
          <div className="landing-features-header">
            <div className="landing-features-badge">
              <Zap className="w-4 h-4" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="landing-features-title">
              Built for African Roads
            </h2>
            <p className="landing-features-subtitle">
              Our e-bikes combine cutting-edge technology with deep understanding of East African transportation needs.
            </p>
          </div>
          
          <div className="landing-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="landing-feature-card">
                <div className="landing-feature-icon">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-description">{feature.description}</p>
                <a href="#" className="landing-feature-link">
                  {feature.link}
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="landing-products scroll-animation">
        <div className="landing-products-container">
          <div className="landing-products-header">
            <h2 className="landing-products-title">
              Choose Your E-Bike
            </h2>
            <p className="landing-products-subtitle">
              From urban commuting to delivery services, find the perfect e-bike for your needs.
            </p>
          </div>
          
          <div className="landing-products-grid">
            {products.map((product, index) => (
              <div key={index} className="landing-product-card">
                <div className="landing-product-image">
                  <img src={product.image} alt={product.name} />
                  {product.badge && (
                    <div className="landing-product-badge">{product.badge}</div>
                  )}
                </div>
                <div className="landing-product-content">
                  <h3 className="landing-product-name">{product.name}</h3>
                  <p className="landing-product-description">{product.description}</p>
                  
                  <div className="landing-product-features">
                    {product.features.map((feature, i) => (
                      <span key={i} className="landing-product-feature">{feature}</span>
                    ))}
                  </div>
                  
                  <div className="landing-product-price">
                    <span className="landing-product-price-value">{product.price}</span>
                    {product.originalPrice && (
                      <span className="landing-product-price-period">{product.originalPrice}</span>
                    )}
                  </div>
                  
                  {/* UPDATED: Link to products page */}
                  <Link 
                    to="/products"
                    className="landing-product-btn"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="landing-products-cta">
            {/* UPDATED: Link to products page */}
            <Link 
              to="/products"
              className="landing-products-cta-btn"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section with Clickable Cards */}
      <div className="landing-services scroll-animation">
        <div className="landing-services-container">
          <div className="landing-services-header">
            <h2 className="landing-services-title">
              Complete E-Mobility Solutions
            </h2>
            <p className="landing-services-subtitle">
              Beyond bikes - comprehensive services to support your e-mobility journey. Click to learn more!
            </p>
          </div>
          
          <div className="landing-services-grid">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="landing-service-card"
                onClick={() => openModal(service.id)}
              >
                <div className="landing-service-icon">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="landing-service-title">{service.title}</h3>
                <p className="landing-service-description">{service.description}</p>
                <div className="landing-service-learn-more">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Modal */}
      <div className={`landing-modal-overlay ${activeModal ? 'active' : ''}`} onClick={closeModal}>
        <div className="landing-modal" onClick={(e) => e.stopPropagation()}>
          {activeModal && getServiceById(activeModal) && (
            <>
              <div className="landing-modal-header">
                <button className="landing-modal-close" onClick={closeModal}>
                  <X className="w-5 h-5" />
                </button>
                <div className="landing-modal-icon">
                  {React.createElement(getServiceById(activeModal).icon, {
                    className: "w-8 h-8 text-white"
                  })}
                </div>
                <h3 className="landing-modal-title">{getServiceById(activeModal).title}</h3>
                <p className="landing-modal-subtitle">{getServiceById(activeModal).description}</p>
              </div>
              
              <div className="landing-modal-content">
                <p className="landing-modal-description">
                  {getServiceById(activeModal).fullDescription}
                </p>
                
                <div className="landing-modal-features">
                  <h4>Key Features</h4>
                  <div className="landing-modal-feature-list">
                    {getServiceById(activeModal).features.map((feature, index) => (
                      <div key={index} className="landing-modal-feature-item">
                        <feature.icon className="landing-modal-feature-icon" />
                        <div className="landing-modal-feature-content">
                          <h5>{feature.title}</h5>
                          <p>{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="landing-modal-pricing">
                  <h4>
                    <DollarSign className="w-5 h-5" />
                    Pricing Options
                  </h4>
                  <div className="landing-modal-pricing-options">
                    {getServiceById(activeModal).pricing.map((option, index) => (
                      <div key={index} className="landing-modal-pricing-option">
                        <span className="landing-modal-pricing-option-name">{option.name}</span>
                        <span className="landing-modal-pricing-option-price">{option.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="landing-modal-actions">
                  <button 
                    className="landing-modal-btn-primary"
                    onClick={() => openWhatsApp(activeModal)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Start WhatsApp Chat</span>
                  </button>
                  <button 
                    className="landing-modal-btn-secondary"
                    onClick={handlePhoneCall}
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Us</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="landing-testimonials scroll-animation">
        <div className="landing-testimonials-container">
          <div className="landing-testimonials-header">
            <h2 className="landing-testimonials-title">
              What Our Customers Say
            </h2>
            <p className="landing-testimonials-subtitle">
              Real stories from our growing community across East Africa.
            </p>
          </div>
          
          <div className="landing-testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="landing-testimonial-card">
                <div className="landing-testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="landing-testimonial-star" />
                  ))}
                </div>
                <p className="landing-testimonial-content">
                  "{testimonial.content}"
                </p>
                <div className="landing-testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="landing-testimonial-avatar"
                  />
                  <div className="landing-testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="landing-cta">
        <div className="landing-cta-container">
          <h2 className="landing-cta-title">
            Ready to Go Electric?
          </h2>
          <p className="landing-cta-description">
            Join thousands who've made the switch to sustainable, efficient transportation. Start your e-mobility journey today.
          </p>
          
          <div className="landing-cta-actions">
            {/* UPDATED: Link to products page */}
            <Link 
              to="/products"
              className="landing-cta-btn-primary"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Shop E-Bikes</span>
            </Link>
            <button 
              className="landing-cta-btn-secondary"
              onClick={() => openWhatsApp('general')}
            >
              <Calendar className="w-5 h-5" />
              <span>Book Test Ride</span>
            </button>
          </div>
          
          <div className="landing-cta-features">
            <div className="landing-cta-feature">
              <CheckCircle className="landing-cta-feature-icon" />
              <span>Free Test Rides</span>
            </div>
            <div className="landing-cta-feature">
              <CheckCircle className="landing-cta-feature-icon" />
              <span>Flexible Financing</span>
            </div>
            <div className="landing-cta-feature">
              <CheckCircle className="landing-cta-feature-icon" />
              <span>1-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;