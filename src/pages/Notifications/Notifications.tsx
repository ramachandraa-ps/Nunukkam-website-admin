import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'system' | 'user' | 'course' | 'college';
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dummy notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'New User Registered',
      message: 'John Smith has been successfully added as a Trainer.',
      timestamp: '2024-01-15T10:30:00',
      read: false,
      category: 'user',
    },
    {
      id: '2',
      type: 'info',
      title: 'Course Published',
      message: 'Communication Skills course has been published and is now available.',
      timestamp: '2024-01-15T09:15:00',
      read: false,
      category: 'course',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Session Reminder',
      message: 'Upcoming session for ABC Engineering College scheduled in 2 hours.',
      timestamp: '2024-01-15T08:00:00',
      read: true,
      category: 'college',
    },
    {
      id: '4',
      type: 'error',
      title: 'Upload Failed',
      message: 'Video upload for Chapter 3 failed. Please try again.',
      timestamp: '2024-01-14T16:45:00',
      read: true,
      category: 'course',
    },
    {
      id: '5',
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur on Sunday, 2 AM - 4 AM IST.',
      timestamp: '2024-01-14T14:00:00',
      read: false,
      category: 'system',
    },
    {
      id: '6',
      type: 'success',
      title: 'College Onboarded',
      message: 'XYZ Institute of Technology has been successfully onboarded.',
      timestamp: '2024-01-14T11:30:00',
      read: true,
      category: 'college',
    },
    {
      id: '7',
      type: 'info',
      title: 'New Assessment Created',
      message: 'Quiz assessment added to Soft Skills chapter.',
      timestamp: '2024-01-13T15:20:00',
      read: true,
      category: 'course',
    },
    {
      id: '8',
      type: 'warning',
      title: 'User Deactivated',
      message: 'Sarah Johnson has been deactivated due to inactivity.',
      timestamp: '2024-01-13T10:00:00',
      read: true,
      category: 'user',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user':
        return 'person';
      case 'course':
        return 'auto_stories';
      case 'college':
        return 'school';
      default:
        return 'settings';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesReadFilter =
      filter === 'all' || (filter === 'unread' && !n.read) || (filter === 'read' && n.read);
    const matchesCategoryFilter = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesReadFilter && matchesCategoryFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const categories = [
    { id: 'all', label: 'All', icon: 'notifications' },
    { id: 'system', label: 'System', icon: 'settings' },
    { id: 'user', label: 'Users', icon: 'person' },
    { id: 'course', label: 'Courses', icon: 'auto_stories' },
    { id: 'college', label: 'Colleges', icon: 'school' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay updated with system activities and alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">done_all</span>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-700">notifications</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">mark_email_unread</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.type === 'success').length}
              </p>
              <p className="text-xs text-gray-500">Success</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">warning</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
              </p>
              <p className="text-xs text-gray-500">Alerts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2">
            <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-400">Categories</p>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
                {cat.id !== 'all' && (
                  <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {notifications.filter(n => n.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Read Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2 mt-4">
            <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-400">Status</p>
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'read', label: 'Read' },
            ].map(status => (
              <button
                key={status.id}
                onClick={() => setFilter(status.id as typeof filter)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  filter === status.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">{status.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">
                  notifications_off
                </span>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">
                  No notifications
                </h3>
                <p className="text-sm text-gray-400">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : 'No notifications match your filters'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notification.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        <span className="material-symbols-outlined">{getTypeIcon(notification.type)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary-700 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  {getCategoryIcon(notification.category)}
                                </span>
                                {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <span className="material-symbols-outlined text-lg">done</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
