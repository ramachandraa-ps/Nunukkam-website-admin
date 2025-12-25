import api from './api';
import {
  ApiResponse,
  CourseResponse,
  CoursesListResponse,
  PublishCourseResponse,
  DeleteResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseStatus,
} from '../types/course';

interface GetCoursesParams {
  page?: number;
  limit?: number;
  status?: CourseStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const COURSE_ENDPOINTS = {
  COURSES: '/api/courses',
  COURSE_BY_ID: (id: string) => `/api/courses/${id}`,
  PUBLISH: (id: string) => `/api/courses/${id}/publish`,
  UNPUBLISH: (id: string) => `/api/courses/${id}/unpublish`,
  ARCHIVE: (id: string) => `/api/courses/${id}/archive`,
};

export const courseService = {
  /**
   * Create a new course
   * POST /api/courses
   * Access: ADMIN
   */
  createCourse: async (data: CreateCourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post<ApiResponse<CourseResponse>>(
      COURSE_ENDPOINTS.COURSES,
      data
    );
    return response.data;
  },

  /**
   * Get all courses with optional filtering
   * GET /api/courses
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getCourses: async (params?: GetCoursesParams): Promise<ApiResponse<CoursesListResponse>> => {
    const response = await api.get<ApiResponse<CoursesListResponse>>(
      COURSE_ENDPOINTS.COURSES,
      { params }
    );
    return response.data;
  },

  /**
   * Get course by ID with full details
   * GET /api/courses/:id
   * Access: All authenticated users
   */
  getCourseById: async (id: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.get<ApiResponse<CourseResponse>>(
      COURSE_ENDPOINTS.COURSE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update course
   * PUT /api/courses/:id
   * Access: ADMIN
   */
  updateCourse: async (id: string, data: UpdateCourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.put<ApiResponse<CourseResponse>>(
      COURSE_ENDPOINTS.COURSE_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete course
   * DELETE /api/courses/:id
   * Access: ADMIN
   */
  deleteCourse: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    const response = await api.delete<ApiResponse<DeleteResponse>>(
      COURSE_ENDPOINTS.COURSE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Publish a course (change status to PUBLISHED)
   * POST /api/courses/:id/publish
   * Access: ADMIN
   */
  publishCourse: async (id: string): Promise<ApiResponse<PublishCourseResponse>> => {
    const response = await api.post<ApiResponse<PublishCourseResponse>>(
      COURSE_ENDPOINTS.PUBLISH(id)
    );
    return response.data;
  },

  /**
   * Unpublish a course (change status back to DRAFT)
   * POST /api/courses/:id/unpublish
   * Access: ADMIN
   */
  unpublishCourse: async (id: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post<ApiResponse<CourseResponse>>(
      COURSE_ENDPOINTS.UNPUBLISH(id)
    );
    return response.data;
  },

  /**
   * Archive a course
   * POST /api/courses/:id/archive
   * Access: ADMIN
   */
  archiveCourse: async (id: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post<ApiResponse<CourseResponse>>(
      COURSE_ENDPOINTS.ARCHIVE(id)
    );
    return response.data;
  },
};

export default courseService;
