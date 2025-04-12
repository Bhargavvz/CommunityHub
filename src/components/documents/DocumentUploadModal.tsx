import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, Loader2, File, Link as LinkIcon, Upload, UploadCloud } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';

// Define Document type if not imported
interface Document {
  id: string;
  title: string;
  description?: string;
  category: string;
  fileUrl: string; // Expect URL from the form now
  createdAt?: string;
  updatedAt?: string;
  // Potentially remove backend-generated fields if not needed in form
  // fileName?: string;
  // fileType?: string;
  // fileSize?: number;
}

// Form data now includes URL input
type DocumentFormData = Pick<Document, 'title' | 'description' | 'category' | 'fileUrl'>;

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave now expects DocumentFormData (plain object)
  onSave: (docData: DocumentFormData) => Promise<void>; 
  document: Partial<Document> | null; 
  isSaving?: boolean;
  categories: string[];
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  document,
  isSaving = false,
  categories = [],
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DocumentFormData>();
  const isEditMode = !!document?.id;
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const watchedFileUrl = watch("fileUrl");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && document) {
        reset({
          title: document.title || '',
          description: document.description || '',
          category: document.category || '',
          fileUrl: document.fileUrl || '' // Pre-fill URL if editing
        });
        setUploadMethod('url');
      } else {
        reset({ // Default values for create mode
          title: '',
          description: '',
          category: categories[0] || '',
          fileUrl: ''
        });
        setUploadMethod('url');
      }
    }
  }, [isOpen, document, isEditMode, reset, categories]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid document file (PDF, DOC, DOCX, TXT)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Simulate file upload to get a URL
    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is where you'd normally upload the file and get back a URL
      const uploadedUrl = `https://example.com/documents/${file.name}`;
      setValue('fileUrl', uploadedUrl);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit handler sends the plain data object
  const onSubmit: SubmitHandler<DocumentFormData> = async (data) => {
    if (uploadMethod === 'url' && !data.fileUrl.match(/^(https?):\/\/.*/i)) {
      toast.error("Please enter a valid document URL (http:// or https://)");
      return;
    }
    
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
             <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
               as={Fragment}
               enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
               leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                 <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                  {isEditMode ? 'Edit Document' : 'Add New Document'}
                </Dialog.Title>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close Modal"><X size={20} /></button>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  {/* Upload Method Toggle */}
                  <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-sm font-medium focus:outline-none ${
                        uploadMethod === 'url' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setUploadMethod('url')}
                    >
                      <div className="flex items-center justify-center">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        URL
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-sm font-medium focus:outline-none ${
                        uploadMethod === 'file' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setUploadMethod('file')}
                    >
                      <div className="flex items-center justify-center">
                        <Upload className="h-4 w-4 mr-2" />
                        File Upload
                      </div>
                    </button>
                  </div>

                  {/* Title */} 
                  <div>
                    <label htmlFor="doc-title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input 
                      id="doc-title" 
                      type="text"
                      {...register("title", { required: "Title is required" })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
                  </div>

                  {/* Description */} 
                  <div>
                    <label htmlFor="doc-description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea 
                      id="doc-description" 
                      rows={3}
                      {...register("description")}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm`}
                    />
                  </div>
                  
                   {/* Category */} 
                  <div>
                    <label htmlFor="doc-category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select 
                      id="doc-category" 
                      {...register("category", { required: "Category is required" })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.category ? 'border-red-500' : ''}`}
                    >
                       {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                    {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
                  </div>

                  {/* URL Input */}
                  {uploadMethod === 'url' && (
                    <div>
                      <label htmlFor="doc-fileUrl" className="block text-sm font-medium text-gray-700">Document URL</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input 
                          id="doc-fileUrl" 
                          type="url"
                          {...register("fileUrl", { 
                            required: "Document URL is required",
                            pattern: {
                              value: /^(https?):\/\/.*/i,
                              message: "Please enter a valid URL (http:// or https://)"
                            }
                          })}
                          className={`block w-full rounded-md border-gray-300 pl-10 focus:border-primary focus:ring-primary sm:text-sm ${errors.fileUrl ? 'border-red-500' : ''}`}
                          placeholder="https://example.com/document.pdf"
                        />
                      </div>
                      {errors.fileUrl && <p className="text-xs text-red-600 mt-1">{errors.fileUrl.message}</p>}
                    </div>
                  )}

                  {/* File Upload Input */}
                  {uploadMethod === 'file' && (
                    <div>
                      <label htmlFor="doc-file" className="block text-sm font-medium text-gray-700">Upload Document</label>
                      <input
                        type="hidden"
                        {...register("fileUrl")}
                      />
                      <div 
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="space-y-1 text-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="doc-file" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                              <span>Upload a file</span>
                              <input
                                id="doc-file"
                                name="doc-file"
                                type="file"
                                className="sr-only"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                disabled={isUploading}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                        </div>
                      </div>
                      {isUploading && (
                        <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Uploading...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save/Cancel Buttons */} 
                   <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <button type="button" disabled={isSaving || isUploading} onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={isSaving || isUploading} className="inline-flex justify-center items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSaving || isUploading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save className="mr-2" size={16} />}
                      {isEditMode ? 'Save Changes' : 'Add Document'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DocumentUploadModal; 