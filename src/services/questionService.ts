import api from './api';
import {
  ApiResponse,
  QuestionResponse,
  QuestionsListResponse,
  DeleteResponse,
  CreateQuestionRequest,
  BulkCreateQuestionsRequest,
  UpdateQuestionRequest,
  ReorderQuestionsRequest,
  ApiQuestion,
  QuestionType,
} from '../types/course';

interface GetQuestionsParams {
  page?: number;
  limit?: number;
  assessmentId?: string;
  questionType?: QuestionType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const QUESTION_ENDPOINTS = {
  QUESTIONS: '/api/questions',
  QUESTION_BY_ID: (id: string) => `/api/questions/${id}`,
  BULK_CREATE: (assessmentId: string) => `/api/questions/bulk/${assessmentId}`,
  REORDER: (assessmentId: string) => `/api/questions/reorder/${assessmentId}`,
};

export const questionService = {
  /**
   * Create a new question
   * POST /api/questions
   * Access: ADMIN
   */
  createQuestion: async (data: CreateQuestionRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.post<ApiResponse<QuestionResponse>>(
      QUESTION_ENDPOINTS.QUESTIONS,
      data
    );
    return response.data;
  },

  /**
   * Bulk create questions for an assessment
   * POST /api/questions/bulk/:assessmentId
   * Access: ADMIN
   */
  bulkCreateQuestions: async (assessmentId: string, data: BulkCreateQuestionsRequest): Promise<ApiResponse<{ questions: ApiQuestion[] }>> => {
    const response = await api.post<ApiResponse<{ questions: ApiQuestion[] }>>(
      QUESTION_ENDPOINTS.BULK_CREATE(assessmentId),
      data
    );
    return response.data;
  },

  /**
   * Get all questions with optional filtering
   * GET /api/questions
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getQuestions: async (params?: GetQuestionsParams): Promise<ApiResponse<QuestionsListResponse>> => {
    const response = await api.get<ApiResponse<QuestionsListResponse>>(
      QUESTION_ENDPOINTS.QUESTIONS,
      { params }
    );
    return response.data;
  },

  /**
   * Get question by ID
   * GET /api/questions/:id
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getQuestionById: async (id: string): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.get<ApiResponse<QuestionResponse>>(
      QUESTION_ENDPOINTS.QUESTION_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update question
   * PUT /api/questions/:id
   * Access: ADMIN
   */
  updateQuestion: async (id: string, data: UpdateQuestionRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.put<ApiResponse<QuestionResponse>>(
      QUESTION_ENDPOINTS.QUESTION_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete question
   * DELETE /api/questions/:id
   * Access: ADMIN
   */
  deleteQuestion: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      QUESTION_ENDPOINTS.QUESTION_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Reorder questions within an assessment
   * POST /api/questions/reorder/:assessmentId
   * Access: ADMIN
   */
  reorderQuestions: async (assessmentId: string, data: ReorderQuestionsRequest): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.post<ApiResponse<DeleteResponse>>(
      QUESTION_ENDPOINTS.REORDER(assessmentId),
      data
    );
    return response.data;
  },
};

export default questionService;
