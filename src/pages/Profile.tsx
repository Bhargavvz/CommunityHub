import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Mail, Phone, Home, Save, AlertCircle, CheckCircle, Lock, 
  LogOut, Bell, Shield, FileText, Image, Settings, ArrowLeft, MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [flatNumber, setFlatNumber] = useState(currentUser?.flatNumber || '');
  const [blockNumber, setBlockNumber] = useState(currentUser?.blockNumber || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Initialize activeTab with what's in sessionStorage, if available
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('activeProfileTab');
    if (savedTab) {
      // Clear it so it's a one-time use
      sessionStorage.removeItem('activeProfileTab');
      return savedTab;
    }
    return 'profile';
  });
  
  // Update profile fields when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setFlatNumber(currentUser.flatNumber || '');
      setBlockNumber(currentUser.blockNumber || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setMessage('');
    
    // Basic validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the updateProfile method from AuthContext
      await updateProfile({
        name,
        phoneNumber,
        flatNumber,
        blockNumber
      });
      
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setPasswordError('');
    setPasswordMessage('');
    
    // Basic validation
    if (!oldPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setPasswordLoading(true);
      
      // Call the changePassword method from AuthContext
      await changePassword(newPassword);
      
      setPasswordMessage('Password changed successfully!');
      
      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Tabs for profile navigation
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'address', label: 'Address', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back to Home Button */}
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to home</span>
        </Link>
        
        {/* Header with Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-primary/20 backdrop-blur-md border border-glass-border shadow-lg rounded-glass p-8 mb-8 overflow-hidden"
        >
          {/* Background elements for visual interest */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent/10 rounded-full blur-xl"></div>
          <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-primary/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center">
            {/* Profile Avatar */}
            <div className="h-24 w-24 rounded-full flex items-center justify-center bg-primary text-white text-3xl font-bold relative overflow-hidden border-4 border-white/20 shadow-xl">
              {name ? name.charAt(0).toUpperCase() : 'U'}
              {/* Could add an avatar upload option here */}
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
              <h1 className="text-3xl font-bold font-heading text-white">{name || 'User'}</h1>
              <p className="text-gray-200 flex items-center justify-center md:justify-start mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {email}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 backdrop-blur-sm text-accent">
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Resident'}
                </span>
              </div>
            </div>
            
            {/* Logout Button (moved to the right side) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="mt-4 md:mt-0 ml-auto inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-glass-border text-white rounded-lg text-sm hover:bg-white/20 transition gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </motion.button>
          </div>
        </motion.div>
        
        {/* Main Content with Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar / Tab Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white/70 backdrop-blur-sm rounded-glass border border-glass-border shadow-sm overflow-hidden">
              <ul>
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-primary/10 border-l-4 border-primary text-primary font-medium' 
                          : 'hover:bg-gray-50 text-text-secondary hover:text-primary'
                      }`}
                    >
                      <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'} mr-3`} />
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
              
              {/* Additional Links Section */}
              <div className="px-4 py-3 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Quick Links
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link to="/documents" className="flex items-center px-2 py-1.5 text-sm text-text-secondary hover:text-primary rounded transition-colors">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      Documents
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" className="flex items-center px-2 py-1.5 text-sm text-text-secondary hover:text-primary rounded transition-colors">
                      <Image className="h-4 w-4 mr-2 text-gray-400" />
                      Gallery
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          
          {/* Content Section */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/70 backdrop-blur-sm rounded-glass border border-glass-border shadow-sm p-6"
              >
                <h2 className="text-xl font-bold font-heading text-primary mb-6">Personal Information</h2>
                
                {/* Error alert */}
                {error && (
                  <div className="mb-4 flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50/80 backdrop-blur-sm">
                    <AlertCircle className="flex-shrink-0 w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                )}
                
                {/* Success message */}
                {message && (
                  <div className="mb-4 flex items-center p-4 text-sm text-green-800 rounded-lg bg-green-50/80 backdrop-blur-sm">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-2" />
                    <span>{message}</span>
                  </div>
                )}
                
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-gray-100/50 backdrop-blur-sm rounded-lg cursor-not-allowed"
                        placeholder="Your email address"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/70 backdrop-blur-sm rounded-glass border border-glass-border shadow-sm p-6"
              >
                <h2 className="text-xl font-bold font-heading text-primary mb-6">Change Password</h2>
                
                {/* Error alert */}
                {passwordError && (
                  <div className="mb-4 flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50/80 backdrop-blur-sm">
                    <AlertCircle className="flex-shrink-0 w-5 h-5 mr-2" />
                    <span>{passwordError}</span>
                  </div>
                )}
                
                {/* Success message */}
                {passwordMessage && (
                  <div className="mb-4 flex items-center p-4 text-sm text-green-800 rounded-lg bg-green-50/80 backdrop-blur-sm">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-2" />
                    <span>{passwordMessage}</span>
                  </div>
                )}
                
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-text-primary mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Enter new password"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={passwordLoading}
                      className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Address Tab */}
            {activeTab === 'address' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/70 backdrop-blur-sm rounded-glass border border-glass-border shadow-sm p-6"
              >
                <h2 className="text-xl font-bold font-heading text-primary mb-6">Residence Information</h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="block" className="block text-sm font-medium text-text-primary mb-1">
                        Block Number
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="block"
                          type="text"
                          value={blockNumber}
                          onChange={(e) => setBlockNumber(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          placeholder="e.g., A, B, C"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="flat" className="block text-sm font-medium text-text-primary mb-1">
                        Flat Number
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="flat"
                          type="text"
                          value={flatNumber}
                          onChange={(e) => setFlatNumber(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          placeholder="e.g., 101, 204"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/70 backdrop-blur-sm rounded-glass border border-glass-border shadow-sm p-6"
              >
                <h2 className="text-xl font-bold font-heading text-primary mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-medium text-text-primary">Email Notifications</h3>
                      <p className="text-sm text-text-secondary">Receive emails about new events and announcements</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input 
                        type="checkbox" 
                        name="emailNotifications" 
                        id="emailNotifications" 
                        className="absolute block w-6 h-6 bg-white border-4 border-gray-300 rounded-full appearance-none cursor-pointer checked:right-0 checked:border-primary peer transition-all duration-200"
                        defaultChecked
                      />
                      <label 
                        htmlFor="emailNotifications" 
                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer peer-checked:bg-primary/50"
                      ></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-medium text-text-primary">Event Reminders</h3>
                      <p className="text-sm text-text-secondary">Receive reminders about upcoming events</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input 
                        type="checkbox" 
                        name="eventReminders" 
                        id="eventReminders" 
                        className="absolute block w-6 h-6 bg-white border-4 border-gray-300 rounded-full appearance-none cursor-pointer checked:right-0 checked:border-primary peer transition-all duration-200"
                        defaultChecked
                      />
                      <label 
                        htmlFor="eventReminders" 
                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer peer-checked:bg-primary/50"
                      ></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-medium text-text-primary">Document Updates</h3>
                      <p className="text-sm text-text-secondary">Notifications about new documents and updates</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input 
                        type="checkbox" 
                        name="documentUpdates" 
                        id="documentUpdates" 
                        className="absolute block w-6 h-6 bg-white border-4 border-gray-300 rounded-full appearance-none cursor-pointer checked:right-0 checked:border-primary peer transition-all duration-200"
                      />
                      <label 
                        htmlFor="documentUpdates" 
                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer peer-checked:bg-primary/50"
                      ></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-base font-medium text-text-primary">Community Announcements</h3>
                      <p className="text-sm text-text-secondary">Notifications about important community announcements</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input 
                        type="checkbox" 
                        name="communityAnnouncements" 
                        id="communityAnnouncements" 
                        className="absolute block w-6 h-6 bg-white border-4 border-gray-300 rounded-full appearance-none cursor-pointer checked:right-0 checked:border-primary peer transition-all duration-200"
                        defaultChecked
                      />
                      <label 
                        htmlFor="communityAnnouncements" 
                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer peer-checked:bg-primary/50"
                      ></label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Save Preferences
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 