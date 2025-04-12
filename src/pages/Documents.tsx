import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileIcon, Download, Search, FileText, User, Calendar, Filter, Loader2, PlusCircle, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';

// Document Interface
interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
}

const CATEGORIES = [
  'All Documents',
  'Forms & Applications',
  'Rules & Regulations',
  'Meeting Minutes',
  'Financial Reports',
  'Community Guidelines',
  'Newsletters'
];

export default function Documents() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/documents', {
        params: { search: searchTerm, category: selectedCategory === 'All Documents' ? undefined : selectedCategory }
      });
      setDocuments(response.data.data.documents || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.response?.data?.message || 'Failed to load documents');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter documents based on search and category
  useEffect(() => {
    let filtered = documents;
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc => 
          doc.title.toLowerCase().includes(search) || 
          doc.description.toLowerCase().includes(search) ||
          doc.fileName.toLowerCase().includes(search)
      );
    }
    
    setFilteredDocuments(filtered);
  }, [documents, searchTerm]);

  // Helper function to get file icon
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'application/pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'image/jpeg':
      case 'image/png':
        return <FileIcon className="h-5 w-5 text-blue-500" />;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return <FileIcon className="h-5 w-5 text-green-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle document download
  const handleDownload = (doc: Document) => {
    window.open(doc.fileUrl, '_blank');
    toast.success(`Downloading ${doc.fileName}`);
  };

  // Connect handlers
  const handleUploadClick = () => {
    setDocumentToEdit(null);
    setShowUploadModal(true);
  };

  const handleEditClick = (doc: Document) => {
    setDocumentToEdit(doc);
    setShowUploadModal(true);
  };

  const handleDeleteClick = (docId: string) => {
    setDocumentToDelete(docId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    setIsSaving(true);
    try {
      await axios.delete(`/api/documents/${documentToDelete}`);
      toast.success('Document deleted successfully!');
      setDocuments(prev => prev.filter(d => d.id !== documentToDelete));
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (err: any) {
       console.error("Error deleting document:", err);
       toast.error(err.response?.data?.message || 'Failed to delete document.');
       setShowDeleteModal(false);
    } finally {
       setIsSaving(false);
    }
  };
  
  const handleSaveDocument = async (docData: any) => {
     setIsSaving(true);
     try {
        let response: any;
        if (documentToEdit?.id) {
           response = await axios.put<{ success: boolean; data: Document }>(`/api/documents/${documentToEdit.id}`, docData);
           setDocuments(prev => prev.map(d => d.id === documentToEdit.id ? response.data.data : d));
           toast.success(`Document details updated successfully!`);
        } else {
           response = await axios.post<{ success: boolean; data: Document }>('/api/documents', docData);
           setDocuments(prev => [response.data.data, ...prev]);
           toast.success(`Document added successfully!`);
        }
        setShowUploadModal(false);
        setDocumentToEdit(null);
     } catch (err: any) {
        console.error("Error saving document:", err);
        toast.error(err.response?.data?.message || 'Failed to save document.');
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
                <FileText className="h-7 w-7 mr-3 text-accent" /> Document Center
              </h1>
              <p className="mt-2 text-base text-gray-100">
                Access important forms, guidelines, and community resources.
              </p>
            </div>
            
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleUploadClick}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-accent text-primary rounded-lg shadow-sm hover:bg-opacity-90 transition gap-2 font-medium"
              >
                <PlusCircle size={18} />
                Upload Document
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
                placeholder="Search documents..."
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

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2 text-text-secondary">Loading documents...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center p-10 bg-white/70 backdrop-blur-sm rounded-glass border border-glass-border shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-primary/30 mb-4" />
            <h3 className="text-xl font-medium text-text-primary mb-1">No documents found</h3>
            <p className="text-text-secondary">
              {searchTerm ? 'Try adjusting your search or filter.' : 'Documents will appear here once uploaded.'}
            </p>
            {isAdmin && !searchTerm && (
              <button
                onClick={handleUploadClick}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary/80 text-white rounded-lg text-sm hover:bg-primary transition gap-2"
              >
                <PlusCircle size={16} />
                Upload First Document
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white/70 backdrop-blur-sm border border-glass-border shadow-sm rounded-glass overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Document Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                    {getFileIcon(doc.fileType)}
                  </div>
                  
                  {/* Document Details */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-medium text-text-primary truncate">{doc.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">{doc.description}</p>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary/60" />
                        {format(parseISO(doc.uploadedAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-primary/60" />
                        {doc.uploadedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileIcon className="h-3.5 w-3.5 text-primary/60" />
                        {doc.fileName}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary">
                        {doc.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition gap-2 w-full sm:w-auto"
                    >
                      <Download size={16} />
                      Download
                    </motion.button>
                    
                    {isAdmin && (
                      <div className="flex gap-2 justify-end w-full">
                        <button
                          onClick={() => handleEditClick(doc)}
                          className="p-2 rounded-lg text-primary hover:bg-primary/10 transition"
                          aria-label="Edit document"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(doc.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                          aria-label="Delete document"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Upload/Edit Modal */}
        {showUploadModal && (
          <DocumentUploadModal
            isOpen={showUploadModal}
            onClose={() => { setShowUploadModal(false); setDocumentToEdit(null); }}
            onSave={handleSaveDocument}
            document={documentToEdit}
            categories={CATEGORIES.filter(c => c !== 'All Documents')}
            isSaving={isSaving}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Document"
          message="Are you sure you want to delete this document? This action cannot be undone."
          confirmText="Delete Document"
        />
      </div>
    </div>
  );
}