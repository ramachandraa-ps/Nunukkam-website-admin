import { ApiResponse } from './user';

// ============ Dashboard Stats ============

export interface DashboardStats {
  users: {
    total: number;
    active: number;
  };
  students: {
    total: number;
  };
  courses: {
    total: number;
    published: number;
  };
  colleges: {
    total: number;
  };
  batches: {
    total: number;
  };
  assessments: {
    total: number;
  };
}

export interface DashboardStatsResponse {
  dashboard: DashboardStats;
}

// ============ Student Report ============

export interface StudentReportData {
  student: {
    id: string;
    name: string;
    email: string;
    college: string;
    batch?: string;
    course?: string;
  };
  assessments: {
    total: number;
    completed: number;
    graded: number;
    passed: number;
    averageScore: number;
  };
  attendance: {
    totalSessions: number;
    attended: number;
    rate: number;
  };
  certificates: Array<{
    id: string;
    course: string;
    grade: string;
    issueDate: string;
  }>;
}

export interface StudentReportResponse {
  report: StudentReportData;
}

// ============ Batch Report ============

export interface BatchReportData {
  batch: {
    id: string;
    name: string;
    college: string;
    startDate: string;
    endDate: string;
  };
  statistics: {
    totalStudents: number;
    totalSessions: number;
    averageScore: number;
    averageAttendanceRate: number;
  };
  studentPerformance: Array<{
    id: string;
    name: string;
    submissionsCount: number;
    averageScore: number;
    attendanceRate: number;
  }>;
}

export interface BatchReportResponse {
  report: BatchReportData;
}

// ============ Assessment Analytics ============

export interface AssessmentAnalyticsData {
  assessment: {
    id: string;
    title: string;
    kind: string;
    passingCutoff: number;
    maxScore: number;
  };
  statistics: {
    totalSubmissions: number;
    averageScore: number;
    minScore: number;
    maxScore: number;
    passCount: number;
    failCount: number;
    passRate: number;
  };
  scoreDistribution: {
    '0-20%': number;
    '20-40%': number;
    '40-60%': number;
    '60-80%': number;
    '80-100%': number;
  };
  questionAnalysis: Array<{
    questionId: string;
    questionText: string;
    type: string;
    marks: number;
    totalAttempts: number;
    correctAttempts: number | null;
    accuracyRate: number | null;
  }>;
}

export interface AssessmentAnalyticsResponse {
  analytics: AssessmentAnalyticsData;
}

// ============ Course Progress Report ============

export interface CourseProgressData {
  course: {
    id: string;
    title: string;
    status: string;
    durationDays: number;
  };
  statistics: {
    enrolledStudents: number;
    completedStudents: number;
    completionRate: number;
    totalAssessments: number;
  };
  studentProgress: Array<{
    id: string;
    name: string;
    assessmentsCompleted: number;
    certificateIssued: boolean;
  }>;
}

export interface CourseProgressResponse {
  report: CourseProgressData;
}

// ============ College Statistics ============

export interface CollegeStatisticsData {
  college: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  statistics: {
    totalStudents: number;
    totalBatches: number;
    activeBatches: number;
    totalSubmissions: number;
    averageScore: number;
    certificatesIssued: number;
  };
  batches: Array<{
    id: string;
    name: string;
    studentCount: number;
    sessionCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>;
}

export interface CollegeStatisticsResponse {
  statistics: CollegeStatisticsData;
}

// ============ Attendance Summary ============

export interface AttendanceSummarySession {
  sessionId: string;
  date: string;
  batch: string;
  chapter: string;
  totalStudents: number;
  present: number;
  absent: number;
  attendanceRate: number;
}

export interface AttendanceSummaryData {
  sessions: AttendanceSummarySession[];
  overall: {
    totalSessions: number;
    totalAttendanceRecords: number;
    totalPresent: number;
    overallRate: number;
  };
}

export interface AttendanceSummaryResponse {
  summary: AttendanceSummaryData;
}

// ============ Audit Logs ============

export interface AuditLog {
  id: string;
  userId: string;
  entity: string;
  entityId: string;
  action: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogsListResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditSummaryData {
  totalLogs: number;
  actionBreakdown: Array<{
    action: string;
    count: number;
  }>;
  entityBreakdown: Array<{
    entity: string;
    count: number;
  }>;
  recentActivity: AuditLog[];
}

export interface AuditSummaryResponse {
  summary: AuditSummaryData;
}

export interface AuditEntitiesResponse {
  entities: string[];
}

export interface AuditActionsResponse {
  actions: string[];
}

export interface CleanupResponse {
  deletedCount: number;
}

// ============ Notifications ============

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'DEADLINE' | 'GRADE' | 'ASSIGNMENT' | 'SYSTEM';
export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
}

export interface BulkCreateNotificationRequest {
  userIds: string[];
  title: string;
  message: string;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
}

export interface NotificationResponse {
  notification: Notification;
}

export interface BulkNotificationResponse {
  count: number;
}

// ============ Uploads ============

export type UploadCategory = 'submissions' | 'certificates' | 'profilePictures' | 'courseAssets' | 'sampleFormats' | 'temp';
export type FileType = 'image' | 'video' | 'document' | 'any';

export interface UploadResult {
  key: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadResponse {
  file: UploadResult;
}

export interface MultipleUploadResponse {
  files: UploadResult[];
}

export interface PresignedUploadRequest {
  fileName: string;
  mimeType: string;
  category: UploadCategory;
  fileType?: FileType;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface DeleteFileRequest {
  key: string;
}

export interface DeleteFileResponse {
  message: string;
}

// ============ Certificates ============

export type CertificateStatus = 'GENERATED' | 'REVOKED';

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  certificateNo: string;
  issueDate: string;
  status: CertificateStatus;
  score: number;
  grade: string;
  certificateUrl?: string;
  revokedAt?: string;
  revokedReason?: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IssueCertificateRequest {
  studentId: string;
  courseId: string;
}

export interface RevokeCertificateRequest {
  reason: string;
}

export interface CertificateResponse {
  certificate: Certificate;
}

export interface CertificatesListResponse {
  certificates: Certificate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkCertificateResponse {
  success: string[];
  errors: Array<{
    studentId: string;
    error: string;
  }>;
}

export interface VerifyCertificateResponse {
  valid: boolean;
  message?: string;
  certificate?: {
    certificateNo: string;
    studentName: string;
    courseName: string;
    issueDate: string;
    grade: string;
    score: number;
  };
  revokedAt?: string;
  reason?: string;
}

export { ApiResponse };
