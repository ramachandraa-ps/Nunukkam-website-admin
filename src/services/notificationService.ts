import api from './api';
import {
  ApiResponse,
  Notification,
  NotificationStatus,
  NotificationType,
  CreateNotificationRequest,
  BulkCreateNotificationRequest,
  BulkNotificationResponse,
} from '../types/reports';

const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: '/api/notifications',
  BULK: '/api/notifications/bulk',
  MARK_ALL_READ: '/api/notifications/mark-all-read',
  UNREAD_COUNT: '/api/notifications/unread-count',
  ARCHIVED: '/api/notifications/archived',
};

export interface NotificationsListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  count: number;
}

export const notificationService = {
  /**
   * Get my notifications
   * GET /api/notifications
   * Access: Authenticated users
   */
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    status?: NotificationStatus;
    type?: NotificationType;
  }): Promise<ApiResponse<NotificationsListResponse>> => {
    const response = await api.get<ApiResponse<NotificationsListResponse>>(
      NOTIFICATION_ENDPOINTS.NOTIFICATIONS,
      { params }
    );
    return response.data;
  },

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   * Access: Authenticated users
   */
  getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
    const response = await api.get<ApiResponse<UnreadCountResponse>>(
      NOTIFICATION_ENDPOINTS.UNREAD_COUNT
    );
    return response.data;
  },

  /**
   * Create a notification
   * POST /api/notifications
   * Access: ADMIN
   */
  createNotification: async (data: CreateNotificationRequest): Promise<ApiResponse<{ notification: Notification }>> => {
    const response = await api.post<ApiResponse<{ notification: Notification }>>(
      NOTIFICATION_ENDPOINTS.NOTIFICATIONS,
      data
    );
    return response.data;
  },

  /**
   * Bulk create notifications
   * POST /api/notifications/bulk
   * Access: ADMIN
   */
  bulkCreateNotifications: async (data: BulkCreateNotificationRequest): Promise<ApiResponse<BulkNotificationResponse>> => {
    const response = await api.post<ApiResponse<BulkNotificationResponse>>(
      NOTIFICATION_ENDPOINTS.BULK,
      data
    );
    return response.data;
  },

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   * Access: Authenticated users (own notifications)
   */
  markAsRead: async (id: string): Promise<ApiResponse<{ notification: Notification }>> => {
    const response = await api.put<ApiResponse<{ notification: Notification }>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   * POST /api/notifications/mark-all-read
   * Access: Authenticated users
   */
  markAllAsRead: async (): Promise<ApiResponse<MarkAllReadResponse>> => {
    const response = await api.post<ApiResponse<MarkAllReadResponse>>(
      NOTIFICATION_ENDPOINTS.MARK_ALL_READ
    );
    return response.data;
  },

  /**
   * Archive notification
   * PUT /api/notifications/:id/archive
   * Access: Authenticated users (own notifications)
   */
  archiveNotification: async (id: string): Promise<ApiResponse<{ notification: Notification }>> => {
    const response = await api.put<ApiResponse<{ notification: Notification }>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}/archive`
    );
    return response.data;
  },

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   * Access: Authenticated users (own notifications)
   */
  deleteNotification: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}`
    );
    return response.data;
  },

  /**
   * Delete all archived notifications
   * DELETE /api/notifications/archived
   * Access: Authenticated users
   */
  deleteArchivedNotifications: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.delete<ApiResponse<{ count: number }>>(
      NOTIFICATION_ENDPOINTS.ARCHIVED
    );
    return response.data;
  },
};

export default notificationService;
