import api from './api';
import {
  ApiResponse,
  DashboardStats,
  StudentReportData,
  BatchReportData,
  AssessmentAnalyticsData,
  CourseProgressData,
  CollegeStatisticsData,
  AttendanceSummaryData,
} from '../types/reports';

interface AttendanceSummaryParams {
  batchId?: string;
  startDate?: string;
  endDate?: string;
}

const REPORT_ENDPOINTS = {
  DASHBOARD: '/api/reports/dashboard',
  STUDENT: (studentId: string) => `/api/reports/student/${studentId}`,
  BATCH: (batchId: string) => `/api/reports/batch/${batchId}`,
  ASSESSMENT: (assessmentId: string) => `/api/reports/assessment/${assessmentId}`,
  COURSE: (courseId: string) => `/api/reports/course/${courseId}`,
  COLLEGE: (collegeId: string) => `/api/reports/college/${collegeId}`,
  ATTENDANCE: '/api/reports/attendance',
};

export const reportService = {
  /**
   * Get dashboard statistics
   * GET /api/reports/dashboard
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>(
      REPORT_ENDPOINTS.DASHBOARD
    );
    return response.data;
  },

  /**
   * Get student performance report
   * GET /api/reports/student/:studentId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getStudentReport: async (studentId: string): Promise<ApiResponse<StudentReportData>> => {
    const response = await api.get<ApiResponse<StudentReportData>>(
      REPORT_ENDPOINTS.STUDENT(studentId)
    );
    return response.data;
  },

  /**
   * Get batch performance report
   * GET /api/reports/batch/:batchId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getBatchReport: async (batchId: string): Promise<ApiResponse<BatchReportData>> => {
    const response = await api.get<ApiResponse<BatchReportData>>(
      REPORT_ENDPOINTS.BATCH(batchId)
    );
    return response.data;
  },

  /**
   * Get assessment analytics
   * GET /api/reports/assessment/:assessmentId
   * Access: ADMIN, TRAINER
   */
  getAssessmentAnalytics: async (assessmentId: string): Promise<ApiResponse<AssessmentAnalyticsData>> => {
    const response = await api.get<ApiResponse<AssessmentAnalyticsData>>(
      REPORT_ENDPOINTS.ASSESSMENT(assessmentId)
    );
    return response.data;
  },

  /**
   * Get course progress report
   * GET /api/reports/course/:courseId
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  getCourseProgressReport: async (courseId: string): Promise<ApiResponse<CourseProgressData>> => {
    const response = await api.get<ApiResponse<CourseProgressData>>(
      REPORT_ENDPOINTS.COURSE(courseId)
    );
    return response.data;
  },

  /**
   * Get college statistics
   * GET /api/reports/college/:collegeId
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  getCollegeStatistics: async (collegeId: string): Promise<ApiResponse<CollegeStatisticsData>> => {
    const response = await api.get<ApiResponse<CollegeStatisticsData>>(
      REPORT_ENDPOINTS.COLLEGE(collegeId)
    );
    return response.data;
  },

  /**
   * Get attendance summary report
   * GET /api/reports/attendance
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getAttendanceSummary: async (params?: AttendanceSummaryParams): Promise<ApiResponse<AttendanceSummaryData>> => {
    const response = await api.get<ApiResponse<AttendanceSummaryData>>(
      REPORT_ENDPOINTS.ATTENDANCE,
      { params }
    );
    return response.data;
  },
};

export default reportService;
