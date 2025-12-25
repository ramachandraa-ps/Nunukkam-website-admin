import api from './api';
import {
  ApiResponse,
  MarkAttendanceRequest,
  BulkMarkAttendanceRequest,
  AttendanceResponse,
  SessionAttendanceResponse,
  StudentAttendanceResponse,
  BatchAttendanceSummaryResponse,
  BulkAttendanceResponse,
} from '../types/college';

interface GetStudentAttendanceParams {
  dateFrom?: string;
  dateTo?: string;
}

const ATTENDANCE_ENDPOINTS = {
  ATTENDANCE: '/api/attendance',
  BULK_MARK: (sessionId: string) => `/api/attendance/bulk/${sessionId}`,
  SESSION_ATTENDANCE: (sessionId: string) => `/api/attendance/session/${sessionId}`,
  STUDENT_ATTENDANCE: (studentId: string) => `/api/attendance/student/${studentId}`,
  BATCH_SUMMARY: (batchId: string) => `/api/attendance/batch/${batchId}/summary`,
};

export const attendanceService = {
  /**
   * Mark student attendance
   * POST /api/attendance
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  markAttendance: async (data: MarkAttendanceRequest): Promise<ApiResponse<AttendanceResponse>> => {
    const response = await api.post<ApiResponse<AttendanceResponse>>(
      ATTENDANCE_ENDPOINTS.ATTENDANCE,
      data
    );
    return response.data;
  },

  /**
   * Bulk mark attendance for a session
   * POST /api/attendance/bulk/:sessionId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  bulkMarkAttendance: async (sessionId: string, data: BulkMarkAttendanceRequest): Promise<ApiResponse<BulkAttendanceResponse>> => {
    const response = await api.post<ApiResponse<BulkAttendanceResponse>>(
      ATTENDANCE_ENDPOINTS.BULK_MARK(sessionId),
      data
    );
    return response.data;
  },

  /**
   * Get session attendance
   * GET /api/attendance/session/:sessionId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getSessionAttendance: async (sessionId: string): Promise<ApiResponse<SessionAttendanceResponse>> => {
    const response = await api.get<ApiResponse<SessionAttendanceResponse>>(
      ATTENDANCE_ENDPOINTS.SESSION_ATTENDANCE(sessionId)
    );
    return response.data;
  },

  /**
   * Get student attendance
   * GET /api/attendance/student/:studentId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getStudentAttendance: async (studentId: string, params?: GetStudentAttendanceParams): Promise<ApiResponse<StudentAttendanceResponse>> => {
    const response = await api.get<ApiResponse<StudentAttendanceResponse>>(
      ATTENDANCE_ENDPOINTS.STUDENT_ATTENDANCE(studentId),
      { params }
    );
    return response.data;
  },

  /**
   * Get batch attendance summary
   * GET /api/attendance/batch/:batchId/summary
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getBatchAttendanceSummary: async (batchId: string): Promise<ApiResponse<BatchAttendanceSummaryResponse>> => {
    const response = await api.get<ApiResponse<BatchAttendanceSummaryResponse>>(
      ATTENDANCE_ENDPOINTS.BATCH_SUMMARY(batchId)
    );
    return response.data;
  },
};

export default attendanceService;
