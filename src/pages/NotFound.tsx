import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, SearchX } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-var(--header-height,8rem))] flex flex-col items-center justify-center bg-gradient-to-br from-background via-gray-100 to-background p-8 text-center overflow-hidden">
      
      {/* Floating Glassmorphism Elements (Crazy UI Idea) */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 backdrop-blur-lg rounded-full opacity-50"
        animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary/10 backdrop-blur-md rounded-lg opacity-60"
        animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
       <motion.div 
        className="absolute top-1/3 right-1/3 w-16 h-16 bg-accent/10 backdrop-blur-sm rounded-xl opacity-40"
        animate={{ rotate: [0, 180, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <SearchX className="w-24 h-24 text-primary mb-6" strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-extrabold font-heading text-primary mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-text-secondary max-w-md mb-8">
          It seems the page you're looking for has ventured off into the digital wilderness. Don't worry, we can guide you back home.
        </p>

        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-primary rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Home className="mr-2 h-5 w-5" />
          Return to Homepage
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound; 