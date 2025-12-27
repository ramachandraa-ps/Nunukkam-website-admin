import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import notificationService from '../../services/notificationService';
import userService from '../../services/userService';
import { Notification, NotificationType, NotificationStatus } from '../../types/reports';

interface ApiUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

const Notifications: React.FC = () => {
  const { addToast } = useStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const [sendForm, setSendForm] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'INFO' as NotificationType,
    sendToAll: false,
  });

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam: NotificationStatus | undefined =
        filter === 'unread' ? 'UNREAD' :
        filter === 'read' ? 'READ' :
        undefined;

      const typeParam: NotificationType | undefined =
        typeFilter !== 'all' ? typeFilter : undefined;

      const response = await notificationService.getNotifications({
        status: statusParam,
        type: typeParam,
        limit: 100,
      });

      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      addToast('error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [filter, typeFilter, addToast]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

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
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (isSendModalOpen && users.length === 0) {
      fetchUsers();
    }
  }, [isSendModalOpen, users.length, fetchUsers]);

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
          fetchNotifications();
          fetchUnreadCount();
        } else {
          addToast('error', 'Failed to send notifications');
        }
      } else {
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
          fetchNotifications();
          fetchUnreadCount();
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

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, status: 'READ' as NotificationStatus, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
      addToast('error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, status: 'READ' as NotificationStatus, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        addToast('success', `${response.data?.count || 0} notifications marked as read`);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      addToast('error', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        const notification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (notification?.status === 'UNREAD') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        addToast('success', 'Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      addToast('error', 'Failed to delete notification');
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return 'check_circle';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'DEADLINE':
        return 'schedule';
      case 'ASSIGNMENT':
        return 'assignment';
      case 'GRADE':
        return 'grade';
      case 'SYSTEM':
        return 'settings';
      default:
        return 'info';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'DEADLINE':
        return 'text-orange-600 bg-orange-50';
      case 'ASSIGNMENT':
        return 'text-purple-600 bg-purple-50';
      case 'GRADE':
        return 'text-indigo-600 bg-indigo-50';
      case 'SYSTEM':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
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

  // Calculate stats
  const totalCount = notifications.length;
  const successCount = notifications.filter(n => n.type === 'SUCCESS').length;
  const alertCount = notifications.filter(n => n.type === 'WARNING' || n.type === 'ERROR').length;

  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'INFO', label: 'Information' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'ERROR', label: 'Error' },
    { value: 'DEADLINE', label: 'Deadline' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'GRADE', label: 'Grade' },
    { value: 'SYSTEM', label: 'System' },
  ];

  const typeFilters: { id: NotificationType | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'notifications' },
    { id: 'SYSTEM', label: 'System', icon: 'settings' },
    { id: 'INFO', label: 'Info', icon: 'info' },
    { id: 'SUCCESS', label: 'Success', icon: 'check_circle' },
    { id: 'WARNING', label: 'Warning', icon: 'warning' },
    { id: 'ERROR', label: 'Error', icon: 'error' },
    { id: 'DEADLINE', label: 'Deadline', icon: 'schedule' },
    { id: 'ASSIGNMENT', label: 'Assignment', icon: 'assignment' },
    { id: 'GRADE', label: 'Grade', icon: 'grade' },
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
              onClick={handleMarkAllAsRead}
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{successCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alertCount}</p>
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
            {typeFilters.map(cat => (
              <button
                key={cat.id}
                onClick={() => setTypeFilter(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  typeFilter === cat.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
                {cat.id !== 'all' && (
                  <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {notifications.filter(n => n.type === cat.id).length}
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
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
                  <span className="text-gray-500">Loading notifications...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
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
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      notification.status === 'UNREAD' ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
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
                              {notification.status === 'UNREAD' && (
                                <span className="w-2 h-2 bg-primary-700 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  {getTypeIcon(notification.type)}
                                </span>
                                {notification.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {notification.status === 'UNREAD' && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-2 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <span className="material-symbols-outlined text-lg">done</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
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
