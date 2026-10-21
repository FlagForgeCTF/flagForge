'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Award, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Upload, Search, Eye, EyeOff } from 'lucide-react';
import Loading from '@/components/loading';

// Type definitions
interface BadgeTemplate {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

interface BadgeImage {
  _id: string;
  name: string;
  path: string;
  category: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Badge Image Manager Component - FIXED VERSION
const BadgeImageManager = ({ 
  onImageSelect, 
  currentImage,
  uploaderName = 'unknown'
}: { 
  onImageSelect: (imagePath: string) => void;
  currentImage?: string;
  uploaderName?: string;
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [badgeImages, setBadgeImages] = useState<BadgeImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch badge images from database
  useEffect(() => {
    fetchBadgeImages();
  }, []);

  const fetchBadgeImages = async () => {
    try {
      setLoadingImages(true);
      const response = await fetch('/api/admin/badge-images');
      if (response.ok) {
        const data = await response.json();
        setBadgeImages(data.images || []);
      } else {
        console.error('Failed to fetch badge images');
      }
    } catch (error) {
      console.error('Error fetching badge images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setUploadedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    console.log('Starting upload...', uploadedFile.name);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', uploadedFile); // Changed from 'badge-image' to 'file'
      formData.append('category', 'badge-template');
      formData.append('name', uploadedFile.name.split('.')[0]);
      formData.append('uploadedBy', uploaderName);

      console.log('Sending request to /api/admin/upload-badge-image');
      
      const response = await fetch('/api/admin/upload-badge-image', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful:', data);
        onImageSelect(data.imagePath);
        setUploadedFile(null);
        setPreviewUrl(null);
        // Refresh the images list
        await fetchBadgeImages();
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        alert(errorData.error || errorData.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;

    try {
      setDeleteLoading(imageId);
      const response = await fetch(`/api/admin/badge-images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBadgeImages();
        // If the deleted image was selected, clear the selection
        const deletedImage = badgeImages.find(img => img._id === imageId);
        if (deletedImage && currentImage === deletedImage.path) {
          onImageSelect('');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Available Images Gallery */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
          <Award className="w-4 h-4 mr-2" />
          Select from Available Images
        </h4>
        {loadingImages ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading images...</span>
          </div>
        ) : badgeImages.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            {badgeImages.map((image) => (
              <div
                key={image._id}
                className="group relative aspect-square"
              >
                <button
                  onClick={() => onImageSelect(image.path)}
                  className={`w-full h-full rounded-lg overflow-hidden border-2 transition-all ${
                    currentImage === image.path
                      ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  title={image.name}
                >
                  <Image
                    src={image.path}
                    alt={image.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null; e.currentTarget.src = '/flagforge-logo.png';
                    }}
                  />
                </button>
                <button
                  onClick={() => deleteImage(image._id)}
                  disabled={deleteLoading === image._id}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  title="Delete image"
                >
                  {deleteLoading === image._id ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No badge images available</p>
          </div>
        )}
      </div>

      {/* Upload New Image */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          Upload New Image
        </h4>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
          {previewUrl ? (
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {uploadedFile?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {uploadedFile && (uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={uploadImage}
                  disabled={uploading}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition duration-200 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={uploading}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Click to select an image file
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-200 dark:hover:file:bg-purple-800"
              />
              <p className="text-xs text-gray-400 mt-1">
                Max size: 5MB. Supported formats: JPG, PNG, GIF, SVG, WebP
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BadgeTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<BadgeTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState<boolean>(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#8B5CF6',
    isActive: true
  });

  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication and admin check
  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      if (status === 'loading') return;
      
      if (!session?.user) {
        router.push('/roles/developers/admins/auth');
        return;
      }

      try {
        setAdminCheckLoading(true);
        console.log('Checking admin status for badge templates page:', session.user.email);
        
        const response = await fetch('/api/auth/check-admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache'
        });
        
        const data = await response.json();
        console.log('Admin check response in badge templates:', response.status, data);
        
        if (response.ok && data.isAdmin) {
          console.log('Admin access verified for badge templates page');
          setIsAuthenticated(true);
        } else {
          console.log('Admin access denied for badge templates page:', data.message);
          router.push('/roles/developers/admins/auth');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status in badge templates:', error);
        router.push('/roles/developers/admins/auth');
        return;
      } finally {
        setAdminCheckLoading(false);
        setLoading(false);
      }
    };

    checkAuthAndAdmin();
  }, [session, status, router]);

  // Fetch templates
  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
    }
  }, [isAuthenticated]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/badge-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch badge templates');
      }
    } catch (err) {
      setError('An error occurred while fetching templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Badge name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Badge description is required');
      return;
    }
    
    if (!formData.icon.trim()) {
      setError('Please select or upload a badge icon');
      return;
    }

    try {
      setIsSubmitting(true);
      // Get creator info from session
      const creatorName = session?.user?.name || session?.user?.email?.split('@')[0] || 'unknown';
      
      const payload = {
        ...formData,
        createdBy: creatorName,
        ...(editingTemplate && { templateId: editingTemplate._id })
      };

      const url = editingTemplate 
        ? '/api/admin/badge-templates/update' 
        : '/api/admin/badge-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(editingTemplate 
          ? `Badge template "${formData.name}" updated successfully!` 
          : `Badge template "${formData.name}" created successfully!`
        );
        resetForm();
        await fetchTemplates();
      } else {
        const data = await response.json();
        setError(data.message || `Failed to ${editingTemplate ? 'update' : 'create'} badge template`);
      }
    } catch (err) {
      setError(`An error occurred while ${editingTemplate ? 'updating' : 'creating'} the template`);
      console.error('Error submitting template:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (template: BadgeTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      isActive: template.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete the "${templateName}" badge template? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/badge-templates/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      });

      if (response.ok) {
        setSuccess(`Badge template "${templateName}" deleted successfully!`);
        await fetchTemplates();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete badge template');
      }
    } catch (err) {
      setError('An error occurred while deleting the template');
      console.error('Error deleting template:', err);
    }
  };

  const toggleActiveStatus = async (templateId: string, currentStatus: boolean, templateName: string) => {
    try {
      const response = await fetch('/api/admin/badge-templates/toggle-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          templateId, 
          isActive: !currentStatus 
        }),
      });

      if (response.ok) {
        setSuccess(`Badge template "${templateName}" ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        await fetchTemplates();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update template status');
      }
    } catch (err) {
      setError('An error occurred while updating the template status');
      console.error('Error updating template status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#8B5CF6',
      isActive: true
    });
    setEditingTemplate(null);
    setShowModal(false);
    setError('');
  };

  const handleLogout = async (): Promise<void> => {
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: false });
    router.push('/roles/developers/admins/auth');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive || template.isActive;
    return matchesSearch && matchesStatus;
  });

  // Get uploader name for the BadgeImageManager
  const uploaderName = session?.user?.name || session?.user?.email?.split('@')[0] || 'unknown';

  // Show loading while checking session or admin status
  if (status === 'loading' || loading || adminCheckLoading) {
    return <Loading />;
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated || !session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-purple-500 dark:text-purple-400 mb-2">
              Badge Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage badge templates for recognition awards
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/roles/developers/admins/badges')}
              className="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>Assign Badges</span>
            </button>
            <button
              onClick={() => router.push('/roles/developers/admins/uploads')}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              Upload Challenge
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="flex-1">{error}</div>
            <button 
              onClick={() => setError('')}
              className="ml-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="flex-1">{success}</div>
            <button 
              onClick={() => setSuccess('')}
              className="ml-3 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Templates List */}
          <div className="xl:col-span-8">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Templates ({filteredTemplates.length})
                </h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Template</span>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition duration-200"
                  />
                </div>
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2 ${
                    showInactive
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{showInactive ? 'Show Active Only' : 'Show All'}</span>
                </button>
              </div>

              {/* Templates Grid */}
              <div className="space-y-4">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <div 
                      key={template._id} 
                      className={`border-2 rounded-xl p-6 transition duration-200 ${
                        template.isActive 
                          ? 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700' 
                          : 'border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                            <Image
                              src={template.icon}
                              alt={template.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null; e.currentTarget.src = '/flagforge-logo.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {template.name}
                              </h3>
                              {!template.isActive && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Created by: {template.createdBy}</span>
                              <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => toggleActiveStatus(template._id, template.isActive, template.name)}
                            className={`px-3 py-1 rounded-lg font-medium transition duration-200 text-sm ${
                              template.isActive
                                ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400'
                                : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400'
                            }`}
                          >
                            {template.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleEdit(template)}
                            className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg font-medium transition duration-200 flex items-center space-x-1 text-sm"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(template._id, template.name)}
                            className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-1 rounded-lg font-medium transition duration-200 flex items-center space-x-1 text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Award className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No Templates Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first badge template to get started'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200 inline-flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Template</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="xl:col-span-4">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">Total Templates</span>
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {templates.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Active Templates</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {templates.filter(t => t.isActive).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                    <span className="text-gray-700 dark:text-gray-300">Inactive Templates</span>
                  </div>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {templates.filter(t => !t.isActive).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Template Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Award className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {editingTemplate ? 'Edit Badge Template' : 'Create Badge Template'}
                    </h2>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Badge Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter badge name..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this badge represents..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Badge Color
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#8B5CF6"
                          className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 text-purple-500 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Active (available for assignment)
                        </span>
                      </label>
                    </div>

                    {/* Preview */}
                    {formData.icon && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preview
                        </label>
                        <div className="flex items-center space-x-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                            <Image
                              src={formData.icon}
                              alt="Badge preview"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null; e.currentTarget.src = '/flagforge-logo.png';
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {formData.name || 'Badge Name'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formData.description || 'Badge description...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge Image Manager */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Badge Icon *
                    </label>
                    <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <BadgeImageManager
                        onImageSelect={(imagePath) => setFormData(prev => ({ ...prev, icon: imagePath }))}
                        currentImage={formData.icon}
                        uploaderName={uploaderName}
                      />
                    </div>
                  </div>
                </form>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim() || !formData.description.trim() || !formData.icon.trim()}
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{editingTemplate ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{editingTemplate ? 'Update Template' : 'Create Template'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeTemplatesPage;