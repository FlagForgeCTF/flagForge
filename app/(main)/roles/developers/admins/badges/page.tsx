'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Search, Award, Users, CheckCircle, X, AlertCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import Loading from '@/components/loading';

// Type definitions
interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  totalScore: number;
  customBadges?: CustomBadge[];
}

interface CustomBadge {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  assignedAt: Date;
  assignedBy: string;
}

interface AssignedBadge {
  _id: string;
  userId: string;
  badgeId: string;
  badgeType: string;
  assignedBy: string;
  reason: string;
  isActive: boolean;
  assignedAt: Date;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeColor: string;
}

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

const AssignBadgePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [selectedBadgeTemplate, setSelectedBadgeTemplate] = useState<BadgeTemplate | null>(null);
  const [badgeTemplates, setBadgeTemplates] = useState<BadgeTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userAssignedBadges, setUserAssignedBadges] = useState<{[userId: string]: AssignedBadge[]}>({});
  const [loadingUserBadges, setLoadingUserBadges] = useState<{[userId: string]: boolean}>({});
  const [showBadgesForUser, setShowBadgesForUser] = useState<{[userId: string]: boolean}>({});
  const [removingBadge, setRemovingBadge] = useState<string>('');
  const [adminCheckLoading, setAdminCheckLoading] = useState<boolean>(true);

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
        console.log('Checking admin status for badge assignment page:', session.user.email);
        
        const response = await fetch('/api/auth/check-admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache'
        });
        
        const data = await response.json();
        console.log('Admin check response in badge assignment:', response.status, data);
        
        if (response.ok && data.isAdmin) {
          console.log('Admin access verified for badge assignment page');
          setIsAuthenticated(true);
        } else {
          console.log('Admin access denied for badge assignment page:', data.message);
          router.push('/roles/developers/admins/auth');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status in badge assignment:', error);
        router.push('/roles/developers/admins/auth');
        return;
      } finally {
        setAdminCheckLoading(false);
        setLoading(false);
      }
    };

    checkAuthAndAdmin();
  }, [session, status, router]);

  // Fetch users and badge templates
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchBadgeTemplates();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadgeTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await fetch('/api/admin/badge-templates');
      if (response.ok) {
        const data = await response.json();
        setBadgeTemplates(data.templates || []);
      } else {
        console.error('Failed to fetch badge templates');
      }
    } catch (err) {
      console.error('An error occurred while fetching badge templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchUserAssignedBadges = async (userId: string) => {
    try {
      setLoadingUserBadges(prev => ({ ...prev, [userId]: true }));
      
      const response = await fetch(`/api/admin/assign-badge?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserAssignedBadges(prev => ({
          ...prev,
          [userId]: data.assignments || []
        }));
      } else {
        console.error('Failed to fetch user assigned badges');
        setUserAssignedBadges(prev => ({
          ...prev,
          [userId]: []
        }));
      }
    } catch (err) {
      console.error('Error fetching user assigned badges:', err);
      setUserAssignedBadges(prev => ({
        ...prev,
        [userId]: []
      }));
    } finally {
      setLoadingUserBadges(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleShowUserBadges = async (userId: string) => {
    const isCurrentlyShown = showBadgesForUser[userId];
    
    if (!isCurrentlyShown) {
      // If not shown, fetch badges first
      await fetchUserAssignedBadges(userId);
    }
    
    setShowBadgesForUser(prev => ({
      ...prev,
      [userId]: !isCurrentlyShown
    }));
  };

  const assignBadge = async (userId: string, template: BadgeTemplate) => {
    try {
      setIsSubmitting(true);
      
      // Get admin info from session with fallback
      const adminEmail = session?.user?.email || 'system';
      const assignedBy = session?.user?.name || session?.user?.email?.split('@')[0] || 'admin';
      
      console.log('Assigning badge with data:', {
        userId,
        template: template.name,
        assignedBy
      });
      
      const requestBody = {
        userId: userId.trim(),
        badge: {
          name: template.name.trim(),
          description: template.description || '',
          icon: template.icon || '',
          color: template.color || '#000000',
          assignedBy: assignedBy,
          assignedAt: new Date().toISOString()
        }
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/admin/assign-badge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setSuccess(`Badge "${template.name}" assigned successfully to ${selectedUser?.name}!`);
        setShowBadgeModal(false);
        setSelectedUser(null);
        setSelectedBadgeTemplate(null);
        await fetchUsers(); // Refresh users list
        
        // Refresh assigned badges for this user if they're currently shown
        if (showBadgesForUser[userId]) {
          await fetchUserAssignedBadges(userId);
        }
      } else {
        setError(data.error || data.message || `Failed to assign badge (Status: ${response.status})`);
      }
    } catch (err) {
      setError('An error occurred while assigning the badge');
      console.error('Error assigning badge:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAssignedBadge = async (assignmentId: string, badgeName: string, userId: string) => {
    if (!confirm(`Are you sure you want to remove the "${badgeName}" badge assignment?`)) return;

    try {
      setRemovingBadge(assignmentId);
      
      const response = await fetch(`/api/admin/assign-badge?id=${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccess(`Badge assignment "${badgeName}" removed successfully!`);
        // Refresh the assigned badges for this user
        await fetchUserAssignedBadges(userId);
        await fetchUsers(); // Also refresh users list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove badge assignment');
      }
    } catch (err) {
      setError('An error occurred while removing the badge assignment');
      console.error('Error removing badge assignment:', err);
    } finally {
      setRemovingBadge('');
    }
  };

  const removeBadge = async (userId: string, badgeId: string, badgeName: string) => {
    if (!confirm(`Are you sure you want to remove the "${badgeName}" badge?`)) return;

    try {
      const response = await fetch('/api/admin/remove-badge', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, badgeId }),
      });

      if (response.ok) {
        setSuccess(`Badge "${badgeName}" removed successfully!`);
        await fetchUsers(); // Refresh users list
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to remove badge');
      }
    } catch (err) {
      setError('An error occurred while removing the badge');
      console.error('Error removing badge:', err);
    }
  };

  const handleLogout = async (): Promise<void> => {
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: false });
    router.push('/roles/developers/admins/auth');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openBadgeModal = (user: User) => {
    setSelectedUser(user);
    setShowBadgeModal(true);
    setError('');
    setSuccess('');
  };

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setSelectedUser(null);
    setSelectedBadgeTemplate(null);
  };

  const handleBadgeTemplateSelect = (template: BadgeTemplate) => {
    setSelectedBadgeTemplate(template);
  };

  const handleAssignBadge = async () => {
    if (!selectedUser || !selectedBadgeTemplate) {
      setError('Please select a badge template');
      return;
    }
    
    // Validate required data
    if (!selectedUser._id || !selectedUser._id.trim()) {
      setError('Invalid user selected');
      return;
    }
    
    if (!selectedBadgeTemplate.name || !selectedBadgeTemplate.name.trim()) {
      setError('Invalid badge template selected');
      return;
    }
    
    await assignBadge(selectedUser._id, selectedBadgeTemplate);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading while checking session or admin status
  if (status === 'loading' || loading || adminCheckLoading) {
    return <Loading />;
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated || !session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-rose-500 dark:text-rose-400 mb-2">
              Badge Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Assign badges to users and manage their badge collections
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/roles/developers/admins/badge-templates')}
              className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>Manage Templates</span>
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

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition duration-200"
              />
            </div>
            {filteredUsers.length !== users.length && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            )}
          </div>

          {/* Users List */}
          <div className="space-y-6">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user._id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {user.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                          {user.email}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">
                          Score: {user.totalScore.toLocaleString()} points
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      {/* Current Badges */}
                      {user.customBadges && user.customBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {user.customBadges.map((badge, index) => (
                            <div
                              key={index}
                              className="group relative flex-shrink-0"
                            >
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg">
                                <Image
                                  src={badge.icon}
                                  alt={badge.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null; e.currentTarget.src = '/flagforge-logo.png';
                                  }}
                                />
                              </div>
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {badge.name}
                              </div>
                              {/* Remove button */}
                              <button
                                onClick={() => removeBadge(user._id, badge._id!, badge.name)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Remove badge"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleShowUserBadges(user._id)}
                          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                          disabled={loadingUserBadges[user._id]}
                        >
                          {showBadgesForUser[user._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <span>{showBadgesForUser[user._id] ? 'Hide' : 'View'} Assignments</span>
                        </button>
                        
                        <button
                          onClick={() => openBadgeModal(user)}
                          className="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>Assign Badge</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Badges Section */}
                  {showBadgesForUser[user._id] && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Badge Assignments
                        </h4>
                        {loadingUserBadges[user._id] && (
                          <Loading/>
                        )}
                      </div>
                      
                      {userAssignedBadges[user._id] && userAssignedBadges[user._id].length > 0 ? (
                        <div className="space-y-3">
                          {userAssignedBadges[user._id].map((assignment) => (
                            <div
                              key={assignment._id}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                                  {assignment.badgeIcon ? (
                                    <Image
                                      src={assignment.badgeIcon}
                                      alt={assignment.badgeName}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null; e.currentTarget.src = '/flagforge-logo.png';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                                      <Award className="w-5 h-5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {assignment.badgeName}
                                  </h5>
                                  {assignment.badgeDescription && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {assignment.badgeDescription}
                                    </p>
                                  )}
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    <span>Assigned by: {assignment.assignedBy}</span>
                                    <span className="mx-2">•</span>
                                    <span>On: {formatDate(assignment.assignedAt)}</span>
                                  </div>
                                  {assignment.reason && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      Reason: {assignment.reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => removeAssignedBadge(assignment._id, assignment.badgeName, user._id)}
                                disabled={removingBadge === assignment._id}
                                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white p-2 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove assignment"
                              >
                                {removingBadge === assignment._id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No badge assignments found for this user
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms' : 'No users available'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Badge Assignment Modal */}
        {showBadgeModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Award className="w-8 h-8 text-rose-500 dark:text-rose-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Assign Badge
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        To: {selectedUser.name} ({selectedUser.email})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeBadgeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Badge Templates */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Select Badge Template
                  </h3>
                  {loadingTemplates ? (
                    <Loading/>
                  ) : badgeTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {badgeTemplates
                        .filter(template => template.isActive)
                        .map((template) => (
                          <button
                            key={template._id}
                            onClick={() => handleBadgeTemplateSelect(template)}
                            className={`p-4 border-2 rounded-xl text-left transition-all ${
                              selectedBadgeTemplate?._id === template._id
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                                <Image
                                  src={template.icon}
                                  alt={template.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null; e.currentTarget.src = '/flagforge-logo.png';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {template.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  Created by: {template.createdBy}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {template.description}
                            </p>
                          </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No badge templates available.
                      </p>
                      <button
                        onClick={() => router.push('/roles/developers/admins/badge-templates')}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
                      >
                        Create Badge Templates
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={closeBadgeModal}
                    disabled={isSubmitting}
                    className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignBadge}
                    disabled={isSubmitting || !selectedBadgeTemplate}
                    className="px-6 py-2 bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Assign Badge</span>
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

export default AssignBadgePage;