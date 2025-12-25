import api from './api';
import {
  ApiResponse,
  PendingSubmissionsResponse,
  GradeAnswerResponse,
  BulkGradeResponse,
  FinalizeGradingResponse,
  GradingStatsResponse,
  GradeAnswerRequest,
  BulkGradeRequest,
  ApiAnswer,
} from '../types/course';

interface GetPendingParams {
  assessmentId?: string;
  page?: number;
  limit?: number;
}

const GRADING_ENDPOINTS = {
  PENDING: '/api/grading/pending',
  GRADE_ANSWER: (answerId: string) => `/api/grading/answer/${answerId}`,
  BULK_GRADE: '/api/grading/bulk',
  FINALIZE: (submissionId: string) => `/api/grading/submission/${submissionId}/finalize`,
  STATS: (assessmentId: string) => `/api/grading/stats/${assessmentId}`,
};

export const gradingService = {
  /**
   * Get pending submissions for grading
   * GET /api/grading/pending
   * Access: ADMIN, TRAINER
   */
  getPendingSubmissions: async (params?: GetPendingParams): Promise<ApiResponse<PendingSubmissionsResponse>> => {
    const response = await api.get<ApiResponse<PendingSubmissionsResponse>>(
      GRADING_ENDPOINTS.PENDING,
      { params }
    );
    return response.data;
  },

  /**
   * Grade individual answer
   * PUT /api/grading/answer/:answerId
   * Access: ADMIN, TRAINER
   */
  gradeAnswer: async (answerId: string, data: GradeAnswerRequest): Promise<ApiResponse<{ answer: ApiAnswer }>> => {
    const response = await api.put<ApiResponse<{ answer: ApiAnswer }>>(
      GRADING_ENDPOINTS.GRADE_ANSWER(answerId),
      data
    );
    return response.data;
  },

  /**
   * Grade multiple answers at once
   * POST /api/grading/bulk
   * Access: ADMIN, TRAINER
   */
  bulkGradeAnswers: async (data: BulkGradeRequest): Promise<ApiResponse<BulkGradeResponse>> => {
    const response = await api.post<ApiResponse<BulkGradeResponse>>(
      GRADING_ENDPOINTS.BULK_GRADE,
      data
    );
    return response.data;
  },

  /**
   * Finalize grading for a submission
   * POST /api/grading/submission/:submissionId/finalize
   * Access: ADMIN, TRAINER
   */
  finalizeGrading: async (submissionId: string): Promise<ApiResponse<FinalizeGradingResponse>> => {
    const response = await api.post<ApiResponse<FinalizeGradingResponse>>(
      GRADING_ENDPOINTS.FINALIZE(submissionId)
    );
    return response.data;
  },

  /**
   * Get grading statistics for an assessment
   * GET /api/grading/stats/:assessmentId
   * Access: ADMIN, TRAINER
   */
  getGradingStats: async (assessmentId: string): Promise<ApiResponse<GradingStatsResponse>> => {
    const response = await api.get<ApiResponse<GradingStatsResponse>>(
      GRADING_ENDPOINTS.STATS(assessmentId)
    );
    return response.data;
  },
};

export default gradingService;
