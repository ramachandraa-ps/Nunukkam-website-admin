import api from './api';
import {
  ApiResponse,
  CreateCollegeRequest,
  UpdateCollegeRequest,
  CollegeResponse,
  CollegesListResponse,
  DeleteResponse,
} from '../types/college';

const COLLEGE_ENDPOINTS = {
  COLLEGES: '/api/colleges',
  COLLEGE_BY_ID: (id: string) => `/api/colleges/${id}`,
};

export const collegeService = {
  /**
   * Create a new college
   * POST /api/colleges
   * Access: ADMIN
   */
  createCollege: async (data: CreateCollegeRequest): Promise<ApiResponse<CollegeResponse>> => {
    const response = await api.post<ApiResponse<CollegeResponse>>(
      COLLEGE_ENDPOINTS.COLLEGES,
      data
    );
    return response.data;
  },

  /**
   * Get all colleges
   * GET /api/colleges
   * Access: All authenticated users
   */
  getColleges: async (): Promise<ApiResponse<CollegesListResponse>> => {
    const response = await api.get<ApiResponse<CollegesListResponse>>(
      COLLEGE_ENDPOINTS.COLLEGES
    );
    return response.data;
  },

  /**
   * Get college by ID with batches
   * GET /api/colleges/:id
   * Access: All authenticated users
   */
  getCollegeById: async (id: string): Promise<ApiResponse<CollegeResponse>> => {
    const response = await api.get<ApiResponse<CollegeResponse>>(
      COLLEGE_ENDPOINTS.COLLEGE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update college
   * PUT /api/colleges/:id
   * Access: ADMIN
   */
  updateCollege: async (id: string, data: UpdateCollegeRequest): Promise<ApiResponse<CollegeResponse>> => {
    const response = await api.put<ApiResponse<CollegeResponse>>(
      COLLEGE_ENDPOINTS.COLLEGE_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete college
   * DELETE /api/colleges/:id
   * Access: ADMIN
   * Note: Cannot delete colleges with batches or students
   */
  deleteCollege: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      COLLEGE_ENDPOINTS.COLLEGE_BY_ID(id)
    );
    return response.data;
  },
};

export default collegeService;
