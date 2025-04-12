import React from 'react';
import { motion } from 'framer-motion';
import { Building, ChevronRight, MapPin, Home, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeroBannerProps {
  onReportIssue?: () => void;
}

export default function HeroBanner({ onReportIssue }: HeroBannerProps) {
  const { currentUser } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
          alt="Eastern Green Homes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/70"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 pt-24 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20">
                <Building className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-white">Premium Community Living</span>
              </div>

              <h1 className="text-5xl font-extrabold font-heading tracking-tight text-white sm:text-6xl lg:text-7xl">
                Welcome to
                <span className="block mt-2 text-accent">Eastern Green Homes</span>
              </h1>

              <p className="mt-6 text-lg text-gray-200 max-w-2xl">
                Experience vibrant community living, simplified. Discover events, connect with neighbors, and manage your residency effortlessly in our exclusive gated community.
              </p>
              
              {/* Stats Row */}
              <div className="mt-8 grid grid-cols-3 gap-5">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-accent mr-2" />
                    <span className="font-semibold text-white">250+</span>
                  </div>
                  <p className="text-xs text-gray-200">Premium Apartments</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-accent mr-2" />
                    <span className="font-semibold text-white">500+</span>
                  </div>
                  <p className="text-xs text-gray-200">Happy Residents</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-accent mr-2" />
                    <span className="font-semibold text-white">4.8/5</span>
                  </div>
                  <p className="text-xs text-gray-200">Resident Rating</p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {!currentUser ? (
                  <>
                    <Link 
                      to="/register" 
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                      Join Our Community
                    </Link>
                    <Link 
                      to="/login" 
                      className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-base font-medium rounded-md shadow-sm text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                    >
                      Resident Login
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/events" 
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                      View Events
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                    <button 
                      onClick={onReportIssue}
                      className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-base font-medium rounded-md shadow-sm text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                    >
                      Report Issue
                    </button>
                  </>
                )}
              </div>
            </motion.div>
            
            {/* Right Column - Features Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-xl mb-4">Community Amenities</h3>
                
                <ul className="space-y-4">
                  {[
                    { icon: <i className="fas fa-swimming-pool text-accent"></i>, text: 'Premium Swimming Pool with Lounging Area' },
                    { icon: <i className="fas fa-dumbbell text-accent"></i>, text: 'State-of-the-art Fitness Center' },
                    { icon: <i className="fas fa-tree text-accent"></i>, text: 'Landscaped Gardens & Children\'s Park' },
                    { icon: <i className="fas fa-shield-alt text-accent"></i>, text: '24/7 Security with CCTV Surveillance' },
                    { icon: <i className="fas fa-car text-accent"></i>, text: 'Covered Parking with EV Charging' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                        <ChevronRight className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="ml-3 text-gray-200">{item.text}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-accent mt-1" />
                    <div className="ml-2">
                      <p className="text-white font-medium">Eastern Green Homes</p>
                      <p className="text-gray-300 text-sm">123 Serene Avenue, Greenwood</p>
                      <p className="text-gray-300 text-sm">Hyderabad, Telangana 500032</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Wave pattern at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full">
          <path 
            fill="#FFFFFF" 
            fillOpacity="1" 
            d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,42.7C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z">
          </path>
        </svg>
      </div>
    </div>
  );
}