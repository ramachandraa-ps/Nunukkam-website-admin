import api from './api';
import {
  ApiResponse,
  CreateBatchRequest,
  UpdateBatchRequest,
  BatchResponse,
  BatchesListResponse,
  DeleteResponse,
} from '../types/college';

const BATCH_ENDPOINTS = {
  BATCHES: '/api/batches',
  BATCH_BY_ID: (id: string) => `/api/batches/${id}`,
};

export const batchService = {
  /**
   * Create a new batch
   * POST /api/batches
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  createBatch: async (data: CreateBatchRequest): Promise<ApiResponse<BatchResponse>> => {
    const response = await api.post<ApiResponse<BatchResponse>>(
      BATCH_ENDPOINTS.BATCHES,
      data
    );
    return response.data;
  },

  /**
   * Get all batches (optionally filtered by collegeId)
   * GET /api/batches
   * Access: All authenticated users
   */
  getBatches: async (collegeId?: string): Promise<ApiResponse<BatchesListResponse>> => {
    const response = await api.get<ApiResponse<BatchesListResponse>>(
      BATCH_ENDPOINTS.BATCHES,
      { params: collegeId ? { collegeId } : {} }
    );
    return response.data;
  },

  /**
   * Get batch by ID with students and sessions
   * GET /api/batches/:id
   * Access: All authenticated users
   */
  getBatchById: async (id: string): Promise<ApiResponse<BatchResponse>> => {
    const response = await api.get<ApiResponse<BatchResponse>>(
      BATCH_ENDPOINTS.BATCH_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update batch
   * PUT /api/batches/:id
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  updateBatch: async (id: string, data: UpdateBatchRequest): Promise<ApiResponse<BatchResponse>> => {
    const response = await api.put<ApiResponse<BatchResponse>>(
      BATCH_ENDPOINTS.BATCH_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete batch
   * DELETE /api/batches/:id
   * Access: ADMIN
   * Note: Cannot delete batches with students or sessions
   */
  deleteBatch: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      BATCH_ENDPOINTS.BATCH_BY_ID(id)
    );
    return response.data;
  },
};

export default batchService;
