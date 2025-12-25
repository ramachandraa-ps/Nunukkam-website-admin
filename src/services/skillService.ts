import api from './api';
import {
  ApiResponse,
  SkillResponse,
  SkillsListResponse,
  DeleteResponse,
  CreateSkillRequest,
  UpdateSkillRequest,
} from '../types/course';

const SKILL_ENDPOINTS = {
  SKILLS: '/api/skills',
  SKILL_BY_ID: (id: string) => `/api/skills/${id}`,
};

export const skillService = {
  /**
   * Create a new skill
   * POST /api/skills
   * Access: ADMIN
   */
  createSkill: async (data: CreateSkillRequest): Promise<ApiResponse<SkillResponse>> => {
    const response = await api.post<ApiResponse<SkillResponse>>(
      SKILL_ENDPOINTS.SKILLS,
      data
    );
    return response.data;
  },

  /**
   * Get all skills
   * GET /api/skills
   * Access: All authenticated users
   */
  getSkills: async (): Promise<ApiResponse<SkillsListResponse>> => {
    const response = await api.get<ApiResponse<SkillsListResponse>>(
      SKILL_ENDPOINTS.SKILLS
    );
    return response.data;
  },

  /**
   * Get skill by ID
   * GET /api/skills/:id
   * Access: All authenticated users
   */
  getSkillById: async (id: string): Promise<ApiResponse<SkillResponse>> => {
    const response = await api.get<ApiResponse<SkillResponse>>(
      SKILL_ENDPOINTS.SKILL_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update skill
   * PUT /api/skills/:id
   * Access: ADMIN
   */
  updateSkill: async (id: string, data: UpdateSkillRequest): Promise<ApiResponse<SkillResponse>> => {
    const response = await api.put<ApiResponse<SkillResponse>>(
      SKILL_ENDPOINTS.SKILL_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete skill
   * DELETE /api/skills/:id
   * Access: ADMIN
   */
  deleteSkill: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      SKILL_ENDPOINTS.SKILL_BY_ID(id)
    );
    return response.data;
  },
};

export default skillService;
