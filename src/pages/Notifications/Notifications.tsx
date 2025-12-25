import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import notificationService from '../../services/notificationService';
import userService from '../../services/userService';
import { NotificationType } from '../../types/reports';

interface LocalNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'system' | 'user' | 'course' | 'college';
}

interface ApiUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

const Notifications: React.FC = () => {
  const { addToast } = useStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [sendForm, setSendForm] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'INFO' as NotificationType,
    sendToAll: false,
  });

  // Fetch users for the dropdown
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await userService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isSendModalOpen && users.length === 0) {
      fetchUsers();
    }
  }, [isSendModalOpen, users.length, fetchUsers]);

  // System notifications (local display)
  const [notifications, setNotifications] = useState<LocalNotification[]>([
    {
      id: '1',
      type: 'success',
      title: 'New User Registered',
      message: 'John Smith has been successfully added as a Trainer.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: 'user',
    },
    {
      id: '2',
      type: 'info',
      title: 'Course Published',
      message: 'Communication Skills course has been published and is now available.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: 'course',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Session Reminder',
      message: 'Upcoming session for ABC Engineering College scheduled in 2 hours.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: 'college',
    },
    {
      id: '4',
      type: 'error',
      title: 'Upload Failed',
      message: 'Video upload for Chapter 3 failed. Please try again.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: 'course',
    },
    {
      id: '5',
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur on Sunday, 2 AM - 4 AM IST.',
      timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: 'system',
    },
  ]);

  const handleSendNotification = async () => {
    if (!sendForm.title || !sendForm.message) {
      addToast('warning', 'Please fill in title and message');
      return;
    }

    if (!sendForm.sendToAll && !sendForm.userId) {
      addToast('warning', 'Please select a user or choose to send to all');
      return;
    }

    setIsSending(true);
    try {
      if (sendForm.sendToAll) {
        // Bulk send to all users
        const userIds = users.map(u => u.id);
        const response = await notificationService.bulkCreateNotifications({
          userIds,
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
        });

        if (response.success) {
          addToast('success', `Notification sent to ${response.data?.count || userIds.length} users`);
          setIsSendModalOpen(false);
          setSendForm({ userId: '', title: '', message: '', type: 'INFO', sendToAll: false });
        } else {
          addToast('error', 'Failed to send notifications');
        }
      } else {
        // Send to single user
        const response = await notificationService.createNotification({
          userId: sendForm.userId,
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
        });

        if (response.success) {
          addToast('success', 'Notification sent successfully');
          setIsSendModalOpen(false);
          setSendForm({ userId: '', title: '', message: '', type: 'INFO', sendToAll: false });
        } else {
          addToast('error', 'Failed to send notification');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to send notification:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

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

  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'INFO', label: 'Information' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'ERROR', label: 'Error' },
    { value: 'DEADLINE', label: 'Deadline' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'SYSTEM', label: 'System' },
  ];

  return (
    <div className="space-y-8">
      {/* Send Notification Modal */}
      <Modal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} title="Send Notification" size="md">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={sendForm.sendToAll}
                onChange={(e) => setSendForm({ ...sendForm, sendToAll: e.target.checked, userId: '' })}
                className="w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Send to all users</span>
            </label>
          </div>

          {!sendForm.sendToAll && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">
                Recipient *
              </label>
              <select
                value={sendForm.userId}
                onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white"
                disabled={isLoadingUsers}
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={sendForm.type}
              onChange={(e) => setSendForm({ ...sendForm, type: e.target.value as NotificationType })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={sendForm.title}
              onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              placeholder="Enter notification title"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">
              Message *
            </label>
            <textarea
              value={sendForm.message}
              onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
              placeholder="Enter notification message"
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-700 dark:bg-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsSendModalOpen(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSendNotification}
              disabled={isSending || !sendForm.title || !sendForm.message || (!sendForm.sendToAll && !sendForm.userId)}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay updated with system activities and send notifications to users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="px-4 py-2 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 dark:shadow-none flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            Send Notification
          </button>
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
