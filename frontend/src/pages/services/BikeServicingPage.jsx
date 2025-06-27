// src/pages/services/BikeServicingPage.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/pages/services/bike-servicing.css';
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  Star, 
  Phone, 
  Calendar,
  Zap,
  Shield,
  Award,
  ArrowRight,
  MessageCircle,
  MapPin
} from 'lucide-react';

const BikeServicingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const servicePackages = [
    {
      name: "Basic Tune-Up",
      price: "KSh 2,500",
      duration: "2-3 hours",
      description: "Essential maintenance to keep your e-bike running smoothly",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      services: [
        "Battery health check",
        "Brake adjustment",
        "Chain cleaning & lubrication",
        "Tire pressure check",
        "Basic electrical inspection",
        "Safety check"
      ],
      ideal: "Monthly maintenance"
    },
    {
      name: "Comprehensive Service",
      price: "KSh 4,500",
      duration: "4-6 hours",
      description: "Complete overhaul and optimization of your e-bike",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop",
      services: [
        "Full battery diagnostic",
        "Motor performance check",
        "Complete brake system service",
        "Drivetrain cleaning & adjustment",
        "Electrical system inspection",
        "Software updates",
        "Frame inspection",
        "Component replacement if needed"
      ],
      ideal: "Every 3-6 months",
      popular: true
    },
    {
      name: "Emergency Repair",
      price: "From KSh 1,500",
      duration: "1-2 hours",
      description: "Quick fixes for urgent issues to get you back on the road",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      services: [
        "Flat tire repair",
        "Brake cable adjustment",
        "Quick electrical fixes",
        "Emergency battery check",
        "Safety inspection",
        "Basic troubleshooting"
      ],
      ideal: "As needed"
    }
  ];

  const testimonials = [
    {
      name: "Mary Njoki",
      location: "Nairobi CBD",
      rating: 5,
      comment: "Excellent service! My e-bike runs like new after their comprehensive service.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "James Mwangi",
      location: "Westlands",
      rating: 5,
      comment: "Quick and reliable emergency repair. They had me back on the road in no time.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full mb-6">
                <Wrench className="w-5 h-5 text-emerald-600 mr-2" />
                <span className="text-emerald-800 font-semibold">Professional E-Bike Servicing</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Expert Care for Your
                <span className="block text-emerald-600">E-Bike</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Keep your e-bike running at peak performance with our comprehensive maintenance and repair services.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                  Book Service Now
                </button>
                <button className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Call: +254 700 123 456
                </button>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <img 
                src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop" 
                alt="Professional e-bike servicing"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Packages */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Service Packages</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right maintenance package for your e-bike's needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {servicePackages.map((pkg, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${pkg.popular ? 'ring-2 ring-emerald-500' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl font-bold">{pkg.price}</div>
                    <div className="text-sm opacity-90">{pkg.duration}</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {pkg.services.map((service, i) => (
                      <div key={i} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                    Book This Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">What Our Customers Say</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6">Ready to Service Your E-Bike?</h2>
          <p className="text-xl opacity-90 mb-8">
            Book your service appointment today
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Service
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-emerald-600 transition-colors flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Call +254 700 123 456
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeServicingPage;