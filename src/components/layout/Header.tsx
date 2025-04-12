import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Bell, User, Home, X, LogOut, Settings, 
  AlertTriangle, Info, CheckCircle, Calendar, 
  Clock, FileEdit, Image, FileText,
  Building, Users
} from 'lucide-react';
import { Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// Define notification types
type NotificationType = 'event' | 'alert' | 'info' | 'success';

// Define the EventNotification interface
interface EventNotification {
  id: string;
  title: string;
  message: string;
  date: Date;
  type: NotificationType;
  read: boolean;
  eventId?: string;
}

// Mock EventsContext interface
interface EventsContextType {
  eventNotifications: EventNotification[];
}

// Mock useEvents hook
const useEvents = (): EventsContextType => {
  // This would normally come from a real context
  const [eventNotifications] = useState<EventNotification[]>([]);
  return { eventNotifications };
};

// Function to format date relative to now
const formatRelativeTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true });
};

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { eventNotifications } = useEvents();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle scroll to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Calculate unread notifications count
  useEffect(() => {
    if (eventNotifications) {
      setUnreadCount(eventNotifications.filter(n => !n.read).length);
    }
  }, [eventNotifications]);
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    if (eventNotifications) {
      // In a real app, we would call an API endpoint to mark notifications as read
      // For now, we're just updating the UI state
      setUnreadCount(0);
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Close other menus when opening this one
    if (!isOpen) {
      setIsUserMenuOpen(false);
      setIsNotificationsOpen(false);
    }
  };

  // Toggle user dropdown menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    // Close other menus when opening this one
    if (!isUserMenuOpen) {
      setIsNotificationsOpen(false);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    // Close other menus when opening this one
    if (!isNotificationsOpen) {
      setIsUserMenuOpen(false);
    }
    
    // Mark all as read when opening
    if (!isNotificationsOpen) {
      markAllNotificationsAsRead();
    }
  };

  // Close all menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
      setIsUserMenuOpen(false);
      setIsNotificationsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Prevent clicks inside menus from closing them
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Generate combined notifications from events and system
  useEffect(() => {
    if (eventNotifications && eventNotifications.length > 0) {
      // Get upcoming events (next 7 days)
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      
      const upcomingEvents = eventNotifications
        .filter((n) => {
          if (n.type === 'event' && n.date) {
            const eventDate = new Date(n.date);
            return eventDate >= now && eventDate <= oneWeekFromNow;
          }
          return false;
        })
        .sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
         
      // Update unread count
      setUnreadCount(eventNotifications.filter(n => !n.read).length);
    }
  }, [eventNotifications]);

  // Close menus when navigating
  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

  // Navigation links with active state
  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/events', label: 'Events', icon: <Calendar size={18} /> },
    { path: '/gallery', label: 'Gallery', icon: <Image size={18} /> },
    { path: '/documents', label: 'Documents', icon: <FileText size={18} /> },
    { path: '/directory', label: 'Directory', icon: <Users size={18} /> },
  ];

  // User menu items
  const userMenuItems = [
    { path: '/profile', label: 'Profile', icon: <User size={16} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  // Function to determine if a nav link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white shadow-md py-2' 
        : 'bg-white/90 backdrop-blur-md py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-md p-1.5">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-primary text-xl">Community</span>
                <span className="font-bold text-accent text-xl">Hub</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                  isActiveLink(link.path)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
                {isActiveLink(link.path) && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"></span>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Right side: User and notifications */}
          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-1">
                {/* Notification Button */}
                <div className="relative" onClick={handleMenuClick}>
                  <button 
                    className={`relative p-2 rounded-full focus:outline-none transition-colors ${
                      isNotificationsOpen 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                    }`}
                    onClick={toggleNotifications}
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Panel */}
                  <Transition
                    show={isNotificationsOpen}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg">
                      <div className="rounded-lg overflow-hidden bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                        {/* Header */}
                        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              className="text-xs text-primary hover:text-primary/80 font-medium focus:outline-none"
                              onClick={markAllNotificationsAsRead}
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        
                        {/* Notification List */}
                        <div className="max-h-96 overflow-y-auto">
                          {eventNotifications && eventNotifications.length > 0 ? (
                            <div>
                              {eventNotifications.map((notification) => (
                                <div 
                                  key={notification.id} 
                                  className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-primary/5' : ''}`}
                                >
                                  <div className="flex items-start">
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                      notification.type === 'event' ? 'bg-green-100 text-green-500' : 
                                      notification.type === 'alert' ? 'bg-red-100 text-red-500' : 
                                      notification.type === 'success' ? 'bg-blue-100 text-blue-500' :
                                      'bg-blue-100 text-blue-500'
                                    }`}>
                                      {notification.type === 'event' ? (
                                        <Calendar className="h-4 w-4" />
                                      ) : notification.type === 'alert' ? (
                                        <AlertTriangle className="h-4 w-4" />
                                      ) : notification.type === 'success' ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : (
                                        <Info className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="ml-3 w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {notification.title}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {notification.message}
                                      </p>
                                      <div className="mt-1">
                                        <p className="text-xs text-gray-500">
                                          {formatRelativeTime(notification.date)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <p>No new notifications</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-50 text-xs text-center">
                          <Link 
                            to="/profile" 
                            className="text-primary hover:text-primary/80 font-medium"
                            onClick={() => {
                              setIsNotificationsOpen(false);
                            }}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
                
                {/* User Menu */}
                <div className="relative ml-3" onClick={handleMenuClick}>
                  <button
                    className={`flex items-center space-x-2 px-2 py-1 rounded-full focus:outline-none transition-colors ${
                      isUserMenuOpen 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                    }`}
                    onClick={toggleUserMenu}
                    aria-label="User menu"
                  >
                    {/* User avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-white">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {currentUser?.name || 'User'}
                    </span>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  <Transition
                    show={isUserMenuOpen}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                        >
                          <span className="mr-2 text-gray-500">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      <hr className="my-1" />
                      <button
                        onClick={async () => {
                          try {
                            await logout();
                            navigate('/login');
                          } catch (error) {
                            console.error('Failed to log out', error);
                          }
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500"
                      >
                        <LogOut size={16} className="mr-2 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium px-4 py-1.5 text-primary hover:text-primary/80 border border-primary/30 hover:border-primary rounded-full transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-4 py-1.5 text-white bg-primary hover:bg-primary/90 rounded-full transition-colors"
                >
                  Join now
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-2">
              <button
                className={`p-2 rounded-full focus:outline-none transition-colors ${
                  isOpen 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
                onClick={toggleMenu}
                aria-label="Toggle main menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <Transition
        show={isOpen}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150 transform"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="md:hidden bg-white shadow-lg border-t border-gray-200 overflow-hidden" onClick={handleMenuClick}>
          <div className="px-4 pt-2 pb-3 space-y-1 divide-y divide-gray-200">
            <div className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2.5 text-base font-medium rounded-lg mb-1 ${
                    isActiveLink(link.path)
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
            
            {currentUser && (
              <div className="py-2">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-3 py-2.5 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-50 mb-1"
                  >
                    <span className="mr-3 text-gray-500">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={async () => {
                    try {
                      await logout();
                      navigate('/login');
                      setIsOpen(false);
                    } catch (error) {
                      console.error('Failed to log out', error);
                    }
                  }}
                  className="flex w-full items-center px-3 py-2.5 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-50 hover:text-red-500"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-500" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </Transition>
    </header>
  );
}