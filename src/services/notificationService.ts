import api from './api';
import {
  ApiResponse,
  Notification,
  CreateNotificationRequest,
  BulkCreateNotificationRequest,
  BulkNotificationResponse,
} from '../types/reports';

const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: '/api/notifications',
  BULK: '/api/notifications/bulk',
};

export const notificationService = {
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
};

export default notificationService;
