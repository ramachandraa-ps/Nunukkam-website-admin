import api from './api';
import {
  ApiResponse,
  CreateSessionRequest,
  BulkCreateSessionsRequest,
  UpdateSessionRequest,
  SessionResponse,
  SessionsListResponse,
  BulkSessionResponse,
  SessionCalendarResponse,
  DeleteResponse,
} from '../types/college';

interface GetSessionsParams {
  page?: number;
  limit?: number;
  batchId?: string;
  chapterId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SESSION_ENDPOINTS = {
  SESSIONS: '/api/sessions',
  SESSION_BY_ID: (id: string) => `/api/sessions/${id}`,
  BULK_CREATE: '/api/sessions/bulk',
  CALENDAR: (batchId: string) => `/api/sessions/calendar/${batchId}`,
};

export const sessionService = {
  /**
   * Create a new session
   * POST /api/sessions
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  createSession: async (data: CreateSessionRequest): Promise<ApiResponse<SessionResponse>> => {
    const response = await api.post<ApiResponse<SessionResponse>>(
      SESSION_ENDPOINTS.SESSIONS,
      data
    );
    return response.data;
  },

  /**
   * Bulk create sessions
   * POST /api/sessions/bulk
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  bulkCreateSessions: async (data: BulkCreateSessionsRequest): Promise<ApiResponse<BulkSessionResponse>> => {
    const response = await api.post<ApiResponse<BulkSessionResponse>>(
      SESSION_ENDPOINTS.BULK_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get all sessions with optional filtering
   * GET /api/sessions
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getSessions: async (params?: GetSessionsParams): Promise<ApiResponse<SessionsListResponse>> => {
    const response = await api.get<ApiResponse<SessionsListResponse>>(
      SESSION_ENDPOINTS.SESSIONS,
      { params }
    );
    return response.data;
  },

  /**
   * Get session by ID
   * GET /api/sessions/:id
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getSessionById: async (id: string): Promise<ApiResponse<SessionResponse>> => {
    const response = await api.get<ApiResponse<SessionResponse>>(
      SESSION_ENDPOINTS.SESSION_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Get calendar view for a batch
   * GET /api/sessions/calendar/:batchId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getSessionCalendar: async (batchId: string): Promise<ApiResponse<SessionCalendarResponse>> => {
    const response = await api.get<ApiResponse<SessionCalendarResponse>>(
      SESSION_ENDPOINTS.CALENDAR(batchId)
    );
    return response.data;
  },

  /**
   * Update session
   * PUT /api/sessions/:id
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  updateSession: async (id: string, data: UpdateSessionRequest): Promise<ApiResponse<SessionResponse>> => {
    const response = await api.put<ApiResponse<SessionResponse>>(
      SESSION_ENDPOINTS.SESSION_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete session
   * DELETE /api/sessions/:id
   * Access: ADMIN
   */
  deleteSession: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      SESSION_ENDPOINTS.SESSION_BY_ID(id)
    );
    return response.data;
  },
};

export default sessionService;
