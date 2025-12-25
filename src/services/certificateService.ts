import api from './api';
import {
  ApiResponse,
  Certificate,
  CertificatesListResponse,
  IssueCertificateRequest,
  RevokeCertificateRequest,
  BulkCertificateResponse,
  CertificateStatus,
} from '../types/reports';

interface GetCertificatesParams {
  page?: number;
  limit?: number;
  studentId?: string;
  courseId?: string;
  status?: CertificateStatus;
}

const CERTIFICATE_ENDPOINTS = {
  CERTIFICATES: '/api/certificates',
  CERTIFICATE_BY_ID: (id: string) => `/api/certificates/${id}`,
  BULK_ISSUE: (courseId: string) => `/api/certificates/course/${courseId}/bulk`,
  STUDENT_CERTIFICATES: (studentId: string) => `/api/certificates/student/${studentId}`,
  REVOKE: (id: string) => `/api/certificates/${id}/revoke`,
};

export const certificateService = {
  /**
   * Get certificates with filtering
   * GET /api/certificates
   * Access: ADMIN, PROGRAM_COORDINATOR
   */
  getCertificates: async (params?: GetCertificatesParams): Promise<ApiResponse<CertificatesListResponse>> => {
    const response = await api.get<ApiResponse<CertificatesListResponse>>(
      CERTIFICATE_ENDPOINTS.CERTIFICATES,
      { params }
    );
    return response.data;
  },

  /**
   * Issue a certificate to a student
   * POST /api/certificates
   * Access: ADMIN
   */
  issueCertificate: async (data: IssueCertificateRequest): Promise<ApiResponse<{ certificate: Certificate }>> => {
    const response = await api.post<ApiResponse<{ certificate: Certificate }>>(
      CERTIFICATE_ENDPOINTS.CERTIFICATES,
      data
    );
    return response.data;
  },

  /**
   * Bulk issue certificates for a course
   * POST /api/certificates/course/:courseId/bulk
   * Access: ADMIN
   */
  bulkIssueCertificates: async (courseId: string): Promise<ApiResponse<BulkCertificateResponse>> => {
    const response = await api.post<ApiResponse<BulkCertificateResponse>>(
      CERTIFICATE_ENDPOINTS.BULK_ISSUE(courseId)
    );
    return response.data;
  },

  /**
   * Get student certificates
   * GET /api/certificates/student/:studentId
   * Access: ADMIN, PROGRAM_COORDINATOR, TRAINER
   */
  getStudentCertificates: async (studentId: string): Promise<ApiResponse<{ certificates: Certificate[] }>> => {
    const response = await api.get<ApiResponse<{ certificates: Certificate[] }>>(
      CERTIFICATE_ENDPOINTS.STUDENT_CERTIFICATES(studentId)
    );
    return response.data;
  },

  /**
   * Revoke a certificate
   * POST /api/certificates/:id/revoke
   * Access: ADMIN
   */
  revokeCertificate: async (id: string, data: RevokeCertificateRequest): Promise<ApiResponse<{ certificate: Certificate }>> => {
    const response = await api.post<ApiResponse<{ certificate: Certificate }>>(
      CERTIFICATE_ENDPOINTS.REVOKE(id),
      data
    );
    return response.data;
  },
};

export default certificateService;
