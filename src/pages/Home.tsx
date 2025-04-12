import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints, ComplaintSubmission } from '../contexts/ComplaintContext';
import { toast } from 'react-hot-toast';
import { 
  ArrowRight, Send, Calendar, FileText, Map, 
  MessageSquare, CheckCircle, User, Image as ImageIcon, 
  ChevronRight
} from 'lucide-react';
import HeroBanner from '../components/home/HeroBanner';
import QuickNav from '../components/home/QuickNav';
import UpcomingEvents from '../components/home/UpcomingEvents';
import PhotoHighlights from '../components/home/PhotoHighlights';

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const COMPLAINT_CATEGORIES = [
  'Maintenance',
  'Noise',
  'Security',
  'Parking',
  'Common Areas',
  'Other'
];

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const { submitComplaint } = useComplaints();
  const complaintRef = useRef<HTMLDivElement>(null);
  
  // State for complaint form
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'maintenance',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComplaintForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!complaintForm.title.trim() || !complaintForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!currentUser) {
      toast.error('You must be logged in to submit a complaint');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const complaintData: ComplaintSubmission = {
        ...complaintForm,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email
      };
      
      await submitComplaint(complaintData);
      setSubmitted(true);
      setComplaintForm({
        title: '',
        category: 'maintenance',
        description: ''
      });
      toast.success('Your complaint has been submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit complaint. Please try again.');
      console.error('Error submitting complaint:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Function to submit another complaint
  const handleSubmitAnother = () => {
    setSubmitted(false);
  };
  
  // Scroll to complaint section
  const scrollToComplaint = () => {
    complaintRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <HeroBanner onReportIssue={scrollToComplaint} />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Quick Navigation Section */}
        <section className="bg-white py-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
              <p className="text-gray-500 mt-1">Navigate to important sections of our community portal</p>
            </motion.div>
            <QuickNav />
          </div>
        </section>
        
        {/* Community Highlights Section */}
        <section className="py-14 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Community Highlights</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The latest events and photos from our vibrant community
              </p>
            </motion.div>
            
            {/* Upcoming Events Section */}
            <div className="space-y-14">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="bg-primary p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-6 w-6 text-white mr-3" />
                      <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                    </div>
                    <a 
                      href="/events" 
                      className="text-white/80 hover:text-white text-sm font-medium flex items-center transition-colors"
                    >
                      View All <ArrowRight size={16} className="ml-1" />
                    </a>
                  </div>
                </div>
                <div className="p-6">
                  <UpcomingEvents />
                </div>
              </motion.div>
              
              {/* Photo Gallery Section */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="bg-accent p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ImageIcon className="h-6 w-6 text-white mr-3" />
                      <h3 className="text-xl font-bold text-white">Photo Gallery</h3>
                    </div>
                    <a 
                      href="/gallery" 
                      className="text-white/80 hover:text-white text-sm font-medium flex items-center transition-colors"
                    >
                      View All <ArrowRight size={16} className="ml-1" />
                    </a>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Community Highlights</h4>
                    <p className="text-gray-600">Capturing beautiful moments and special places in our Eastern Green community.</p>
                  </div>
                  <PhotoHighlights />
                  <div className="mt-8 text-center">
                    <a 
                      href="/gallery" 
                      className="inline-flex items-center px-5 py-2.5 bg-accent text-white rounded-lg shadow-sm hover:bg-accent/90 transition-colors text-sm font-medium"
                    >
                      Explore Full Gallery
                      <ArrowRight size={16} className="ml-2" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore Our Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover everything our platform offers to enhance your community experience
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar className="h-8 w-8 text-primary" />,
                  title: "Events",
                  description: "View, RSVP, and stay up-to-date with all community gatherings and activities.",
                  link: "/events"
                },
                {
                  icon: <ImageIcon className="h-8 w-8 text-primary" />,
                  title: "Gallery",
                  description: "Browse photos from our community events and beautiful shared spaces.",
                  link: "/gallery"
                },
                {
                  icon: <FileText className="h-8 w-8 text-primary" />,
                  title: "Documents",
                  description: "Access important community documents, announcements, and guidelines.",
                  link: "/documents"
                },
                {
                  icon: <User className="h-8 w-8 text-primary" />,
                  title: "Directory",
                  description: "Connect with other community members and build relationships.",
                  link: "/directory"
                },
                {
                  icon: <Map className="h-8 w-8 text-primary" />,
                  title: "Community Map",
                  description: "Explore an interactive map of our community and surrounding areas.",
                  link: "#map-section"
                },
                {
                  icon: <MessageSquare className="h-8 w-8 text-primary" />,
                  title: "Submit Issues",
                  description: "Report concerns or maintenance issues directly to management.",
                  link: "#complaint-section",
                  onClick: scrollToComplaint
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 group"
                  onClick={() => feature.onClick ? feature.onClick() : window.location.href = feature.link}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-primary font-medium">
                    Explore
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* 3D Map Section */}
        <section id="map-section" className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore Our Location</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Take a virtual tour of our community with this interactive 3D map
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-xl overflow-hidden shadow-lg border border-gray-200"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!4v1744456239591!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRG50cm5kQkE.!2m2!1d17.39234861277816!2d78.62686176699586!3f155.9072315157725!4f0!5f0.7820865974627469" 
                width="100%" 
                height="500" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Community Location"
              ></iframe>
            </motion.div>
          </div>
        </section>
        
        {/* Complaint Form Section */}
        {currentUser && (
          <div 
            ref={complaintRef} 
            id="complaint-section" 
            className="py-14 bg-white"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Submit a Complaint</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Let us know about any issues or concerns you have
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-r from-primary to-secondary p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-7 w-7 text-white mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Report an Issue</h3>
                      <p className="text-white/80 mt-1">We value your feedback and will address your concerns promptly</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {submitted ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">Thank You!</h3>
                      <p className="text-gray-600 mb-6">Your complaint has been submitted successfully. We'll review it and get back to you soon.</p>
                      <button
                        onClick={handleSubmitAnother}
                        className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                      >
                        Submit Another Complaint
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitComplaint} className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Complaint Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={complaintForm.title}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          placeholder="Brief title of your complaint"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={complaintForm.category}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          required
                        >
                          {COMPLAINT_CATEGORIES.map(category => (
                            <option key={category} value={category.toLowerCase()}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          value={complaintForm.description}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          placeholder="Please provide details about your complaint"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Submit Complaint
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;