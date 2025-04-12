import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Search, Filter, User, Calendar, Loader2, Plus, PlusCircle, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ImageUploadModal from '../components/gallery/ImageUploadModal';

// Gallery Image Interface
interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
}

// Define ImageFormData to match type in ImageUploadModal
type ImageFormData = Pick<GalleryImage, 'title' | 'description' | 'category' | 'imageUrl'>;

const CATEGORIES = [
  'All Photos',
  'Community Events',
  'Residents',
  'Facilities',
  'Seasonal',
  'Sports & Recreation',
  'Nature',
  'Celebrations'
];

export default function Gallery() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Photos');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<GalleryImage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch images from the API
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/gallery', {
        params: { search: searchTerm, category: selectedCategory === 'All Photos' ? undefined : selectedCategory }
      });
      setImages(response.data.data.images || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching gallery images:', err);
      setError(err.response?.data?.message || 'Failed to load gallery');
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Filter images based on search and category
  useEffect(() => {
    let filtered = images;
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        img => 
          img.title.toLowerCase().includes(search) || 
          (img.description && img.description.toLowerCase().includes(search))
      );
    }
    
    setFilteredImages(filtered);
  }, [images, searchTerm]);
  
  // Open image modal
  const openImageModal = (image: GalleryImage) => {
    setSelectedImage(image);
  };
  
  // Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Connect handlers
  const handleUploadClick = () => {
    setImageToEdit(null);
    setShowUploadModal(true);
  };

  const handleEditClick = (img: GalleryImage) => {
    setImageToEdit(img);
    setShowUploadModal(true); 
  };

  const handleDeleteClick = (imgId: string) => {
    setImageToDelete(imgId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!imageToDelete) return;
    setIsSaving(true);
    try {
      await axios.delete(`/api/gallery/${imageToDelete}`);
      toast.success('Image deleted successfully!');
      setImages(prev => prev.filter(img => img.id !== imageToDelete));
      setShowDeleteModal(false);
      setImageToDelete(null);
    } catch (err: any) {
       console.error("Error deleting image:", err);
       toast.error(err.response?.data?.message || 'Failed to delete image.');
       setShowDeleteModal(false); 
    } finally {
       setIsSaving(false);
    }
  };
  
  const handleSaveImage = async (data: ImageFormData) => {
    setIsSaving(true);
    try {
      // Convert ImageFormData to FormData if needed for API
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      formData.append('imageUrl', data.imageUrl);
      
      let response: any;
      if (imageToEdit?.id) {
        response = await axios.put<{ success: boolean; data: GalleryImage }>(
          `/api/gallery/${imageToEdit.id}`, 
          data, // Use data directly if API accepts JSON
          { headers: { 'Content-Type': 'application/json' } }
        );
        setImages(prev => prev.map(img => img.id === imageToEdit.id ? response.data.data : img));
        toast.success(`Image details updated successfully!`);
      } else {
        response = await axios.post<{ success: boolean; data: GalleryImage }>(
          '/api/gallery', 
          data, // Use data directly if API accepts JSON
          { headers: { 'Content-Type': 'application/json' } }
        );
        setImages(prev => [response.data.data, ...prev]);
        toast.success(`Image uploaded successfully!`);
      }
      setShowUploadModal(false);
      setImageToEdit(null);
    } catch (err: any) {
      console.error("Error saving image:", err);
      toast.error(err.response?.data?.message || 'Failed to save image.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header with Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-primary/30 backdrop-blur-md border border-glass-border shadow-lg rounded-glass p-8 mb-10 relative overflow-hidden"
        >
          {/* Background elements for visual interest */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent/10 rounded-full blur-xl"></div>
          <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-primary/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading tracking-tight text-white flex items-center">
                <ImageIcon className="h-7 w-7 mr-3 text-accent" /> Community Gallery
              </h1>
              <p className="mt-2 text-base text-gray-100">
                Browse moments shared by Eastern Green Homes residents.
              </p>
            </div>
            
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleUploadClick}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-accent text-primary rounded-lg shadow-sm hover:bg-opacity-90 transition gap-2 font-medium"
              >
                <PlusCircle size={18} />
                Upload Photo
              </motion.button>
            )}
          </div>
        </motion.div>
        
        {/* Search & Filter Bar - Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 bg-white/70 backdrop-blur-sm p-4 rounded-glass border border-glass-border shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary/60" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-glass-border bg-white/50 backdrop-blur-sm rounded-md leading-5 text-text-primary placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-primary/60 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-glass-border bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-text-primary transition-colors"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
        
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm mb-8 p-4 rounded-glass border border-red-200 text-red-700">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-2 underline hover:text-red-800 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2 text-text-secondary">Loading gallery...</span>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center p-10 bg-white/70 backdrop-blur-sm rounded-glass border border-glass-border shadow-sm">
            <ImageIcon className="mx-auto h-12 w-12 text-primary/30 mb-4" />
            <h3 className="text-xl font-medium text-text-primary mb-1">No photos found</h3>
            <p className="text-text-secondary">
              {searchTerm ? 'Try adjusting your search or filter.' : 'Photos will appear here once uploaded.'}
            </p>
            {isAdmin && !searchTerm && (
              <button
                onClick={handleUploadClick}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary/80 text-white rounded-lg text-sm hover:bg-primary transition gap-2"
              >
                <PlusCircle size={16} />
                Upload First Photo
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filteredImages.map((image, index) => (
              <motion.div 
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative bg-white/60 backdrop-blur-sm rounded-glass overflow-hidden shadow-sm hover:shadow-md border border-glass-border transition-all cursor-pointer"
                onClick={() => openImageModal(image)}
              >
                {/* Image Thumbnail */}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                  <img 
                    src={image.thumbnailUrl || image.imageUrl} 
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                {/* Image Details */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-text-primary truncate">{image.title}</h3>
                  <div className="mt-1 flex items-center text-xs text-text-secondary">
                    <Calendar className="flex-shrink-0 h-3.5 w-3.5 mr-1.5" />
                    <span>{format(parseISO(image.uploadedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                
                {/* Admin Controls - Overlay on hover */}
                {isAdmin && (
                  <div className="absolute top-0 right-0 p-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(image); }}
                      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-primary hover:bg-white transition-colors"
                      aria-label="Edit image"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(image.id); }}
                      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white transition-colors"
                      aria-label="Delete image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Modal for Viewing Selected Image */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={closeImageModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[90vh] overflow-hidden bg-white/10 backdrop-blur-md rounded-glass border border-glass-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors rounded-full z-10"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="flex-grow overflow-hidden bg-black rounded-tl-glass rounded-bl-glass">
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.title}
                    className="w-full h-full object-contain max-h-[70vh] lg:max-h-[80vh]"
                  />
                </div>
                
                {/* Image Details Panel */}
                <div className="w-full lg:w-72 p-4 bg-white/20 backdrop-blur-md text-white overflow-y-auto max-h-[30vh] lg:max-h-[80vh]">
                  <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
                  
                  {selectedImage.description && (
                    <p className="text-sm mb-4 text-gray-100">{selectedImage.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-200">
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Uploaded by {selectedImage.uploadedBy}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{format(parseISO(selectedImage.uploadedAt), 'MMMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Filter className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{selectedImage.category}</span>
                    </div>
                  </div>
                  
                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-300 mb-1">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedImage.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-block px-2 py-0.5 text-xs bg-white/10 backdrop-blur-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isAdmin && (
                    <div className="mt-6 flex space-x-2">
                      <button
                        onClick={() => { closeImageModal(); handleEditClick(selectedImage); }}
                        className="flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white hover:bg-white/30 transition-colors"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => { closeImageModal(); handleDeleteClick(selectedImage.id); }}
                        className="flex items-center px-3 py-1.5 bg-red-500/20 backdrop-blur-sm rounded-lg text-xs text-white hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Upload/Edit Modal - Preserving functionality */}
        {showUploadModal && (
          <ImageUploadModal
            isOpen={showUploadModal}
            onClose={() => { setShowUploadModal(false); setImageToEdit(null); }}
            onSave={handleSaveImage}
            image={imageToEdit}
            categories={CATEGORIES.filter(c => c !== 'All Photos')}
            isSaving={isSaving}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Photo"
          message="Are you sure you want to delete this photo? This action cannot be undone."
          confirmText="Delete Photo"
        />
      </div>
    </div>
  );
}