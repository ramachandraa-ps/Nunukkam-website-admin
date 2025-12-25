import api from './api';
import {
  ApiResponse,
  ChapterResponse,
  ChaptersListResponse,
  DeleteResponse,
  CreateChapterRequest,
  UpdateChapterRequest,
  UploadChapterFileRequest,
  ReorderChaptersRequest,
} from '../types/course';

interface GetChaptersParams {
  page?: number;
  limit?: number;
  moduleId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const CHAPTER_ENDPOINTS = {
  CHAPTERS: '/api/chapters',
  CHAPTER_BY_ID: (id: string) => `/api/chapters/${id}`,
  UPLOAD_FILE: (id: string) => `/api/chapters/${id}/upload`,
  REORDER: (moduleId: string) => `/api/chapters/reorder/${moduleId}`,
};

export const chapterService = {
  /**
   * Create a new chapter
   * POST /api/chapters
   * Access: ADMIN
   */
  createChapter: async (data: CreateChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.post<ApiResponse<ChapterResponse>>(
      CHAPTER_ENDPOINTS.CHAPTERS,
      data
    );
    return response.data;
  },

  /**
   * Get all chapters with optional filtering
   * GET /api/chapters
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getChapters: async (params?: GetChaptersParams): Promise<ApiResponse<ChaptersListResponse>> => {
    const response = await api.get<ApiResponse<ChaptersListResponse>>(
      CHAPTER_ENDPOINTS.CHAPTERS,
      { params }
    );
    return response.data;
  },

  /**
   * Get chapter by ID with full details
   * GET /api/chapters/:id
   * Access: All authenticated users
   */
  getChapterById: async (id: string): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.get<ApiResponse<ChapterResponse>>(
      CHAPTER_ENDPOINTS.CHAPTER_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update chapter
   * PUT /api/chapters/:id
   * Access: ADMIN
   */
  updateChapter: async (id: string, data: UpdateChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.put<ApiResponse<ChapterResponse>>(
      CHAPTER_ENDPOINTS.CHAPTER_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete chapter
   * DELETE /api/chapters/:id
   * Access: ADMIN
   */
  deleteChapter: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      CHAPTER_ENDPOINTS.CHAPTER_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Upload file (PPT/Notes) to chapter
   * POST /api/chapters/:id/upload
   * Access: ADMIN
   */
  uploadFile: async (id: string, data: UploadChapterFileRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.post<ApiResponse<ChapterResponse>>(
      CHAPTER_ENDPOINTS.UPLOAD_FILE(id),
      data
    );
    return response.data;
  },

  /**
   * Reorder chapters within a module
   * POST /api/chapters/reorder/:moduleId
   * Access: ADMIN
   */
  reorderChapters: async (moduleId: string, data: ReorderChaptersRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      CHAPTER_ENDPOINTS.REORDER(moduleId),
      data
    );
    return response.data;
  },
};

export default chapterService;
