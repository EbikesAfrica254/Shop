// src/pages/services/WarrantyPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  FileText, 
  Phone, 
  Award,
  AlertCircle,
  Download,
  MessageCircle,
  Calendar,
  Wrench,
  Battery
} from 'lucide-react';

const WarrantyPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('coverage');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const warrantyPlans = [
    {
      name: "Standard Warranty",
      duration: "2 Years",
      price: "Included",
      description: "Comprehensive coverage for all major components",
      coverage: [
        "Motor & electrical system",
        "Battery (80% capacity)",
        "Controller & display",
        "Frame defects",
        "Manufacturing defects"
      ],
      limitations: [
        "Normal wear items excluded",
        "Accident damage not covered",
        "Water damage exclusions"
      ]
    },
    {
      name: "Extended Warranty",
      duration: "4 Years",
      price: "KSh 8,000",
      description: "Extended protection with additional benefits",
      coverage: [
        "All standard coverage",
        "Extended battery coverage",
        "Wear parts replacement",
        "Annual maintenance included",
        "Priority service support"
      ],
      limitations: [
        "Must be purchased with bike",
        "Proof of maintenance required"
      ],
      popular: true
    },
    {
      name: "Premium Care",
      duration: "5 Years",
      price: "KSh 15,000",
      description: "Ultimate protection with comprehensive coverage",
      coverage: [
        "Complete component coverage",
        "Battery replacement guarantee",
        "Accident protection",
        "Free annual services",
        "24/7 roadside assistance",
        "Loaner bike service"
      ],
      limitations: [
        "Terms and conditions apply"
      ]
    }
  ];

  const claimProcess = [
    {
      step: "1",
      title: "Report Issue",
      description: "Contact our warranty team via phone, email, or visit our service center",
      icon: Phone
    },
    {
      step: "2",
      title: "Assessment",
      description: "Our technicians will evaluate the issue and determine warranty coverage",
      icon: Wrench
    },
    {
      step: "3",
      title: "Approval",
      description: "Valid claims are approved and repair/replacement is scheduled",
      icon: CheckCircle
    },
    {
      step: "4",
      title: "Resolution",
      description: "We fix or replace the covered components at no cost to you",
      icon: Award
    }
  ];

  const faqItems = [
    {
      question: "What does the warranty cover?",
      answer: "Our warranty covers manufacturing defects, motor failures, electrical system issues, and battery capacity below 80% within the warranty period."
    },
    {
      question: "How do I make a warranty claim?",
      answer: "Contact our warranty team with your purchase receipt and description of the issue. We'll guide you through the assessment process."
    },
    {
      question: "What voids the warranty?",
      answer: "Modifications, accident damage, misuse, lack of maintenance, or repairs by unauthorized technicians will void the warranty."
    },
    {
      question: "Is regular maintenance required?",
      answer: "Yes, regular maintenance as per our schedule is required to maintain warranty coverage. We provide service records for tracking."
    },
    {
      question: "Can I extend my warranty after purchase?",
      answer: "Extended warranty must be purchased within 30 days of your original purchase date."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-semibold">Warranty & Protection</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Peace of Mind
                <span className="block text-blue-600">Guaranteed</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Comprehensive warranty coverage for your e-bike investment. From standard protection to premium care plans, we've got you covered.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  View Coverage
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  Make a Claim
                </button>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <img 
                src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop" 
                alt="E-bike warranty protection"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warranty Plans */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Warranty Plans</h2>
            <p className="text-xl text-gray-600">
              Choose the level of protection that's right for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {warrantyPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 font-semibold">
                   Most Popular
                 </div>
               )}
               
               <div className="p-6">
                 <div className="text-center mb-6">
                   <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                   <div className="text-4xl font-black text-blue-600 mb-2">{plan.duration}</div>
                   <div className="text-lg text-gray-600">{plan.price}</div>
                   <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                 </div>
                 
                 <div className="space-y-3 mb-6">
                   <h4 className="font-semibold text-gray-900">Coverage Includes:</h4>
                   {plan.coverage.map((item, i) => (
                     <div key={i} className="flex items-center">
                       <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                       <span className="text-sm text-gray-700">{item}</span>
                     </div>
                   ))}
                 </div>
                 
                 {plan.limitations && (
                   <div className="space-y-2 mb-6">
                     <h4 className="font-semibold text-gray-900 text-sm">Limitations:</h4>
                     {plan.limitations.map((limitation, i) => (
                       <div key={i} className="flex items-center">
                         <AlertCircle className="w-3 h-3 text-orange-500 mr-2 flex-shrink-0" />
                         <span className="text-xs text-gray-600">{limitation}</span>
                       </div>
                     ))}
                   </div>
                 )}
                 
                 <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                   Select Plan
                 </button>
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>

     {/* Claim Process */}
     <div className="py-20">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
           <h2 className="text-4xl font-black text-gray-900 mb-4">How to Make a Claim</h2>
           <p className="text-xl text-gray-600">
             Simple 4-step process to get your e-bike repaired or replaced
           </p>
         </div>
         
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
           {claimProcess.map((step, index) => (
             <div key={index} className="text-center">
               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <step.icon className="w-8 h-8 text-blue-600" />
               </div>
               <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                 {step.step}
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
               <p className="text-gray-600 text-sm">{step.description}</p>
             </div>
           ))}
         </div>
       </div>
     </div>

     {/* FAQ Section */}
     <div className="py-20 bg-gray-50">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
           <h2 className="text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
           <p className="text-xl text-gray-600">
             Get answers to common warranty questions
           </p>
         </div>
         
         <div className="space-y-6">
           {faqItems.map((faq, index) => (
             <div key={index} className="bg-white rounded-xl shadow-lg p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
               <p className="text-gray-600">{faq.answer}</p>
             </div>
           ))}
         </div>
       </div>
     </div>

     {/* Warranty Resources */}
     <div className="py-20">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
           <h2 className="text-4xl font-black text-gray-900 mb-4">Warranty Resources</h2>
           <p className="text-xl text-gray-600">
             Download forms and access support resources
           </p>
         </div>
         
         <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
             <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Download className="w-8 h-8 text-blue-600" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Warranty Certificate</h3>
             <p className="text-gray-600 mb-4">Download your warranty certificate and terms</p>
             <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
               Download PDF
             </button>
           </div>
           
           <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
             <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8 text-green-600" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Claim Form</h3>
             <p className="text-gray-600 mb-4">Start your warranty claim process</p>
             <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
               Fill Form
             </button>
           </div>
           
           <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
             <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <MessageCircle className="w-8 h-8 text-purple-600" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Support Chat</h3>
             <p className="text-gray-600 mb-4">Get instant help with warranty questions</p>
             <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
               Start Chat
             </button>
           </div>
         </div>
       </div>
     </div>

     {/* Contact Section */}
     <div className="py-20 bg-blue-600 text-white">
       <div className="max-w-4xl mx-auto px-4 text-center">
         <h2 className="text-4xl font-black mb-6">Need Warranty Support?</h2>
         <p className="text-xl opacity-90 mb-8">
           Our warranty team is here to help with claims, questions, and support
         </p>
         
         <div className="grid md:grid-cols-3 gap-8 mb-8">
           <div>
             <Phone className="w-8 h-8 mx-auto mb-2 opacity-80" />
             <h4 className="font-bold mb-1">Call Us</h4>
             <p className="opacity-80">+254 700 123 456</p>
           </div>
           <div>
             <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
             <h4 className="font-bold mb-1">Email Support</h4>
             <p className="opacity-80">warranty@ebikesafrica.com</p>
           </div>
           <div>
             <Clock className="w-8 h-8 mx-auto mb-2 opacity-80" />
             <h4 className="font-bold mb-1">Support Hours</h4>
             <p className="opacity-80">Mon-Fri: 8AM-6PM</p>
           </div>
         </div>
         
         <div className="flex flex-wrap gap-4 justify-center">
           <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
             Start Warranty Claim
           </button>
           <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
             Contact Support
           </button>
         </div>
       </div>
     </div>
   </div>
 );
};

export default WarrantyPage;