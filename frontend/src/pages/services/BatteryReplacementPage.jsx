// src/pages/services/BatteryReplacementPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Battery, 
  Zap, 
  CheckCircle, 
  Clock, 
  Star, 
  Phone, 
  Shield,
  Recycle,
  AlertCircle,
  Calendar,
  Gauge,
  BatteryLow,
  Award,
  ArrowRight,
  Play,
  Users,
  Truck,
  Wrench,
  MessageCircle
} from 'lucide-react';

const BatteryReplacementPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('replacement');
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const batteryTypes = [
    {
      id: 1,
      name: "Standard Lithium-Ion",
      capacity: "36V 10Ah",
      range: "40-60 km",
      price: "KSh 25,000",
      originalPrice: "KSh 30,000",
      warranty: "2 years",
      chargingTime: "4-6 hours",
      cycleLife: "800+ cycles",
      image: "https://images.unsplash.com/photo-1609592806212-af1801d4c4b1?w=600&h=400&fit=crop",
      features: [
        "Reliable Samsung cells",
        "Built-in BMS protection",
        "Quick charge capability",
        "Weather resistant",
        "LED charge indicator",
        "Compact design"
      ],
      ideal: "Daily commuting",
      badge: "Best Value"
    },
    {
      id: 2,
      name: "High-Capacity Premium",
      capacity: "48V 15Ah",
      range: "70-100 km",
      price: "KSh 35,000",
      originalPrice: "KSh 42,000",
      warranty: "3 years",
      chargingTime: "3-4 hours",
      cycleLife: "1000+ cycles",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      features: [
        "Premium LG cells",
        "Advanced BMS system",
        "Fast charging technology",
        "Temperature monitoring",
        "Smart diagnostics",
        "Theft protection",
        "Mobile app integration"
      ],
      ideal: "Long-distance riding",
      popular: true,
      badge: "Most Popular"
    },
    {
      id: 3,
      name: "Commercial Grade",
      capacity: "48V 20Ah",
      range: "100-120 km",
      price: "KSh 45,000",
      originalPrice: "KSh 55,000",
      warranty: "3 years",
      chargingTime: "4-5 hours",
      cycleLife: "1200+ cycles",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop",
      features: [
        "Industrial-grade cells",
        "Heavy-duty BMS",
        "Ultra-fast charging",
        "Extreme durability",
        "Fleet management ready",
        "Extended warranty",
        "24/7 support"
      ],
      ideal: "Commercial use",
      badge: "Enterprise"
    }
  ];

  const batteryHealth = [
    {
      percentage: "80-100%",
      status: "Excellent",
      action: "No action needed",
      description: "Your battery is in great condition",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-500"
    },
    {
      percentage: "60-79%",
      status: "Good",
      action: "Monitor closely",
      description: "Battery performance is acceptable",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      iconColor: "text-amber-500"
    },
    {
      percentage: "40-59%",
      status: "Fair",
      action: "Consider replacement",
      description: "Noticeable reduction in range",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-500"
    },
    {
      percentage: "Below 40%",
      status: "Replace",
      action: "Immediate replacement",
      description: "Significant performance degradation",
      color: "text-red-600",
      bgColor: "bg-red-100",
      iconColor: "text-red-500"
    }
  ];

  const services = [
    {
      icon: <Battery className="w-8 h-8" />,
      title: "Battery Replacement",
      description: "Complete battery replacement with premium cells and professional installation",
      features: ["Premium batteries", "Professional installation", "2-3 year warranty", "Performance testing"]
    },
    {
      icon: <Gauge className="w-8 h-8" />,
      title: "Battery Health Check",
      description: "Comprehensive diagnostic to assess your current battery condition",
      features: ["Free diagnostics", "Health report", "Range testing", "Recommendations"]
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Battery Repair",
      description: "Cost-effective repair solutions for compatible battery systems",
      features: ["Cell replacement", "BMS repair", "Connector fixes", "60-day warranty"]
    },
    {
      icon: <Recycle className="w-8 h-8" />,
      title: "Battery Recycling",
      description: "Environmentally responsible disposal and recycling of old batteries",
      features: ["Free pickup", "Eco-friendly", "Certificate provided", "Trade-in credit"]
    }
  ];

  const testimonials = [
    {
      name: "David Kimani",
      role: "Daily Commuter",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "My new battery doubled my range! The installation was professional and the warranty gives me peace of mind."
    },
    {
      name: "Sarah Wanjiku",
      role: "Delivery Business Owner",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Upgraded our entire fleet with commercial grade batteries. The reliability improvement has been incredible for our business."
    },
    {
      name: "James Ochieng",
      role: "Weekend Rider",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "The premium battery was worth every shilling. Now I can enjoy longer rides without range anxiety."
    }
  ];

  const whatsappNumber = "+254700000000";

  const handleWhatsAppContact = (batteryType = null) => {
    const message = batteryType 
      ? `Hi! I'm interested in the ${batteryType.name} battery (${batteryType.capacity}) for KSh ${batteryType.price}. Can you provide more details about installation and availability?`
      : "Hi! I'm interested in your e-bike battery replacement services. Can you help me choose the right battery for my needs?";
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSelectBattery = (battery) => {
    setSelectedBattery(battery);
    handleWhatsAppContact(battery);
  };

  return (
    <div className="battery-replacement-page">
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className={`hero-text ${isVisible ? 'animate-slide-up' : ''}`}>
              <div className="hero-badge">
                <Battery className="badge-icon" />
                <span>E-Bike Battery Replacement</span>
              </div>
              
              <h1 className="hero-title">
                Power Up Your
                <span className="title-highlight">E-Bike Journey</span>
              </h1>
              
              <p className="hero-description">
                Replace your old battery with premium lithium-ion cells for extended range and reliable performance. Professional installation with comprehensive warranty included.
              </p>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">2-3x</div>
                  <div className="stat-label">Range Improvement</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">3 Year</div>
                  <div className="stat-label">Warranty</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Happy Customers</div>
                </div>
              </div>
              
              <div className="hero-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleWhatsAppContact()}
                >
                  <MessageCircle className="btn-icon" />
                  Get Battery Quote
                </button>
                <button className="btn btn-secondary">
                  <Play className="btn-icon" />
                  Watch Installation Process
                </button>
              </div>
            </div>
            
            <div className={`hero-visual ${isVisible ? 'animate-slide-up animate-delay-300' : ''}`}>
              <div className="hero-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1609592806212-af1801d4c4b1?w=700&h=500&fit=crop" 
                  alt="E-bike battery replacement"
                  className="hero-image"
                />
                <div className="floating-elements">
                  <div className="floating-badge floating-badge-1">
                    <Zap className="w-4 h-4" />
                    <span>Fast Charging</span>
                  </div>
                  <div className="floating-badge floating-badge-2">
                    <Shield className="w-4 h-4" />
                    <span>3 Year Warranty</span>
                  </div>
                  <div className="floating-badge floating-badge-3">
                    <Award className="w-4 h-4" />
                    <span>Premium Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-section animate-on-scroll">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Battery Services</h2>
            <p className="section-subtitle">
              Comprehensive solutions for all your e-bike battery needs
            </p>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  {service.icon}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, i) => (
                    <li key={i} className="feature-item">
                      <CheckCircle className="feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Battery Health Check */}
      <section className="battery-health-section animate-on-scroll">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Check Your Battery Health</h2>
            <p className="section-subtitle">
              Understanding when to replace your e-bike battery
            </p>
          </div>
          
          <div className="health-grid">
            {batteryHealth.map((health, index) => (
              <div key={index} className="health-card">
                <div className={`health-icon ${health.bgColor}`}>
                  <Battery className={`w-8 h-8 ${health.iconColor}`} />
                </div>
                <div className="health-content">
                  <div className="health-percentage">{health.percentage}</div>
                  <div className={`health-status ${health.color}`}>{health.status}</div>
                  <div className="health-action">{health.action}</div>
                  <p className="health-description">{health.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="health-cta">
            <button 
              className="btn btn-outline"
              onClick={() => handleWhatsAppContact()}
            >
              <Gauge className="btn-icon" />
              Get Free Battery Health Check
            </button>
          </div>
        </div>
      </section>

      {/* Battery Options */}
      <section className="battery-options-section animate-on-scroll">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Perfect Battery</h2>
            <p className="section-subtitle">
              Premium batteries designed for every riding need
            </p>
          </div>
          
          <div className="battery-grid">
            {batteryTypes.map((battery, index) => (
              <div 
                key={battery.id} 
                className={`battery-card ${battery.popular ? 'battery-card-popular' : ''}`}
              >
                {battery.badge && (
                  <div className={`battery-badge ${battery.popular ? 'badge-popular' : 'badge-standard'}`}>
                    {battery.badge}
                  </div>
                )}
                
                <div className="battery-image-container">
                  <img 
                    src={battery.image} 
                    alt={battery.name}
                    className="battery-image"
                  />
                  <div className="battery-overlay">
                    <div className="price-tag">
                      <div className="current-price">{battery.price}</div>
                      {battery.originalPrice && (
                        <div className="original-price">{battery.originalPrice}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="battery-content">
                  <h3 className="battery-name">{battery.name}</h3>
                  <p className="battery-ideal">Ideal for {battery.ideal}</p>
                  
                  <div className="battery-specs">
                    <div className="spec-item">
                      <span className="spec-label">Capacity</span>
                      <span className="spec-value">{battery.capacity}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Range</span>
                      <span className="spec-value">{battery.range}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Charging</span>
                      <span className="spec-value">{battery.chargingTime}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Cycle Life</span>
                      <span className="spec-value">{battery.cycleLife}</span>
                    </div>
                  </div>
                  
                  <div className="battery-features">
                    {battery.features.slice(0, 4).map((feature, i) => (
                      <div key={i} className="feature-item">
                        <CheckCircle className="feature-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {battery.features.length > 4 && (
                      <div className="features-more">
                        +{battery.features.length - 4} more features
                      </div>
                    )}
                  </div>
                  
                  <div className="battery-warranty">
                    <Shield className="warranty-icon" />
                    <span>{battery.warranty} comprehensive warranty</span>
                  </div>
                  
                  <button 
                    className={`btn ${battery.popular ? 'btn-primary' : 'btn-outline'} btn-full`}
                    onClick={() => handleSelectBattery(battery)}
                  >
                    <MessageCircle className="btn-icon" />
                    Select This Battery
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section animate-on-scroll">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">
              Real experiences from satisfied customers
            </p>
          </div>
          
          <div className="testimonials-container">
            <div className="testimonial-slider">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`testimonial-card ${index === currentTestimonial ? 'active' : ''}`}
                >
                  <div className="testimonial-content">
                    <div className="stars">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="star star-filled" />
                      ))}
                    </div>
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="testimonial-author">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="author-image"
                      />
                      <div className="author-info">
                        <div className="author-name">{testimonial.name}</div>
                        <div className="author-role">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Installation Process */}
      <section className="installation-section animate-on-scroll">
        <div className="section-container">
          <div className="installation-content">
            <div className="installation-text">
              <h2 className="section-title">Professional Installation Process</h2>
              <p className="section-subtitle">
                Our certified technicians ensure perfect installation every time
              </p>
              
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Battery Assessment</h4>
                    <p>Complete evaluation of your current battery and e-bike compatibility</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Professional Installation</h4>
                    <p>Safe removal of old battery and precise installation of your new one</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Testing & Calibration</h4>
                    <p>Comprehensive testing to ensure optimal performance and safety</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Training & Support</h4>
                    <p>Complete guide on battery care and ongoing technical support</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="installation-visual">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=500&fit=crop" 
                alt="Professional battery installation"
                className="installation-image"
              />
              <div className="installation-badges">
                <div className="install-badge">
                  <Users className="w-5 h-5" />
                  <span>Certified Technicians</span>
                </div>
                <div className="install-badge">
                  <Clock className="w-5 h-5" />
                  <span>30-45 Min Installation</span>
                </div>
                <div className="install-badge">
                  <Shield className="w-5 h-5" />
                  <span>Safety Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Upgrade Your E-Bike Battery?</h2>
            <p className="cta-subtitle">
              Get professional installation, extended warranty, and unmatched performance
            </p>
            
            <div className="cta-features">
              <div className="cta-feature">
                <Truck className="w-6 h-6" />
                <span>Free pickup & delivery in Nairobi</span>
              </div>
              <div className="cta-feature">
                <Clock className="w-6 h-6" />
                <span>Same-day installation available</span>
              </div>
              <div className="cta-feature">
                <Shield className="w-6 h-6" />
                <span>Up to 3-year comprehensive warranty</span>
              </div>
            </div>
            
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => handleWhatsAppContact()}
              >
                <MessageCircle className="btn-icon" />
                Get Free Quote Now
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => handleWhatsAppContact()}
              >
                <Phone className="btn-icon" />
                Call for Consultation
              </button>
            </div>
            
            <div className="cta-guarantee">
              <Award className="w-5 h-5" />
              <span>100% satisfaction guarantee or money back</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BatteryReplacementPage;