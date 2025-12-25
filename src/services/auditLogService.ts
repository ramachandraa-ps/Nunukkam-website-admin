import api from './api';
import {
  ApiResponse,
  AuditLog,
  AuditLogsListResponse,
  AuditSummaryData,
  CleanupResponse,
} from '../types/reports';

interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  entity?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

interface GetUserAuditLogsParams {
  page?: number;
  limit?: number;
}

interface CleanupRequest {
  olderThanDays: number;
}

const AUDIT_ENDPOINTS = {
  LOGS: '/api/audit-logs',
  SUMMARY: '/api/audit-logs/summary',
  ENTITIES: '/api/audit-logs/entities',
  ACTIONS: '/api/audit-logs/actions',
  ENTITY_TRAIL: (entity: string, entityId: string) => `/api/audit-logs/entity/${entity}/${entityId}`,
  USER_TRAIL: (userId: string) => `/api/audit-logs/user/${userId}`,
  CLEANUP: '/api/audit-logs/cleanup',
};

export const auditLogService = {
  /**
   * Get all audit logs with filtering and pagination
   * GET /api/audit-logs
   * Access: ADMIN
   */
  getAuditLogs: async (params?: GetAuditLogsParams): Promise<ApiResponse<AuditLogsListResponse>> => {
    const response = await api.get<ApiResponse<AuditLogsListResponse>>(
      AUDIT_ENDPOINTS.LOGS,
      { params }
    );
    return response.data;
  },

  /**
   * Get audit summary statistics
   * GET /api/audit-logs/summary
   * Access: ADMIN
   */
  getAuditSummary: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<AuditSummaryData>> => {
    const response = await api.get<ApiResponse<AuditSummaryData>>(
      AUDIT_ENDPOINTS.SUMMARY,
      { params }
    );
    return response.data;
  },

  /**
   * Get distinct entities
   * GET /api/audit-logs/entities
   * Access: ADMIN
   */
  getDistinctEntities: async (): Promise<ApiResponse<{ entities: string[] }>> => {
    const response = await api.get<ApiResponse<{ entities: string[] }>>(
      AUDIT_ENDPOINTS.ENTITIES
    );
    return response.data;
  },

  /**
   * Get distinct actions
   * GET /api/audit-logs/actions
   * Access: ADMIN
   */
  getDistinctActions: async (): Promise<ApiResponse<{ actions: string[] }>> => {
    const response = await api.get<ApiResponse<{ actions: string[] }>>(
      AUDIT_ENDPOINTS.ACTIONS
    );
    return response.data;
  },

  /**
   * Get entity audit trail
   * GET /api/audit-logs/entity/:entity/:entityId
   * Access: ADMIN
   */
  getEntityAuditTrail: async (entity: string, entityId: string): Promise<ApiResponse<{ logs: AuditLog[] }>> => {
    const response = await api.get<ApiResponse<{ logs: AuditLog[] }>>(
      AUDIT_ENDPOINTS.ENTITY_TRAIL(entity, entityId)
    );
    return response.data;
  },

  /**
   * Get user audit trail
   * GET /api/audit-logs/user/:userId
   * Access: ADMIN
   */
  getUserAuditTrail: async (userId: string, params?: GetUserAuditLogsParams): Promise<ApiResponse<AuditLogsListResponse>> => {
    const response = await api.get<ApiResponse<AuditLogsListResponse>>(
      AUDIT_ENDPOINTS.USER_TRAIL(userId),
      { params }
    );
    return response.data;
  },

  /**
   * Cleanup old audit logs
   * POST /api/audit-logs/cleanup
   * Access: ADMIN
   */
  cleanupOldLogs: async (data: CleanupRequest): Promise<ApiResponse<CleanupResponse>> => {
    const response = await api.post<ApiResponse<CleanupResponse>>(
      AUDIT_ENDPOINTS.CLEANUP,
      data
    );
    return response.data;
  },
};

export default auditLogService;
