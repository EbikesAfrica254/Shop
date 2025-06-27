// src/pages/public/ContactPage.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, ArrowRight, Zap, Bike, Calendar, FileText, Users, Globe, Star, CheckCircle } from 'lucide-react';
import "../../styles/pages/public/contact.css";

const ContactPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    timeline: '',
    message: '',
    newsletter: false
  });
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! Our team will contact you within 24 hours.');
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      description: "Get instant responses to your queries",
      detail: "Available 24/7 for immediate assistance",
      action: "Start Chat",
      color: "from-green-500 to-green-600",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop"
    },
    {
      icon: Phone,
      title: "Schedule Call",
      description: "Book a consultation with our experts",
      detail: "Free 30-minute consultation available",
      action: "Book Call",
      color: "from-blue-500 to-blue-600",
      image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=300&h=200&fit=crop"
    },
    {
      icon: Calendar,
      title: "Test Ride",
      description: "Experience our e-bikes firsthand",
      detail: "Free test rides at our Nairobi location",
      action: "Book Ride",
      color: "from-emerald-500 to-emerald-600",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=200&fit=crop"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Detailed inquiries and documentation",
      detail: "Response within 24 hours guaranteed",
      action: "Send Email",
      color: "from-purple-500 to-purple-600",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop"
    }
  ];

  const services = [
    {
      title: "Electric Bicycle Purchase",
      description: "High-quality e-bikes starting from KSh 99,000",
      features: ["Flash Sale Pricing", "Warranty Included", "Free Delivery", "Setup Support"],
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=300&fit=crop"
    },
    {
      title: "Lease to Own (Lipa Pole Pole)",
      description: "Flexible financing options for individuals and businesses",
      features: ["Low Monthly Payments", "Flexible Terms", "Quick Approval", "No Hidden Fees"],
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop"
    },
    {
      title: "Delivery Services",
      description: "Last-mile delivery solutions for businesses",
      features: ["Rider Training", "Fleet Management", "Route Optimization", "Performance Analytics"],
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&h=300&fit=crop"
    },
    {
      title: "Conversion Kits",
      description: "Transform your regular bicycle into an electric one",
      features: ["Easy Installation", "Professional Support", "Quality Components", "Performance Guarantee"],
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop"
    }
  ];

  const officeInfo = [
    {
      icon: MapPin,
      title: "Headquarters",
      details: ["Nairobi, Kenya", "East African Operations Center", "Open Monday - Saturday"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 8AM - 6PM", "Saturday: 9AM - 4PM", "Sunday: Emergency Only"],
    },
    {
      icon: Globe,
      title: "Service Areas",
      details: ["Nairobi Metro", "Mombasa", "Kisumu", "Expanding Across East Africa"],
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mwangi",
      role: "Delivery Business Owner",
      content: "Ebikes Africa transformed my delivery business. The lease-to-own option made it affordable, and the support has been exceptional.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c886?w=80&h=80&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "James Kiprotich",
      role: "Environmental Advocate",
      content: "Their commitment to sustainability is genuine. I've been using my e-bike for 8 months now, and it's been reliable and eco-friendly.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Grace Nyong'o",
      role: "Urban Commuter",
      content: "Best investment I've made! No more traffic stress, and I'm contributing to a cleaner Nairobi. The team's support is outstanding.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "What's included in the Flash Sale price?",
      answer: "Our Flash Sale e-bikes at KSh 99,000 include the complete bicycle, battery, charger, basic accessories, delivery within Nairobi, and a 1-year warranty."
    },
    {
      question: "How does the Lease-to-Own program work?",
      answer: "Our Lipa Pole Pole program allows you to pay in affordable monthly installments. After completing payments, you own the e-bike outright. No hidden fees or interest charges."
    },
    {
      question: "Do you provide training for delivery riders?",
      answer: "Yes! We offer comprehensive training including safe riding practices, maintenance basics, route optimization, and customer service for delivery riders."
    },
    {
      question: "What areas do you serve?",
      answer: "Currently serving Nairobi metro area with expansion to Mombasa, Kisumu, and other East African cities. We provide delivery, support, and maintenance in all service areas."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="contact-hero">
        <img 
          src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=1920&h=1080&fit=crop" 
          alt="Contact Ebikes Africa"
          className="contact-hero-bg"
        />
        
        {/* Animated Background Elements */}
        <div className="contact-hero-float contact-hero-float-1"></div>
        <div className="contact-hero-float contact-hero-float-2"></div>

        <div className="contact-hero-content">
          <div className={`transform transition-all duration-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="contact-hero-grid">
              <div>
                <div className="contact-hero-badge">
                  <div className="contact-hero-badge-icon">
                    <MessageCircle className="w-10 h-10 text-emerald-300" />
                  </div>
                  <span className="text-emerald-200 text-xl font-semibold tracking-wide">Get In Touch</span>
                </div>
                
                <h1 className="contact-hero-title">
                  Let's Build
                  <span className="contact-hero-title-gradient">
                    Sustainable
                  </span>
                  <span className="contact-hero-subtitle">
                    Mobility Together
                  </span>
                </h1>
                
                <p className="contact-hero-description">
                  Ready to join East Africa's e-mobility revolution? Whether you're looking to purchase, partner, or simply learn more, we're here to help you every step of the way.
                </p>
                
                <div className="contact-hero-features">
                  <div className="contact-hero-feature">
                    <div className="contact-hero-feature-header">
                      <Clock className="w-6 h-6 text-emerald-300" />
                      <span className="contact-hero-feature-title">Quick Response</span>
                    </div>
                    <p className="contact-hero-feature-desc">24-hour response guarantee</p>
                  </div>
                  <div className="contact-hero-feature">
                    <div className="contact-hero-feature-header">
                      <Zap className="w-6 h-6 text-emerald-300" />
                      <span className="contact-hero-feature-title">Expert Support</span>
                    </div>
                    <p className="contact-hero-feature-desc">Professional consultation</p>
                  </div>
                </div>
              </div>
              
              <div className="contact-hero-preview">
                <div className="contact-hero-preview-card">
                  <div className="contact-hero-preview-grid">
                    {contactMethods.map((method, index) => (
                      <div key={index} className="contact-hero-preview-method">
                        <div className={`contact-hero-preview-icon bg-gradient-to-r ${method.color}`}>
                          <method.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="contact-hero-preview-title">{method.title}</h3>
                        <p className="contact-hero-preview-desc">{method.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Methods Detail */}
      <div className="contact-methods">
        <div className="contact-methods-container">
          <div className="contact-methods-header">
            <h2 className="contact-methods-title">Choose Your Preferred Contact Method</h2>
            <p className="contact-methods-subtitle">
              We offer multiple ways to get in touch, ensuring you can reach us through your preferred channel
            </p>
          </div>
          
          <div className="contact-methods-grid">
            {contactMethods.map((method, index) => (
              <div key={index} className="contact-method-card">
                <div className="contact-method-image">
                  <img 
                    src={method.image} 
                    alt={method.title}
                  />
                </div>
                <div className="contact-method-content">
                  <div className={`contact-method-icon bg-gradient-to-r ${method.color}`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="contact-method-title">{method.title}</h3>
                  <p className="contact-method-description">{method.description}</p>
                  <p className="contact-method-detail">{method.detail}</p>
                  <button className={`contact-method-btn bg-gradient-to-r ${method.color}`}>
                    {method.action}
                  </button>
                  </div>
             </div>
           ))}
         </div>
       </div>
     </div>

     {/* Contact Form & Company Info */}
     <div className="contact-form-section">
       <div className="contact-form-container">
         <div className="contact-form-grid">
           {/* Contact Form - Takes 2 columns */}
           <div className="contact-form-wrapper">
             <h2 className="contact-form-title">Send us a detailed message</h2>
             
             <div className="contact-form">
               <div className="contact-form-row">
                 <div className="contact-form-group">
                   <label className="contact-form-label">First Name *</label>
                   <input 
                     type="text" 
                     name="firstName"
                     value={formData.firstName}
                     onChange={handleInputChange}
                     required
                     className="contact-form-input"
                     placeholder="John"
                   />
                 </div>
                 <div className="contact-form-group">
                   <label className="contact-form-label">Last Name *</label>
                   <input 
                     type="text" 
                     name="lastName"
                     value={formData.lastName}
                     onChange={handleInputChange}
                     required
                     className="contact-form-input"
                     placeholder="Doe"
                   />
                 </div>
               </div>
               
               <div className="contact-form-row">
                 <div className="contact-form-group">
                   <label className="contact-form-label">Email Address *</label>
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     required
                     className="contact-form-input"
                     placeholder="john@example.com"
                   />
                 </div>
                 <div className="contact-form-group">
                   <label className="contact-form-label">Phone Number *</label>
                   <input 
                     type="tel" 
                     name="phone"
                     value={formData.phone}
                     onChange={handleInputChange}
                     required
                     className="contact-form-input"
                     placeholder="+254 700 000 000"
                   />
                 </div>
               </div>
               
               <div className="contact-form-group">
                 <label className="contact-form-label">Company/Organization</label>
                 <input 
                   type="text" 
                   name="company"
                   value={formData.company}
                   onChange={handleInputChange}
                   className="contact-form-input"
                   placeholder="Your company name (optional)"
                 />
               </div>
               
               <div className="contact-form-row">
                 <div className="contact-form-group">
                   <label className="contact-form-label">Service Interest *</label>
                   <select 
                     name="service"
                     value={formData.service}
                     onChange={handleInputChange}
                     required
                     className="contact-form-select"
                   >
                     <option value="">Select a service</option>
                     <option value="purchase">Electric Bicycle Purchase</option>
                     <option value="lease">Lease to Own Program</option>
                     <option value="delivery">Delivery Services</option>
                     <option value="conversion">Conversion Kits</option>
                     <option value="test">Test Ride Booking</option>
                     <option value="partnership">Business Partnership</option>
                     <option value="bulk">Bulk Orders</option>
                     <option value="other">Other</option>
                   </select>
                 </div>
                 <div className="contact-form-group">
                   <label className="contact-form-label">Budget Range</label>
                   <select 
                     name="budget"
                     value={formData.budget}
                     onChange={handleInputChange}
                     className="contact-form-select"
                   >
                     <option value="">Select budget range</option>
                     <option value="under-100k">Under KSh 100,000</option>
                     <option value="100k-300k">KSh 100,000 - 300,000</option>
                     <option value="300k-500k">KSh 300,000 - 500,000</option>
                     <option value="500k-1m">KSh 500,000 - 1,000,000</option>
                     <option value="over-1m">Over KSh 1,000,000</option>
                   </select>
                 </div>
               </div>
               
               <div className="contact-form-group">
                 <label className="contact-form-label">Timeline</label>
                 <select 
                   name="timeline"
                   value={formData.timeline}
                   onChange={handleInputChange}
                   className="contact-form-select"
                 >
                   <option value="">When do you need this?</option>
                   <option value="immediate">Immediately</option>
                   <option value="1-week">Within 1 week</option>
                   <option value="1-month">Within 1 month</option>
                   <option value="3-months">Within 3 months</option>
                   <option value="6-months">Within 6 months</option>
                   <option value="planning">Just planning ahead</option>
                 </select>
               </div>
               
               <div className="contact-form-group">
                 <label className="contact-form-label">Message *</label>
                 <textarea 
                   rows={6}
                   name="message"
                   value={formData.message}
                   onChange={handleInputChange}
                   required
                   className="contact-form-textarea"
                   placeholder="Tell us about your e-mobility needs, questions, or how we can help you..."
                 />
               </div>
               
               <div className="contact-form-checkbox-wrapper">
                 <input 
                   type="checkbox"
                   name="newsletter"
                   checked={formData.newsletter}
                   onChange={handleInputChange}
                   className="contact-form-checkbox"
                 />
                 <label className="contact-form-checkbox-label">
                   I'd like to receive updates about new products, sustainability initiatives, and e-mobility news from Ebikes Africa.
                 </label>
               </div>
               
               <button 
                 onClick={handleSubmit}
                 className="contact-form-submit"
               >
                 <Send className="w-6 h-6" />
                 <span>Send Message</span>
                 <ArrowRight className="w-6 h-6" />
               </button>
               
               <p className="contact-form-note">
                 We'll respond within 24 hours. For urgent matters, please use WhatsApp or call us directly.
               </p>
             </div>
           </div>

           {/* Company Information - Takes 1 column */}
           <div className="contact-info-sidebar">
             <div className="contact-info-card">
               <h3 className="contact-info-title">Office Information</h3>
               
               {officeInfo.map((info, index) => (
                 <div key={index} className="contact-info-item">
                   <div className="contact-info-item-header">
                     <div className="contact-info-icon">
                       <info.icon className="w-6 h-6 text-white" />
                     </div>
                     <div className="contact-info-content">
                       <h4>{info.title}</h4>
                       <div className="contact-info-details">
                         {info.details.map((detail, i) => (
                           <p key={i} className="contact-info-detail">{detail}</p>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             {/* Quick Actions */}
             <div className="contact-quick-actions">
               <h3 className="contact-quick-actions-title">Quick Actions</h3>
               <div className="contact-quick-actions-list">
                 <button className="contact-quick-action">
                   <MessageCircle className="w-5 h-5" />
                   <span>Chat on WhatsApp</span>
                 </button>
                 <button className="contact-quick-action">
                   <Calendar className="w-5 h-5" />
                   <span>Book Free Test Ride</span>
                 </button>
                 <button className="contact-quick-action">
                   <FileText className="w-5 h-5" />
                   <span>Download Brochure</span>
                 </button>
                 <button className="contact-quick-action">
                   <Users className="w-5 h-5" />
                   <span>Apply as Delivery Rider</span>
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* Services Overview */}
     <div className="contact-services">
       <div className="contact-services-container">
         <div className="contact-services-header">
           <h2 className="contact-services-title">Our Services</h2>
           <p className="contact-services-subtitle">
             Comprehensive e-mobility solutions tailored for East African markets
           </p>
         </div>
         
         <div className="contact-services-grid">
           <div className="contact-services-list">
             {services.map((service, index) => (
               <div 
                 key={index} 
                 className={`contact-service-item ${activeService === index ? 'active' : ''}`}
                 onClick={() => setActiveService(index)}
               >
                 <h3 className="contact-service-title">{service.title}</h3>
                 <p className="contact-service-description">
                   {service.description}
                 </p>
               </div>
             ))}
           </div>
           
           <div className="contact-services-preview">
             <div className="contact-services-preview-image">
               <img 
                 src={services[activeService].image} 
                 alt={services[activeService].title}
               />
             </div>
             <div className="contact-services-preview-content">
               <h3 className="contact-services-preview-title">{services[activeService].title}</h3>
               <p className="contact-services-preview-desc">{services[activeService].description}</p>
               <div className="contact-services-features">
                 <h4>Key Features:</h4>
                 <div className="contact-services-features-list">
                   {services[activeService].features.map((feature, index) => (
                     <div key={index} className="contact-services-feature">
                       <CheckCircle className="contact-services-feature-icon" />
                       <span className="contact-services-feature-text">{feature}</span>
                     </div>
                   ))}
                 </div>
               </div>
               <button className="contact-services-preview-btn">
                 Learn More
               </button>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* Customer Testimonials */}
     <div className="contact-testimonials">
       <div className="contact-testimonials-container">
         <div className="contact-testimonials-header">
           <h2 className="contact-testimonials-title">What Our Customers Say</h2>
           <p className="contact-testimonials-subtitle">
             Real experiences from our growing community of e-bike enthusiasts
           </p>
         </div>
         
         <div className="contact-testimonials-grid">
           {testimonials.map((testimonial, index) => (
             <div key={index} className="contact-testimonial-card">
               <div className="contact-testimonial-rating">
                 {[...Array(testimonial.rating)].map((_, i) => (
                   <Star key={i} className="contact-testimonial-star" />
                 ))}
               </div>
               <p className="contact-testimonial-content">
                 "{testimonial.content}"
               </p>
               <div className="contact-testimonial-author">
                 <img 
                   src={testimonial.image} 
                   alt={testimonial.name}
                   className="contact-testimonial-avatar"
                 />
                 <div className="contact-testimonial-info">
                   <h4>{testimonial.name}</h4>
                   <p>{testimonial.role}</p>
                 </div>
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>

     {/* FAQ Section */}
     <div className="contact-faq">
       <div className="contact-faq-container">
         <div className="contact-faq-header">
           <h2 className="contact-faq-title">Frequently Asked Questions</h2>
           <p className="contact-faq-subtitle">
             Quick answers to common questions about our e-bikes and services
           </p>
         </div>
         
         <div className="contact-faq-list">
           {faqs.map((faq, index) => (
             <div key={index} className="contact-faq-item">
               <h3 className="contact-faq-question">{faq.question}</h3>
               <p className="contact-faq-answer">{faq.answer}</p>
             </div>
           ))}
         </div>
         
         <div className="contact-faq-cta">
           <p className="contact-faq-cta-text">Still have questions?</p>
           <button className="contact-faq-cta-btn">
             Contact Our Experts
           </button>
         </div>
       </div>
     </div>

     {/* Map Section */}
     <div className="contact-map">
       <div className="contact-map-container">
         <div className="contact-map-header">
           <h2 className="contact-map-title">Visit Our Location</h2>
           <p className="contact-map-subtitle">Located in the heart of Nairobi, Kenya</p>
         </div>
         
         <div className="contact-map-wrapper">
           <div className="contact-map-grid">
             <div className="contact-map-placeholder">
               <div>
                 <MapPin className="contact-map-placeholder-icon" />
                 <h3 className="contact-map-placeholder-title">Interactive Map</h3>
                 <p className="contact-map-placeholder-text">Map integration would be implemented here</p>
                 <button className="contact-map-placeholder-btn">
                   Get Directions
                 </button>
               </div>
             </div>
             <div className="contact-map-info">
               <h3 className="contact-map-info-title">Visit Us Today</h3>
               <div className="contact-map-info-section">
                 <h4>Address</h4>
                 <p>Nairobi, Kenya<br />East African Headquarters</p>
               </div>
               <div className="contact-map-info-section">
                 <h4>Operating Hours</h4>
                 <div className="contact-map-info-hours">
                   <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                   <p>Saturday: 9:00 AM - 4:00 PM</p>
                   <p>Sunday: Closed</p>
                 </div>
               </div>
               <div className="contact-map-info-section">
                 <h4>What to Expect</h4>
                 <div className="contact-map-info-features">
                   <div className="contact-map-info-feature">
                     <CheckCircle className="contact-map-info-feature-icon" />
                     <span className="contact-map-info-feature-text">Free test rides</span>
                   </div>
                   <div className="contact-map-info-feature">
                     <CheckCircle className="contact-map-info-feature-icon" />
                     <span className="contact-map-info-feature-text">Expert consultation</span>
                   </div>
                   <div className="contact-map-info-feature">
                     <CheckCircle className="contact-map-info-feature-icon" />
                     <span className="contact-map-info-feature-text">Financing options</span>
                   </div>
                   <div className="contact-map-info-feature">
                     <CheckCircle className="contact-map-info-feature-icon" />
                     <span className="contact-map-info-feature-text">Service & repairs</span>
                   </div>
                 </div>
               </div>
               <div className="contact-map-actions">
                 <button className="contact-map-action contact-map-action-primary">
                   Schedule Visit
                 </button>
                 <button className="contact-map-action contact-map-action-secondary">
                   Call Ahead
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* Final CTA Section */}
     <div className="contact-final-cta">
       <div className="contact-final-cta-container">
         <h2 className="contact-final-cta-title">
           Ready to Start Your E-Mobility Journey?
         </h2>
         <p className="contact-final-cta-description">
           Join thousands of satisfied customers who have already made the switch to sustainable transportation. Get in touch today and discover how we can help you achieve your mobility goals.
         </p>
         <div className="contact-final-cta-buttons">
           <button className="contact-final-cta-btn contact-final-cta-btn-primary">
             <MessageCircle className="w-6 h-6" />
             <span>Start WhatsApp Chat</span>
           </button>
           <button className="contact-final-cta-btn contact-final-cta-btn-secondary">
             <Calendar className="w-6 h-6" />
             <span>Book Test Ride</span>
           </button>
         </div>
         <div className="contact-final-cta-features">
           <div className="contact-final-cta-feature">
             <CheckCircle className="contact-final-cta-feature-icon" />
             <span>24/7 Support</span>
           </div>
           <div className="contact-final-cta-feature">
             <CheckCircle className="contact-final-cta-feature-icon" />
             <span>Free Consultation</span>
           </div>
           <div className="contact-final-cta-feature">
             <CheckCircle className="contact-final-cta-feature-icon" />
             <span>Expert Guidance</span>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default ContactPage;