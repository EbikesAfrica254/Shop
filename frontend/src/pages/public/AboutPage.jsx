// src/pages/public/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import { Target, Zap, Leaf, Award, Users, Globe, Calendar, CheckCircle, ArrowRight, Play, Star, Trophy, Bike, Battery, Map } from 'lucide-react';
import "../../styles/pages/public/about.css";

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const teamMembers = [
    {
      name: "Jorgs Mbugua",
      role: "Co-founder & CEO",
      background: "With extensive experience in Land Administration and policy formulation, Jorgs leads our vision of having 1 million e-bikes on African roads by 2032. His expertise in policy development has been crucial in navigating regulatory frameworks across East Africa.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      achievements: ["Policy Expert", "Sustainability Advocate", "Vision 2032 Leader"]
    },
    {
      name: "Rob Boehm",
      role: "Co-founder & COO",
      background: "Rob brings international perspective with his background in European studies and business development. He focuses on making electric bicycles accessible and affordable through innovative financing models like our Ride to Own program.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      achievements: ["International Business", "Operations Excellence", "Financing Innovation"]
    },
    {
      name: "Joe Karani",
      role: "Marketing & Creative Director",
      background: "Joe's extensive media background includes work with UN, British Council, Kenya Tourism Board, and major brands. He leads our creative strategy and community engagement initiatives across East Africa.",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
      achievements: ["Brand Strategy", "Media Relations", "Community Building"]
    },
    {
      name: "Martin Wanjia",
      role: "Technical Lead",
      background: "Martin combines electrical engineering expertise with cutting-edge knowledge in AI, data science, and blockchain. He drives our technical innovation and ensures our e-bikes meet the highest performance standards.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
      achievements: ["AI Integration", "Technical Innovation", "Performance Optimization"]
    },
    {
      name: "Ann Wambui Ndungu",
      role: "Head of Administration & PR",
      background: "Ann brings unique perspective from nutrition and dietetics background, focusing on mental health advocacy. She manages our public relations and promotes our vision of sustainable, healthy transportation.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c886?w=400&h=400&fit=crop&crop=face",
      achievements: ["Public Relations", "Mental Health Advocacy", "Team Management"]
    },
    {
      name: "Edward Otieno",
      role: "Product Manager & Consultant",
      background: "With Industrial Chemistry background and MBA, Edward focuses on sustainable product development and manufacturing optimization. He leads our efforts toward local production of e-bike components.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      achievements: ["Product Development", "Manufacturing", "Sustainability Focus"]
    }
  ];

  const companyStats = [
    { 
      icon: Target, 
      value: "1M", 
      label: "E-bikes Goal by 2032", 
      description: "Our ambitious vision to revolutionize African transportation" 
    },
    { 
      icon: Leaf, 
      value: "100%", 
      label: "Carbon Neutral", 
      description: "Zero emissions transportation solutions" 
    },
    { 
      icon: Users, 
      value: "1000+", 
      label: "Customers Served", 
      description: "Growing community of e-bike enthusiasts" 
    },
    { 
      icon: Globe, 
      value: "5", 
      label: "East African Cities", 
      description: "Expanding presence across the region" 
    }
  ];

  const timeline = [
    {
      year: "2022",
      title: "Company Founded",
      description: "Ebikes Africa established in Nairobi with a vision to electrify East African transportation",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
    },
    {
      year: "2023",
      title: "E4Impact Accelerator",
      description: "Selected for E4Impact Foundation Accelerator program, gaining valuable mentorship and resources",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
    },
    {
      year: "2024",
      title: "Local Production Goal",
      description: "Committed to local production of major e-bike components by December 2024",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
    },
    {
      year: "2025",
      title: "Expansion Phase",
      description: "Growing partnerships with Pizza Inn, Ando Foods, and expanding delivery network",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop"
    }
  ];

  const achievements = [
    {
      icon: Trophy,
      title: "Kenya Innovation Week Participant",
      description: "Showcased our e-bicycle technology at this prestigious event"
    },
    {
      icon: Star,
      title: "E4Impact Accelerator Graduate",
      description: "Successfully completed the accelerator program with excellent results"
    },
    {
      icon: Award,
      title: "Sustainability Pioneer",
      description: "Leading the charge in eco-friendly transportation solutions in East Africa"
    },
    {
      icon: Zap,
      title: "Innovation Leader",
      description: "Developing cutting-edge e-mobility solutions for African markets"
    }
  ];

  const values = [
    {
      title: "Sustainability",
      description: "Committed to reducing carbon emissions and promoting eco-friendly transportation",
      image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=500&h=300&fit=crop",
      icon: Leaf
    },
    {
      title: "Innovation",
      description: "Leveraging cutting-edge technology to create superior e-mobility solutions",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop",
      icon: Zap
    },
    {
      title: "Community",
      description: "Building strong relationships with local communities and promoting inclusive growth",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=300&fit=crop",
      icon: Users
    },
    {
      title: "Quality",
      description: "Delivering reliable, high-performance e-bikes designed for African conditions",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="about-hero">
        <img 
          src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&h=1080&fit=crop" 
          alt="Electric bike in African landscape"
          className="about-hero-bg"
        />
        
        {/* Floating Elements */}
        <div className="about-hero-float about-hero-float-1"></div>
        <div className="about-hero-float about-hero-float-2"></div>

        <div className="about-hero-content">
          <div className={`transform transition-all duration-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="about-hero-badge">
              <div className="about-hero-badge-icon">
                <Zap className="w-10 h-10 text-emerald-300" />
              </div>
              <span className="text-emerald-200 text-xl font-semibold tracking-wide">About Ebikes Africa</span>
            </div>
            
            <h1 className="about-hero-title">
              Electrifying
              <span className="about-hero-title-gradient">
                East Africa's
              </span>
              <span className="about-hero-subtitle">
                Transportation Future
              </span>
            </h1>
            
            <p className="about-hero-description">
              We're revolutionizing urban mobility across East Africa with sustainable, innovative e-bike solutions designed specifically for African cities and communities.
            </p>
            
            <div className="about-hero-buttons">
              <button 
                className="about-hero-btn-primary"
                onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Our Story
              </button>
              <button className="about-hero-btn-secondary">
                <Play className="w-5 h-5" />
                <span>Watch Video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="about-stats">
        <div className="about-stats-container">
          <div className="about-stats-grid">
            {companyStats.map((stat, index) => (
              <div key={index} className="about-stat-card">
                <div className="about-stat-icon">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="about-stat-value">{stat.value}</div>
                <div className="about-stat-label">{stat.label}</div>
                <p className="about-stat-desc">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div id="mission" className="about-mission">
        <div className="about-mission-container">
          <div className="about-mission-grid">
            <div className="about-mission-content">
              <h2 className="text-5xl font-black text-gray-900 mb-8">Our Mission</h2>
              <div className="space-y-6">
                <p className="about-mission-text large">
                  We're dedicated to revolutionizing transportation in East Africa by providing sustainable, accessible, and innovative e-mobility solutions that empower communities and protect our environment.
                </p>
                <p className="about-mission-text">
                  Our goal is to tackle the increasing challenges of urban transportation in African capital cities by offering clean, dependable, and easily accessible e-bicycles that enhance quality of life, promote environmental sustainability, and foster economic growth.
                </p>
                <div className="about-mission-features">
                  <div className="about-mission-feature">
                    <CheckCircle className="about-mission-feature-icon" />
                    <span className="about-mission-feature-text">Zero Emissions</span>
                  </div>
                  <div className="about-mission-feature">
                    <CheckCircle className="about-mission-feature-icon" />
                    <span className="about-mission-feature-text">Local Manufacturing</span>
                  </div>
                  <div className="about-mission-feature">
                    <CheckCircle className="about-mission-feature-icon" />
                    <span className="about-mission-feature-text">Community Impact</span>
                  </div>
                  <div className="about-mission-feature">
                    <CheckCircle className="about-mission-feature-icon" />
                    <span className="about-mission-feature-text">Affordable Access</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-mission-image">
              <div className="about-mission-img">
                <img 
                  src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=750&fit=crop" 
                  alt="Ebikes Africa mission"
                />
              </div>
              <div className="about-mission-badge">
                <div className="about-mission-badge-year">2032</div>
                <div className="about-mission-badge-text">Vision Year</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Values */}
      <div id="values" className="about-values">
        <div className="about-values-container">
          <div className="about-values-header">
            <h2 className="about-values-title">Our Core Values</h2>
            <p className="about-values-subtitle">
              The principles that guide our mission to transform East African transportation
            </p>
          </div>
          
          <div className="about-values-grid">
            {values.map((value, index) => (
              <div key={index} className="about-value-card">
                <div className="about-value-image">
                  <img 
                    src={value.image} 
                    alt={value.title}
                  />
                </div>
                <div className="about-value-content">
                  <div className="about-value-header">
                    <div className="about-value-icon">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="about-value-title">{value.title}</h3>
                  </div>
                  <p className="about-value-description">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div id="timeline" className="about-timeline">
        <div className="about-timeline-container">
          <div className="about-timeline-header">
            <h2 className="about-timeline-title">Our Journey</h2>
            <p className="about-timeline-subtitle">
              From startup to leading e-mobility solutions provider in East Africa
            </p>
          </div>
          
          <div className="about-timeline-grid">
            {timeline.map((item, index) => (
              <div 
                key={index} 
                className={`about-timeline-card ${activeTimeline === index ? 'active' : ''}`}
                onClick={() => setActiveTimeline(index)}
              >
                <div className="about-timeline-image">
                  <img 
                    src={item.image} 
                    alt={item.title}
                  />
                </div>
                <div className="about-timeline-content">
                  <div className="about-timeline-year">{item.year}</div>
                  <h3 className="about-timeline-event-title">{item.title}</h3>
                  <p className="about-timeline-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div id="achievements" className="about-achievements">
        <div className="about-achievements-container">
          <div className="about-achievements-header">
            <h2 className="about-achievements-title">Our Achievements</h2>
            <p className="about-achievements-subtitle">
              Recognition and milestones that mark our journey toward sustainable mobility
            </p>
          </div>
          
          <div className="about-achievements-grid">
            {achievements.map((achievement, index) => (
              <div key={index} className="about-achievement-card">
                <div className="about-achievement-icon">
                  <achievement.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="about-achievement-title">{achievement.title}</h3>
                <p className="about-achievement-description">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div id="team" className="about-team">
        <div className="about-team-container">
          <div className="about-team-header">
            <h2 className="about-team-title">Meet Our Team</h2>
            <p className="about-team-subtitle">
              The visionaries, innovators, and experts driving Africa's e-mobility revolution
            </p>
          </div>
          
          <div className="about-team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="about-team-card">
                <div className="about-team-image">
                  <img 
                    src={member.image} 
                    alt={member.name}
                  />
                </div>
                <div className="about-team-content">
                  <h3 className="about-team-name">{member.name}</h3>
                  <p className="about-team-role">{member.role}</p>
                  <p className="about-team-bio">{member.background}</p>
                  <div className="about-team-achievements">
                    {member.achievements.map((achievement, i) => (
                      <div key={i} className="about-team-achievement">
                        <div className="about-team-achievement-dot"></div>
                        <span className="about-team-achievement-text">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="about-cta">
        <div className="about-cta-container">
          <h2 className="about-cta-title">
            Ready to Join the Revolution?
          </h2>
          <p className="about-cta-description">
            Be part of East Africa's sustainable transportation future. Discover our e-bikes, partnerships, and career opportunities.
          </p>
          <div className="about-cta-buttons">
            <button className="about-cta-btn-primary">
              Explore Our E-Bikes
            </button>
            <button className="about-cta-btn-secondary">
              <span>Contact Us</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;