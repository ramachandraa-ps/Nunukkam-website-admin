import api from './api';
import {
  ApiResponse,
  AssessmentDeadlineResponse,
  AssessmentDeadlinesListResponse,
  BulkDeadlineResponse,
  DeadlinesByBatchResponse,
  DeleteResponse,
  CreateAssessmentDeadlineRequest,
  BulkCreateDeadlinesRequest,
  UpdateAssessmentDeadlineRequest,
} from '../types/course';

interface GetDeadlinesParams {
  page?: number;
  limit?: number;
  batchId?: string;
  assessmentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const DEADLINE_ENDPOINTS = {
  DEADLINES: '/api/assessment-deadlines',
  DEADLINE_BY_ID: (id: string) => `/api/assessment-deadlines/${id}`,
  BULK_CREATE: '/api/assessment-deadlines/bulk',
  BY_BATCH: (batchId: string) => `/api/assessment-deadlines/batch/${batchId}`,
};

export const assessmentDeadlineService = {
  /**
   * Create a new assessment deadline
   * POST /api/assessment-deadlines
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  createDeadline: async (data: CreateAssessmentDeadlineRequest): Promise<ApiResponse<AssessmentDeadlineResponse>> => {
    const response = await api.post<ApiResponse<AssessmentDeadlineResponse>>(
      DEADLINE_ENDPOINTS.DEADLINES,
      data
    );
    return response.data;
  },

  /**
   * Bulk create assessment deadlines
   * POST /api/assessment-deadlines/bulk
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  bulkCreateDeadlines: async (data: BulkCreateDeadlinesRequest): Promise<ApiResponse<BulkDeadlineResponse>> => {
    const response = await api.post<ApiResponse<BulkDeadlineResponse>>(
      DEADLINE_ENDPOINTS.BULK_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get all assessment deadlines with optional filtering
   * GET /api/assessment-deadlines
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getDeadlines: async (params?: GetDeadlinesParams): Promise<ApiResponse<AssessmentDeadlinesListResponse>> => {
    const response = await api.get<ApiResponse<AssessmentDeadlinesListResponse>>(
      DEADLINE_ENDPOINTS.DEADLINES,
      { params }
    );
    return response.data;
  },

  /**
   * Get deadline by ID
   * GET /api/assessment-deadlines/:id
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getDeadlineById: async (id: string): Promise<ApiResponse<AssessmentDeadlineResponse>> => {
    const response = await api.get<ApiResponse<AssessmentDeadlineResponse>>(
      DEADLINE_ENDPOINTS.DEADLINE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update assessment deadline
   * PUT /api/assessment-deadlines/:id
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  updateDeadline: async (id: string, data: UpdateAssessmentDeadlineRequest): Promise<ApiResponse<AssessmentDeadlineResponse>> => {
    const response = await api.put<ApiResponse<AssessmentDeadlineResponse>>(
      DEADLINE_ENDPOINTS.DEADLINE_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete assessment deadline
   * DELETE /api/assessment-deadlines/:id
   * Access: ADMIN
   */
  deleteDeadline: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      DEADLINE_ENDPOINTS.DEADLINE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Get deadlines by batch
   * GET /api/assessment-deadlines/batch/:batchId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getDeadlinesByBatch: async (batchId: string): Promise<ApiResponse<DeadlinesByBatchResponse>> => {
    const response = await api.get<ApiResponse<DeadlinesByBatchResponse>>(
      DEADLINE_ENDPOINTS.BY_BATCH(batchId)
    );
    return response.data;
  },
};

export default assessmentDeadlineService;
