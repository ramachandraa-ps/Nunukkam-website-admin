import api from './api';
import { ApiResponse } from '../types/user';

export interface Designation {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface DesignationsResponse {
  designations: Designation[];
}

export interface DesignationResponse {
  designation: Designation;
}

const DESIGNATION_ENDPOINTS = {
  DESIGNATIONS: '/api/designations',
  DESIGNATION_BY_ID: (id: string) => `/api/designations/${id}`,
};

export const designationService = {
  /**
   * Create a new designation
   * POST /api/designations
   * Access: ADMIN
   */
  createDesignation: async (data: { title: string; description?: string }): Promise<ApiResponse<DesignationResponse>> => {
    const response = await api.post<ApiResponse<DesignationResponse>>(
      DESIGNATION_ENDPOINTS.DESIGNATIONS,
      data
    );
    return response.data;
  },

  /**
   * Get all designations
   * GET /api/designations
   * Access: All authenticated users
   */
  getDesignations: async (): Promise<ApiResponse<DesignationsResponse>> => {
    const response = await api.get<ApiResponse<DesignationsResponse>>(
      DESIGNATION_ENDPOINTS.DESIGNATIONS
    );
    return response.data;
  },

  /**
   * Get designation by ID
   * GET /api/designations/:id
   * Access: All authenticated users
   */
  getDesignationById: async (id: string): Promise<ApiResponse<DesignationResponse>> => {
    const response = await api.get<ApiResponse<DesignationResponse>>(
      DESIGNATION_ENDPOINTS.DESIGNATION_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update designation
   * PUT /api/designations/:id
   * Access: ADMIN
   */
  updateDesignation: async (id: string, data: { title?: string; description?: string }): Promise<ApiResponse<DesignationResponse>> => {
    const response = await api.put<ApiResponse<DesignationResponse>>(
      DESIGNATION_ENDPOINTS.DESIGNATION_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete designation
   * DELETE /api/designations/:id
   * Access: ADMIN
   * Note: Cannot delete designations that are mapped to users
   */
  deleteDesignation: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      DESIGNATION_ENDPOINTS.DESIGNATION_BY_ID(id)
    );
    return response.data;
  },
};

export default designationService;
