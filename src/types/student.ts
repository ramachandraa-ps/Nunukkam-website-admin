import { ApiResponse, Pagination } from './user';

// Student entity returned from API
export interface ApiStudent {
  id: string;
  displayId: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  department?: string | null;
  college: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  } | null;
  batch: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  } | null;
  course: {
    id: string;
    title: string;
    description?: string;
    durationDays?: number;
  } | null;
  trainer: {
    id: string;
    username: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
}

// Student detail with submissions and counts
export interface ApiStudentDetail extends ApiStudent {
  assessmentSubmissions?: Array<{
    id: string;
    score?: number;
    assessment: {
      id: string;
      title: string;
      kind: string;
    };
  }>;
  _count?: {
    assessmentSubmissions: number;
    attendance: number;
  };
}

// Request types
export interface CreateStudentRequest {
  collegeId: string;
  batchId?: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  department?: string;
  courseId?: string;
  trainerId?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  phoneNumber?: string;
  department?: string;
  batchId?: string;
  courseId?: string;
  trainerId?: string;
}

export interface BulkCreateStudentItem {
  collegeId: string;
  batchId?: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  department?: string;
  courseId?: string;
  trainerId?: string;
}

export interface BulkCreateStudentsRequest {
  students: BulkCreateStudentItem[];
}

// Query parameters for getStudents
export interface GetStudentsParams {
  page?: number;
  limit?: number;
  collegeId?: string;
  batchId?: string;
  courseId?: string;
  trainerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response types
export interface StudentResponse {
  student: ApiStudent;
}

export interface StudentDetailResponse {
  student: ApiStudentDetail;
}

export interface StudentsListResponse {
  students: ApiStudent[];
  pagination: Pagination;
}

export interface BulkCreateStudentsResponse {
  successCount: number;
  errorCount: number;
  created: Array<{
    id: string;
    displayId: string;
    name: string;
    email: string;
    phoneNumber?: string;
    department?: string;
  }>;
  errors: Array<{
    email: string;
    error: string;
  }>;
}

export interface DeleteStudentResponse {
  message: string;
}

export { ApiResponse };
