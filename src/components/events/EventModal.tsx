import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, MapPin, Users, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';

// Define Event type locally if not imported from types/index.ts
// Ensure this matches the structure used in Events.tsx and expected by the API
interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // Should be datetime-local compatible string (YYYY-MM-DDTHH:mm)
  endDate?: string;
  location: string;
  maxAttendees?: number;
  imageUrl?: string;
  // Add other fields if necessary (like attendees, createdBy etc. if needed in form logic)
}

// Define form input type based on Event
type EventFormData = Omit<Event, 'id' | 'attendees' | 'createdBy' | 'createdAt' | 'updatedAt'> & {
  maxAttendees?: number | string; // Allow string for input
  date: string; 
  endDate?: string;
};

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData) => Promise<void>; 
  event: Partial<Event> | null; // Event data for editing, null for creating
  isSaving?: boolean;
}

// Helper to format Date to datetime-local string
const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    // Ensure the date part has dashes and time part has colons, separated by T
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date:", date, e);
    return ''; // Return empty string on error
  }
};

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event,
  isSaving = false,
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>();
  const isEditMode = !!event?.id;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && event) {
        reset({
          ...event,
          date: formatDateForInput(event.date),
          endDate: formatDateForInput(event.endDate),
          maxAttendees: event.maxAttendees?.toString() ?? '', // Use toString()
        });
      } else {
        reset({ // Default values for create mode
          title: '',
          description: '',
          date: '',
          endDate: '',
          location: '',
          maxAttendees: '', 
          imageUrl: '',
        });
      }
    } else {
       reset(); // Clear form when closed
    }
  }, [isOpen, event, isEditMode, reset]);

  const onSubmit: SubmitHandler<EventFormData> = async (data: EventFormData) => {
    const saveData = {
      ...data,
      maxAttendees: data.maxAttendees === '' ? undefined : parseInt(data.maxAttendees as string, 10),
      endDate: data.endDate ? data.endDate : undefined, 
    };
    
    if (saveData.endDate && saveData.date && new Date(saveData.endDate) < new Date(saveData.date)) {
        toast.error('End date cannot be before start date.');
        return;
    }

    try {
      await onSave(saveData);
    } catch (error) {
      console.error("Error in modal save onSubmit:", error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
             <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
               as={Fragment}
               enter="ease-out duration-300"
               enterFrom="opacity-0 scale-95"
               enterTo="opacity-100 scale-100"
               leave="ease-in duration-200"
               leaveFrom="opacity-100 scale-100"
               leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                 <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                  {isEditMode ? 'Edit Event' : 'Create New Event'}
                </Dialog.Title>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close Modal"><X size={20} /></button>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input 
                      id="title" 
                      type="text"
                      {...register("title", { required: "Title is required" })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea 
                      id="description" 
                      rows={3}
                      {...register("description", { required: "Description is required" })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.description ? 'border-red-500' : ''}`}
                    />
                     {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
                  </div>

                   {/* Date */} 
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                    <input 
                      id="date" 
                      type="datetime-local"
                      {...register("date", { required: "Start date and time are required" })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.date ? 'border-red-500' : ''}`}
                    />
                    {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
                  </div>
                  
                   {/* End Date (Optional) */} 
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date & Time (Optional)</label>
                    <input 
                      id="endDate" 
                      type="datetime-local"
                      {...register("endDate")}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm`}
                    />
                  </div>

                   {/* Location */} 
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input 
                      id="location" 
                      type="text"
                      {...register("location", { required: "Location is required" })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.location ? 'border-red-500' : ''}`}
                    />
                     {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location.message}</p>}
                  </div>

                  {/* Max Attendees (Optional) */} 
                  <div>
                    <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">Max Attendees (Optional)</label>
                    <input 
                      id="maxAttendees" 
                      type="number"
                      min="0"
                      {...register("maxAttendees", { 
                          min: { value: 0, message: "Must be 0 or more"},
                          validate: (value: string | number | undefined) => 
                                      value === '' || value === undefined || 
                                      !isNaN(parseInt(value as string, 10)) || 
                                      "Must be a valid number"
                       })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.maxAttendees ? 'border-red-500' : ''}`}
                      placeholder="Leave blank for unlimited"
                    />
                     {errors.maxAttendees && <p className="text-xs text-red-600 mt-1">{errors.maxAttendees.message}</p>}
                  </div>
                  
                  {/* Image URL (Optional) */} 
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                    <input 
                      id="imageUrl" 
                      type="url"
                      {...register("imageUrl", {
                          pattern: {
                              value: /^(https?):\/\/.*$/i,
                              message: "Please enter a valid URL (http:// or https://)"
                          }
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.imageUrl ? 'border-red-500' : ''}`}
                      placeholder="https://example.com/image.jpg"
                    />
                     {errors.imageUrl && <p className="text-xs text-red-600 mt-1">{errors.imageUrl.message}</p>}
                  </div>

                  {/* Save/Cancel Buttons */} 
                   <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <button
                      type="button"
                      disabled={isSaving}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex justify-center items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save className="mr-2" size={16} />}
                      {isEditMode ? 'Save Changes' : 'Create Event'}
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

export default EventModal; 