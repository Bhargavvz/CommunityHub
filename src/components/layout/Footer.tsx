import React from 'react';
import { Home, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' }
];

const quickLinks = [
  { text: 'About Us', href: '#' },
  { text: 'Contact', href: '#' },
  { text: 'Privacy Policy', href: '#' },
  { text: 'Terms of Service', href: '#' },
  { text: 'FAQ', href: '#' },
  { text: 'Careers', href: '#' }
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-1.5 bg-white/20 rounded-lg shadow-sm">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">Eastern Green Homes</span>
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              Creating a vibrant community where neighbors become family and every day brings new opportunities to connect and thrive.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3 text-gray-300 hover:text-white transition-colors">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>info@communityhub.example</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.text}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-150 ease-in-out">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Connect With Us</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 bg-white/20 rounded-full text-white hover:bg-secondary transition-colors duration-150 ease-in-out"
                  aria-label={social.label}
                  title={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-300">
              © {new Date().getFullYear()} Eastern Green Homes. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="text-gray-300">
                Designed & Built for Our Community
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}