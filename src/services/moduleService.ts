import api from './api';
import {
  ApiResponse,
  ModuleResponse,
  ModulesListResponse,
  DeleteResponse,
  CreateModuleRequest,
  UpdateModuleRequest,
  ReorderModulesRequest,
} from '../types/course';

interface GetModulesParams {
  page?: number;
  limit?: number;
  coreSkillId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const MODULE_ENDPOINTS = {
  MODULES: '/api/modules',
  MODULE_BY_ID: (id: string) => `/api/modules/${id}`,
  REORDER: (coreSkillId: string) => `/api/modules/reorder/${coreSkillId}`,
};

export const moduleService = {
  /**
   * Create a new module
   * POST /api/modules
   * Access: ADMIN
   */
  createModule: async (data: CreateModuleRequest): Promise<ApiResponse<ModuleResponse>> => {
    const response = await api.post<ApiResponse<ModuleResponse>>(
      MODULE_ENDPOINTS.MODULES,
      data
    );
    return response.data;
  },

  /**
   * Get all modules with optional filtering
   * GET /api/modules
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getModules: async (params?: GetModulesParams): Promise<ApiResponse<ModulesListResponse>> => {
    const response = await api.get<ApiResponse<ModulesListResponse>>(
      MODULE_ENDPOINTS.MODULES,
      { params }
    );
    return response.data;
  },

  /**
   * Get module by ID with details
   * GET /api/modules/:id
   * Access: All authenticated users
   */
  getModuleById: async (id: string): Promise<ApiResponse<ModuleResponse>> => {
    const response = await api.get<ApiResponse<ModuleResponse>>(
      MODULE_ENDPOINTS.MODULE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update module
   * PUT /api/modules/:id
   * Access: ADMIN
   */
  updateModule: async (id: string, data: UpdateModuleRequest): Promise<ApiResponse<ModuleResponse>> => {
    const response = await api.put<ApiResponse<ModuleResponse>>(
      MODULE_ENDPOINTS.MODULE_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete module
   * DELETE /api/modules/:id
   * Access: ADMIN
   */
  deleteModule: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      MODULE_ENDPOINTS.MODULE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Reorder modules within a core skill
   * POST /api/modules/reorder/:coreSkillId
   * Access: ADMIN
   */
  reorderModules: async (coreSkillId: string, data: ReorderModulesRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      MODULE_ENDPOINTS.REORDER(coreSkillId),
      data
    );
    return response.data;
  },
};

export default moduleService;
