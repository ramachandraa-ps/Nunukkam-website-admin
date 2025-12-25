import api from './api';
import {
  ApiResponse,
  CoreSkillResponse,
  CoreSkillsListResponse,
  DeleteResponse,
  CreateCoreSkillRequest,
  UpdateCoreSkillRequest,
} from '../types/course';

const CORE_SKILL_ENDPOINTS = {
  CORE_SKILLS: '/api/core-skills',
  CORE_SKILL_BY_ID: (id: string) => `/api/core-skills/${id}`,
};

export const coreSkillService = {
  /**
   * Create a new core skill
   * POST /api/core-skills
   * Access: ADMIN
   */
  createCoreSkill: async (data: CreateCoreSkillRequest): Promise<ApiResponse<CoreSkillResponse>> => {
    const response = await api.post<ApiResponse<CoreSkillResponse>>(
      CORE_SKILL_ENDPOINTS.CORE_SKILLS,
      data
    );
    return response.data;
  },

  /**
   * Get all core skills
   * GET /api/core-skills
   * Access: All authenticated users
   */
  getCoreSkills: async (): Promise<ApiResponse<CoreSkillsListResponse>> => {
    const response = await api.get<ApiResponse<CoreSkillsListResponse>>(
      CORE_SKILL_ENDPOINTS.CORE_SKILLS
    );
    return response.data;
  },

  /**
   * Get core skill by ID
   * GET /api/core-skills/:id
   * Access: All authenticated users
   */
  getCoreSkillById: async (id: string): Promise<ApiResponse<CoreSkillResponse>> => {
    const response = await api.get<ApiResponse<CoreSkillResponse>>(
      CORE_SKILL_ENDPOINTS.CORE_SKILL_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update core skill
   * PUT /api/core-skills/:id
   * Access: ADMIN
   */
  updateCoreSkill: async (id: string, data: UpdateCoreSkillRequest): Promise<ApiResponse<CoreSkillResponse>> => {
    const response = await api.put<ApiResponse<CoreSkillResponse>>(
      CORE_SKILL_ENDPOINTS.CORE_SKILL_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete core skill
   * DELETE /api/core-skills/:id
   * Access: ADMIN
   */
  deleteCoreSkill: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      CORE_SKILL_ENDPOINTS.CORE_SKILL_BY_ID(id)
    );
    return response.data;
  },
};

export default coreSkillService;
