import api from './api';
import {
  ApiResponse,
  AssessmentResponse,
  AssessmentsListResponse,
  DeleteResponse,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  AssessmentKind,
} from '../types/course';

interface GetAssessmentsParams {
  page?: number;
  limit?: number;
  chapterId?: string;
  kind?: AssessmentKind;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const ASSESSMENT_ENDPOINTS = {
  ASSESSMENTS: '/api/assessments',
  ASSESSMENT_BY_ID: (id: string) => `/api/assessments/${id}`,
};

export const assessmentService = {
  /**
   * Create a new assessment
   * POST /api/assessments
   * Access: ADMIN
   */
  createAssessment: async (data: CreateAssessmentRequest): Promise<ApiResponse<AssessmentResponse>> => {
    const response = await api.post<ApiResponse<AssessmentResponse>>(
      ASSESSMENT_ENDPOINTS.ASSESSMENTS,
      data
    );
    return response.data;
  },

  /**
   * Get all assessments with optional filtering
   * GET /api/assessments
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getAssessments: async (params?: GetAssessmentsParams): Promise<ApiResponse<AssessmentsListResponse>> => {
    const response = await api.get<ApiResponse<AssessmentsListResponse>>(
      ASSESSMENT_ENDPOINTS.ASSESSMENTS,
      { params }
    );
    return response.data;
  },

  /**
   * Get assessment by ID with full details
   * GET /api/assessments/:id
   * Access: Public/Shared
   */
  getAssessmentById: async (id: string): Promise<ApiResponse<AssessmentResponse>> => {
    const response = await api.get<ApiResponse<AssessmentResponse>>(
      ASSESSMENT_ENDPOINTS.ASSESSMENT_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update assessment
   * PUT /api/assessments/:id
   * Access: ADMIN
   */
  updateAssessment: async (id: string, data: UpdateAssessmentRequest): Promise<ApiResponse<AssessmentResponse>> => {
    const response = await api.put<ApiResponse<AssessmentResponse>>(
      ASSESSMENT_ENDPOINTS.ASSESSMENT_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete assessment
   * DELETE /api/assessments/:id
   * Access: ADMIN
   */
  deleteAssessment: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      ASSESSMENT_ENDPOINTS.ASSESSMENT_BY_ID(id)
    );
    return response.data;
  },
};

export default assessmentService;
