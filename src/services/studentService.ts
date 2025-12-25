import api from './api';
import {
  ApiResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  BulkCreateStudentsRequest,
  GetStudentsParams,
  StudentResponse,
  StudentDetailResponse,
  StudentsListResponse,
  BulkCreateStudentsResponse,
  DeleteStudentResponse,
} from '../types/student';

const STUDENT_ENDPOINTS = {
  STUDENTS: '/api/students',
  BULK_CREATE: '/api/students/bulk',
  STUDENT_BY_ID: (id: string) => `/api/students/${id}`,
};

export const studentService = {
  /**
   * Create a new student
   * POST /api/students
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  createStudent: async (data: CreateStudentRequest): Promise<ApiResponse<StudentResponse>> => {
    const response = await api.post<ApiResponse<StudentResponse>>(
      STUDENT_ENDPOINTS.STUDENTS,
      data
    );
    return response.data;
  },

  /**
   * Bulk create students
   * POST /api/students/bulk
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  bulkCreateStudents: async (data: BulkCreateStudentsRequest): Promise<ApiResponse<BulkCreateStudentsResponse>> => {
    const response = await api.post<ApiResponse<BulkCreateStudentsResponse>>(
      STUDENT_ENDPOINTS.BULK_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get all students with filtering & pagination
   * GET /api/students
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getStudents: async (params?: GetStudentsParams): Promise<ApiResponse<StudentsListResponse>> => {
    const response = await api.get<ApiResponse<StudentsListResponse>>(
      STUDENT_ENDPOINTS.STUDENTS,
      { params }
    );
    return response.data;
  },

  /**
   * Get student by ID with details
   * GET /api/students/:id
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getStudentById: async (id: string): Promise<ApiResponse<StudentDetailResponse>> => {
    const response = await api.get<ApiResponse<StudentDetailResponse>>(
      STUDENT_ENDPOINTS.STUDENT_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update student information
   * PUT /api/students/:id
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  updateStudent: async (id: string, data: UpdateStudentRequest): Promise<ApiResponse<StudentResponse>> => {
    const response = await api.put<ApiResponse<StudentResponse>>(
      STUDENT_ENDPOINTS.STUDENT_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete student
   * DELETE /api/students/:id
   * Access: ADMIN only
   * Note: Cannot delete students with submissions
   */
  deleteStudent: async (id: string): Promise<ApiResponse<DeleteStudentResponse>> => {
    const response = await api.delete<ApiResponse<DeleteStudentResponse>>(
      STUDENT_ENDPOINTS.STUDENT_BY_ID(id)
    );
    return response.data;
  },
};

export default studentService;
