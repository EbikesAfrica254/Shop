// src/pages/services/TestRidePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Star, 
  Phone,
  Users,
  Route,
  Shield,
  Award,
  MessageCircle
} from 'lucide-react';

const TestRidePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const testRideOptions = [
    {
      name: "Quick Test Ride",
      duration: "15 minutes",
      price: "Free",
      description: "Get a feel for our e-bikes with a short ride around our facility",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      includes: [
        "Basic bike orientation",
        "Safety briefing",
        "Supervised test ride",
        "Q&A session"
      ],
      ideal: "First-time riders"
    },
    {
      name: "Extended Test Ride",
      duration: "45 minutes",
      price: "KSh 500",
      description: "Comprehensive test ride through various terrains and conditions",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop",
      includes: [
        "Detailed bike overview",
        "City route test ride",
        "Feature demonstration",
        "Performance comparison",
        "Personalized consultation"
      ],
      ideal: "Serious buyers",
      popular: true
    },
    {
      name: "Weekend Adventure",
      duration: "3 hours",
      price: "KSh 2,000",
      description: "Experience the full potential of our e-bikes on scenic routes",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      includes: [
        "Professional guide",
        "Scenic route tour",
        "Multiple bike models",
        "Refreshments included",
        "Group discounts available"
      ],
      ideal: "Adventure seekers"
    }
  ];

  const availableRoutes = [
    {
      name: "City Center Circuit",
      distance: "5 km",
      difficulty: "Easy",
      duration: "20 minutes",
      description: "Navigate through Nairobi's business district",
      highlights: ["Traffic simulation", "Urban riding", "Stop-and-go practice"],
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop"
    },
    {
      name: "Park Trail Adventure",
      distance: "8 km",
      difficulty: "Moderate",
      duration: "35 minutes",
      description: "Explore beautiful parks and green spaces",
      highlights: ["Nature trails", "Hill climbing", "Battery range test"],
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop"
    },
    {
      name: "Suburban Explorer",
      distance: "12 km",
      difficulty: "Moderate",
      duration: "50 minutes",
      description: "Experience suburban roads and residential areas",
      highlights: ["Mixed terrain", "Range testing", "Real-world conditions"],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    }
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const testimonials = [
    {
      name: "Michael Ochieng",
      rating: 5,
      comment: "The test ride convinced me immediately! The staff was knowledgeable and the bike performed perfectly.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      purchased: "High-Capacity Premium"
    },
    {
      name: "Susan Wanjiru",
      rating: 5,
      comment: "Great experience! The extended test ride helped me choose the perfect e-bike for my commute.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c886?w=100&h=100&fit=crop&crop=face",
      purchased: "City Commuter"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full mb-6">
                <Bike className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-semibold">E-Bike Test Rides</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Experience Before
                <span className="block text-green-600">You Buy</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Take our e-bikes for a spin and discover the perfect match for your lifestyle. Free test rides available with expert guidance and support.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                  Book Test Ride
                </button>
                <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors">
                  View Available Times
                </button>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" 
                alt="E-bike test ride"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Ride Options */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Test Ride Options</h2>
            <p className="text-xl text-gray-600">
              Choose the test ride experience that suits your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testRideOptions.map((option, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${option.popular ? 'ring-2 ring-green-500' : ''}`}
              >
                {option.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={option.image} 
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl font-bold">{option.price}</div>
                    <div className="text-sm opacity-90">{option.duration}</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{option.name}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {option.includes.map((item, i) => (
                      <div key={i} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                    Book This Ride
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Routes */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Test Ride Routes</h2>
            <p className="text-xl text-gray-600">
              Explore different terrains and conditions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {availableRoutes.map((route, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={route.image} 
                  alt={route.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{route.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{route.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Distance:</span>
                      <div className="font-semibold">{route.distance}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-semibold">{route.duration}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span>
                      <div className="font-semibold">{route.difficulty}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {route.highlights.map((highlight, i) => (
                      <div key={i} className="text-xs text-green-600 font-medium">
                        • {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">Book Your Test Ride</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Available Time Slots</h3>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((time, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTimeSlot(time)}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedTimeSlot === time
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-green-600 mr-3" />
                    <span>+254 700 123 456</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-green-600 mr-3" />
                    <span>Westlands, Nairobi</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-600 mr-3" />
                    <span>Mon-Sat: 8AM-6PM</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6">Ready to Experience Electric?</h2>
          <p className="text-xl opacity-90 mb-8">
            Book your free test ride today and discover your perfect e-bike
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Book Free Test Ride
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Call Now: +254 700 123 456
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRidePage;