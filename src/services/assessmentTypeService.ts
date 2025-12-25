import api from './api';
import {
  ApiResponse,
  AssessmentTypeResponse,
  AssessmentTypesListResponse,
  DeleteResponse,
  CreateAssessmentTypeRequest,
  UpdateAssessmentTypeRequest,
} from '../types/course';

const ASSESSMENT_TYPE_ENDPOINTS = {
  ASSESSMENT_TYPES: '/api/assessment-types',
  ASSESSMENT_TYPE_BY_ID: (id: string) => `/api/assessment-types/${id}`,
};

export const assessmentTypeService = {
  /**
   * Create a new assessment type
   * POST /api/assessment-types
   * Access: ADMIN
   */
  createAssessmentType: async (data: CreateAssessmentTypeRequest): Promise<ApiResponse<AssessmentTypeResponse>> => {
    const response = await api.post<ApiResponse<AssessmentTypeResponse>>(
      ASSESSMENT_TYPE_ENDPOINTS.ASSESSMENT_TYPES,
      data
    );
    return response.data;
  },

  /**
   * Get all assessment types
   * GET /api/assessment-types
   * Access: Public/Shared
   */
  getAssessmentTypes: async (): Promise<ApiResponse<AssessmentTypesListResponse>> => {
    const response = await api.get<ApiResponse<AssessmentTypesListResponse>>(
      ASSESSMENT_TYPE_ENDPOINTS.ASSESSMENT_TYPES
    );
    return response.data;
  },

  /**
   * Get assessment type by ID
   * GET /api/assessment-types/:id
   * Access: Public/Shared
   */
  getAssessmentTypeById: async (id: string): Promise<ApiResponse<AssessmentTypeResponse>> => {
    const response = await api.get<ApiResponse<AssessmentTypeResponse>>(
      ASSESSMENT_TYPE_ENDPOINTS.ASSESSMENT_TYPE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update assessment type
   * PUT /api/assessment-types/:id
   * Access: ADMIN
   */
  updateAssessmentType: async (id: string, data: UpdateAssessmentTypeRequest): Promise<ApiResponse<AssessmentTypeResponse>> => {
    const response = await api.put<ApiResponse<AssessmentTypeResponse>>(
      ASSESSMENT_TYPE_ENDPOINTS.ASSESSMENT_TYPE_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete assessment type
   * DELETE /api/assessment-types/:id
   * Access: ADMIN
   */
  deleteAssessmentType: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      ASSESSMENT_TYPE_ENDPOINTS.ASSESSMENT_TYPE_BY_ID(id)
    );
    return response.data;
  },
};

export default assessmentTypeService;
