import { ApiResponse } from './user';

// College entity returned from API
export interface ApiCollege {
  id: string;
  name: string;
  affiliatedUniversity: string;
  city: string;
  state: string;
  fullAddress?: string | null;
  pincode?: string | null;
  pocName: string;
  pocNumber: string;
  programCoordinatorId?: string | null;
  programCoordinator?: {
    id: string;
    username: string;
    email: string;
    phoneNumber?: string;
  } | null;
  batches?: ApiBatch[];
  _count?: {
    batches: number;
    students: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Batch entity returned from API
export interface ApiBatch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  collegeId?: string;
  college?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  } | null;
  students?: Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
  }>;
  sessions?: Array<{
    id: string;
    date: string;
    chapter?: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    students: number;
    sessions?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Course entity returned from API
export interface ApiCourse {
  id: string;
  title: string;
  description?: string | null;
  durationDays: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  coreSkills?: Array<{
    id: string;
    name: string;
  }>;
  _count?: {
    students: number;
    modules: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Request types for College
export interface CreateCollegeRequest {
  name: string;
  affiliatedUniversity: string;
  city: string;
  state: string;
  fullAddress?: string;
  pincode?: string;
  pocName: string;
  pocNumber: string;
  programCoordinatorId?: string;
}

export interface UpdateCollegeRequest {
  name?: string;
  affiliatedUniversity?: string;
  city?: string;
  state?: string;
  fullAddress?: string;
  pincode?: string;
  pocName?: string;
  pocNumber?: string;
  programCoordinatorId?: string;
}

// Request types for Batch
export interface CreateBatchRequest {
  collegeId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateBatchRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
}

// Response types
export interface CollegeResponse {
  college: ApiCollege;
}

export interface CollegesListResponse {
  colleges: ApiCollege[];
}

export interface BatchResponse {
  batch: ApiBatch;
}

export interface BatchesListResponse {
  batches: ApiBatch[];
}

export interface CourseResponse {
  course: ApiCourse;
}

export interface CoursesListResponse {
  courses: ApiCourse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteResponse {
  message: string;
}

// ============ Session Types ============

// Session entity returned from API
export interface ApiSession {
  id: string;
  batchId: string;
  chapterId: string;
  date: string;
  batch?: {
    id: string;
    name: string;
    college?: {
      id: string;
      name: string;
    };
  };
  chapter?: {
    id: string;
    name: string;
    module?: {
      id: string;
      title: string;
      coreSkill?: {
        id: string;
        name: string;
      };
    };
  };
  attendance?: ApiAttendance[];
  _count?: {
    attendance: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Session Request Types
export interface CreateSessionRequest {
  batchId: string;
  chapterId: string;
  date: string;
}

export interface BulkCreateSessionsRequest {
  sessions: Array<{
    batchId: string;
    chapterId: string;
    date: string;
  }>;
}

export interface UpdateSessionRequest {
  date?: string;
  chapterId?: string;
}

// Session Response Types
export interface SessionResponse {
  session: ApiSession;
}

export interface SessionsListResponse {
  sessions: ApiSession[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkSessionResponse {
  success: ApiSession[];
  errors: Array<{
    batchId: string;
    chapterId: string;
    date: string;
    error: string;
  }>;
}

export interface SessionCalendarResponse {
  [date: string]: ApiSession[];
}

// ============ Attendance Types ============

// Attendance entity returned from API
export interface ApiAttendance {
  id: string;
  sessionId: string;
  studentId: string;
  present: boolean;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  session?: {
    id: string;
    date: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Attendance Request Types
export interface MarkAttendanceRequest {
  sessionId: string;
  studentId: string;
  present: boolean;
}

export interface BulkMarkAttendanceRequest {
  attendance: Array<{
    studentId: string;
    present: boolean;
  }>;
}

// Attendance Response Types
export interface AttendanceResponse {
  attendance: ApiAttendance;
}

export interface SessionAttendanceResponse {
  session: {
    id: string;
    date: string;
    batchId: string;
  };
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  notMarkedCount: number;
  attendance: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    present: boolean | null;
    attendanceId: string | null;
  }>;
}

export interface StudentAttendanceResponse {
  student: {
    id: string;
    name: string;
    batch: {
      id: string;
      name: string;
    } | null;
  };
  summary: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
  };
  records: Array<{
    id: string;
    present: boolean;
    session: {
      id: string;
      date: string;
      chapter?: {
        id: string;
        name: string;
        module?: {
          id: string;
          title: string;
        };
      };
    };
  }>;
}

export interface BatchAttendanceSummaryResponse {
  batchId: string;
  totalStudents: number;
  totalSessions: number;
  studentSummary: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
  }>;
}

export interface BulkAttendanceResponse {
  success: ApiAttendance[];
  errors: Array<{
    studentId: string;
    error: string;
  }>;
}

export { ApiResponse };
