// src/pages/services/ConversionKitsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Bike, 
  CheckCircle, 
  Star, 
  Phone, 
  Wrench,
  Gauge,
  Battery,
  Monitor,
  ArrowRight,
  Calendar,
  Award,
  Shield
} from 'lucide-react';

const ConversionKitsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedKit, setSelectedKit] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const conversionKits = [
    {
      name: "Basic Hub Motor Kit",
      power: "250W",
      speed: "25 km/h",
      price: "KSh 35,000",
      range: "30-50 km",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop",
      components: [
        "250W rear hub motor",
        "36V 10Ah battery",
        "Basic LCD display",
        "Throttle & PAS sensor",
        "Controller unit",
        "Charger & cables"
      ],
      installation: "4-6 hours",
      warranty: "1 year",
      ideal: "Casual riding & commuting"
    },
    {
      name: "Premium Mid-Drive Kit",
      power: "750W",
      speed: "45 km/h",
      price: "KSh 65,000",
      range: "60-80 km",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      components: [
        "750W Bafang mid-drive motor",
        "48V 15Ah premium battery",
        "Color LCD display",
        "Torque & cadence sensors",
        "Advanced controller",
        "Fast charger included"
      ],
      installation: "6-8 hours",
      warranty: "2 years",
      ideal: "Performance & long-distance",
      popular: true
    },
    {
      name: "Commercial Heavy-Duty Kit",
      power: "1000W",
      speed: "50 km/h",
      price: "KSh 85,000",
      range: "80-100 km",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      components: [
        "1000W commercial motor",
        "48V 20Ah heavy-duty battery",
        "Smart display with GPS",
        "Dual sensor system",
        "Weatherproof controller",
        "Anti-theft features"
      ],
      installation: "8-10 hours",
      warranty: "3 years",
      ideal: "Commercial & cargo bikes"
    }
  ];

  const conversionProcess = [
    {
      step: "1",
      title: "Bike Assessment",
      description: "We evaluate your bike's compatibility and recommend the best conversion kit",
      duration: "30 minutes"
    },
    {
      step: "2",
      title: "Kit Selection",
      description: "Choose the perfect kit based on your needs, budget, and riding style",
      duration: "15 minutes"
    },
    {
      step: "3",
      title: "Professional Installation",
      description: "Our certified technicians install all components with precision",
      duration: "6-10 hours"
    },
    {
      step: "4",
      title: "System Testing",
      description: "Comprehensive testing to ensure everything works perfectly",
      duration: "1 hour"
    },
    {
      step: "5",
      title: "Training & Handover",
      description: "Learn how to operate and maintain your new e-bike",
      duration: "30 minutes"
    }
  ];

  const compatibleBikes = [
    {
      type: "Mountain Bikes",
      description: "Perfect for off-road adventures with added electric power",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=200&fit=crop",
      compatibility: "Excellent"
    },
    {
      type: "Road Bikes",
      description: "Transform your road bike for longer, faster commutes",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      compatibility: "Good"
    },
    {
      type: "Hybrid Bikes",
      description: "Ideal candidates for e-bike conversion with great results",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=200&fit=crop",
      compatibility: "Excellent"
    },
    {
      type: "Cargo Bikes",
      description: "Heavy-duty kits perfect for commercial and cargo applications",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
      compatibility: "Excellent"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-purple-800 font-semibold">E-Bike Conversion Kits</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Transform Your
                <span className="block text-purple-600">Regular Bike</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Convert your existing bicycle into a powerful e-bike with our premium conversion kits. Professional installation, comprehensive warranty, and expert support included.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                  Check Compatibility
                </button>
                <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                  View Kits
                </button>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <img 
                src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop" 
                alt="E-bike conversion kit"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Kits */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Conversion Kit Options</h2>
            <p className="text-xl text-gray-600">
              Professional-grade kits for every type of bike and riding style
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {conversionKits.map((kit, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${kit.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {kit.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={kit.image} 
                    alt={kit.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl font-bold">{kit.price}</div>
                    <div className="text-sm opacity-90">{kit.installation} install</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{kit.name}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Power:</span>
                      <div className="font-semibold">{kit.power}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Range:</span>
                      <div className="font-semibold">{kit.range}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {kit.components.map((component, i) => (
                      <div key={i} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm text-gray-700">{component}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                    Select This Kit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compatible Bikes */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Compatible Bike Types</h2>
            <p className="text-xl text-gray-600">
              Most bikes can be converted - here's what works best
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {compatibleBikes.map((bike, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={bike.image} 
                  alt={bike.type}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{bike.type}</h3>
                  <p className="text-sm text-gray-600 mb-3">{bike.description}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    bike.compatibility === 'Excellent' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bike.compatibility} Compatibility
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Process */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Conversion Process</h2>
            <p className="text-xl text-gray-600">
              Professional installation in 5 simple steps
            </p>
          </div>
          
          <div className="space-y-8">
            {conversionProcess.map((step, index) => (
              <div key={index} className="flex items-center gap-6 bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                <div className="text-purple-600 font-semibold">{step.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6">Ready to Convert Your Bike?</h2>
          <p className="text-xl opacity-90 mb-8">
            Transform your regular bike into an electric powerhouse
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Book Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Get Free Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionKitsPage;