import React, { useState } from 'react';
import { ArrowRight, Image as ImageIcon, X, Heart, Share2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// TODO: Fetch actual photo highlight data (e.g., latest from gallery)
// TODO: Consider image optimization/loading states

// In a real app, this would come from an API
interface Photo {
  id: number;
  src: string;
  alt: string;
  title: string;
  category: string;
}

const PhotoHighlights: React.FC = () => {
  const [photos] = useState<Photo[]>([
    { 
      id: 1, 
      src: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=800&h=500&fit=crop', 
      alt: 'Modern apartment building exterior',
      title: 'Eastern Green Homes - Building A',
      category: 'Facilities'
    },
    { 
      id: 2, 
      src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&h=500&fit=crop', 
      alt: 'Community gathering space with seating',
      title: 'Community Lounge',
      category: 'Community Areas'
    },
    { 
      id: 3, 
      src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&h=500&fit=crop', 
      alt: 'Well-maintained community garden plot',
      title: 'Rooftop Garden',
      category: 'Nature'
    },
    { 
      id: 4, 
      src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&h=500&fit=crop', 
      alt: 'Swimming pool area with lounge chairs',
      title: 'Swimming Pool',
      category: 'Sports & Recreation'
    },
    { 
      id: 5, 
      src: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=800&h=500&fit=crop', 
      alt: 'Modern home interior with large windows',
      title: 'Model Apartment',
      category: 'Facilities'
    },
    { 
      id: 6, 
      src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&h=500&fit=crop', 
      alt: 'Residents enjoying a community event',
      title: 'Summer Barbecue',
      category: 'Community Events'
    },
  ]);
  
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  // Open photo in modal view
  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };
  
  // Close photo modal
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  // Category colors mapping
  const getCategoryColor = (category: string): string => {
    const categories: Record<string, string> = {
      'Facilities': 'bg-blue-500',
      'Community Areas': 'bg-purple-500',
      'Nature': 'bg-green-500',
      'Sports & Recreation': 'bg-orange-500',
      'Community Events': 'bg-pink-500'
    };
    
    return categories[category] || 'bg-gray-500';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-screen-xl">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <span className="inline-block py-1.5 px-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full mb-3">PHOTO GALLERY</span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Community Highlights
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
            Explore the beauty and community spirit of Eastern Green Homes
          </p>
        </motion.div>
      </div>

      {/* Masonry Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`relative rounded-xl overflow-hidden shadow-lg ${
              // Make first photo larger on larger screens
              index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
            }`}
            onMouseEnter={() => setHoveredId(photo.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Image Container */}
            <div 
              className="relative cursor-pointer group"
              onClick={() => openPhotoModal(photo)}
            >
              {/* Image */}
              <div className={`aspect-${index === 0 ? 'video' : 'square'} overflow-hidden`}>
                <img 
                  src={photo.src} 
                  alt={photo.alt} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(photo.category)} bg-opacity-80`}>
                      {photo.category}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors">
                        <Heart size={16} />
                      </button>
                      <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-1">{photo.title}</h3>
                  <p className="text-sm text-white/80">{photo.alt}</p>
                </div>
              </div>
            </div>

            {/* Always visible category tag */}
            <div className="absolute top-3 left-3 z-10">
              <span className={`px-2 py-1 text-xs font-medium rounded-md text-white ${getCategoryColor(photo.category)} shadow-md`}>
                {photo.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

    
      
      {/* Photo Modal with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={closePhotoModal}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closePhotoModal}
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col md:flex-row h-full">
                {/* Image */}
                <div className="flex-grow bg-black flex items-center justify-center">
                  <img 
                    src={selectedPhoto.src} 
                    alt={selectedPhoto.title}
                    className="max-h-[60vh] md:max-h-[80vh] w-auto object-contain"
                  />
                </div>
                
                {/* Image Details Panel */}
                <div className="w-full md:w-80 bg-white p-6 flex flex-col">
                  {/* Title and Category */}
                  <div className="mb-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded-md ${getCategoryColor(selectedPhoto.category)} mb-3`}>
                      {selectedPhoto.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPhoto.title}</h3>
                    <p className="text-gray-600 mt-1">{selectedPhoto.alt}</p>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center">
                    {/* Action buttons */}
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Heart size={18} className="text-gray-700" />
                      </button>
                      <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Share2 size={18} className="text-gray-700" />
                      </button>
                    </div>
                    
                    <Link 
                      to="/gallery" 
                      className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      View in Gallery
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoHighlights;