import React from 'react';
import {
  Calendar,
  FileText,
  // Wrench, // Maybe remove maintenance for now?
  // CreditCard, // Maybe remove payments for now?
  Users,
  Image,
  PhoneCall,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom'; // Use Link for internal navigation

// Update links to actual paths and refine selection
const quickLinks = [
  {
    icon: Calendar,
    text: 'Events Calendar',
    description: 'View upcoming community events',
    href: '/events',
    iconColor: 'text-accent', // Use accent color
    bgColor: 'bg-accent/10',
  },
  {
    icon: FileText,
    text: 'Document Center',
    description: 'Access forms, rules, and minutes',
    href: '/documents',
    iconColor: 'text-secondary', // Use secondary color
    bgColor: 'bg-secondary/10',
  },
  {
    icon: Users,
    text: 'Resident Directory',
    description: 'Connect with your neighbors',
    href: '/directory',
    iconColor: 'text-primary', // Use primary color
    bgColor: 'bg-primary/10',
  },
  {
    icon: Image,
    text: 'Photo Gallery',
    description: 'Browse community photos',
    href: '/gallery',
    iconColor: 'text-pink-400', // Keep a distinct color
    bgColor: 'bg-pink-400/10',
  },
  // Add more relevant links if needed, remove less relevant ones
];

export default function QuickNav() {
  return (
    // Add ID for anchor link, adjust padding, maybe a subtle background
    <div id="quick-nav" className="bg-background py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Update heading style */}
        <h2 className="text-3xl font-bold font-heading tracking-tight text-primary text-center mb-12">
          Explore Eastern Green Homes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => (
            <Link // Use Link component
              key={link.text}
              to={link.href}
              // Apply glassmorphism styles
              className="group relative flex flex-col justify-between overflow-hidden rounded-glass bg-white/5 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out border border-glass-border hover:bg-white/10 transform hover:-translate-y-1"
            >
              <div>
                {/* Icon styling */}
                <div className={`inline-flex ${link.bgColor} p-3 rounded-lg mb-4`}>
                  <link.icon className={`h-6 w-6 ${link.iconColor}`} />
                </div>
                {/* Text styling - adjust color for potentially complex background */}
                <h3 className="font-semibold text-text-primary mb-1">
                  {link.text}
                </h3>
                <p className="text-sm text-text-secondary">{link.description}</p>
              </div>
              {/* Arrow styling */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-end">
                <ArrowRight className="h-5 w-5 text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}