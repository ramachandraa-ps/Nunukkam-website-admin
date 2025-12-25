// Course Management Types for API integration

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// Skill entity
export interface ApiSkill {
  id: string;
  name: string;
  description?: string | null;
  _count?: {
    chapters: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Core Skill entity
export interface ApiCoreSkill {
  id: string;
  name: string;
  description?: string | null;
  modules?: ApiModule[];
  _count?: {
    modules: number;
    courses: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Module entity
export interface ApiModule {
  id: string;
  coreSkillId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  coreSkill?: {
    id: string;
    name: string;
  };
  chapters?: ApiChapter[];
  _count?: {
    chapters: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Chapter entity
export interface ApiChapter {
  id: string;
  moduleId: string;
  name: string;
  pptFile?: string | null;
  notesFile?: string | null;
  orderIndex: number;
  module?: {
    id: string;
    title: string;
    coreSkill?: {
      id: string;
      name: string;
    };
  };
  skills?: Array<{
    id: string;
    skillId: string;
    skill: {
      id: string;
      name: string;
    };
  }>;
  assessments?: Array<{
    id: string;
    title: string;
    kind: 'PRE_KBA' | 'POST_KBA';
  }>;
  _count?: {
    skills: number;
    assessments: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Course entity (extended)
export interface ApiCourse {
  id: string;
  title: string;
  description?: string | null;
  durationDays: number;
  status: CourseStatus;
  coreSkills?: Array<{
    id: string;
    orderIndex: number;
    coreSkill: {
      id: string;
      name: string;
      description?: string | null;
    };
  }>;
  _count?: {
    students: number;
    batches: number;
    coreSkills: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ============ Request Types ============

// Course Requests
export interface CreateCourseRequest {
  title: string;
  durationDays: number;
  coreSkillIds: string[];
  description?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  durationDays?: number;
  status?: CourseStatus;
  coreSkillIds?: string[];
}

// Core Skill Requests
export interface CreateCoreSkillRequest {
  name: string;
  description?: string;
}

export interface UpdateCoreSkillRequest {
  name?: string;
  description?: string;
}

// Module Requests
export interface CreateModuleRequest {
  coreSkillId: string;
  title: string;
  description?: string;
  chapterIds?: string[];
}

export interface UpdateModuleRequest {
  title?: string;
  description?: string;
  orderIndex?: number;
}

export interface ReorderModulesRequest {
  moduleIds: string[];
}

// Chapter Requests
export interface CreateChapterRequest {
  moduleId: string;
  name: string;
  pptFile?: string;
  notesFile?: string;
  skillIds?: string[];
}

export interface UpdateChapterRequest {
  name?: string;
  pptFile?: string;
  notesFile?: string;
  orderIndex?: number;
  skillIds?: string[];
}

export interface UploadChapterFileRequest {
  fileType: 'ppt' | 'notes';
  fileUrl: string;
}

export interface ReorderChaptersRequest {
  chapterIds: string[];
}

// Skill Requests
export interface CreateSkillRequest {
  name: string;
  description?: string;
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
}

// ============ Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
  };
}

// Course Responses
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

export interface PublishCourseResponse {
  course: ApiCourse;
  stats: {
    coreSkillsCount: number;
    modulesCount: number;
    chaptersCount: number;
  };
}

// Core Skill Responses
export interface CoreSkillResponse {
  coreSkill: ApiCoreSkill;
}

export interface CoreSkillsListResponse {
  coreSkills: ApiCoreSkill[];
}

// Module Responses
export interface ModuleResponse {
  module: ApiModule;
}

export interface ModulesListResponse {
  modules: ApiModule[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Chapter Responses
export interface ChapterResponse {
  chapter: ApiChapter;
}

export interface ChaptersListResponse {
  chapters: ApiChapter[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Skill Responses
export interface SkillResponse {
  skill: ApiSkill;
}

export interface SkillsListResponse {
  skills: ApiSkill[];
}

export interface DeleteResponse {
  message: string;
}

// ============ Assessment Types ============

export type AssessmentKind = 'PRE_KBA' | 'POST_KBA';
export type SubmissionType = 'TEXT_INPUT' | 'RADIO_BUTTONS' | 'CHECK_BOXES' | 'VIDEO_UPLOAD' | 'PICTURE_UPLOAD' | 'MCQ';

// Assessment Type entity
export interface ApiAssessmentType {
  id: string;
  name: string;
  submissionType: SubmissionType;
  _count?: {
    assessments: number;
  };
  assessments?: Array<{
    id: string;
    title: string;
    kind: AssessmentKind;
    chapter: {
      id: string;
      name: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

// Assessment entity
export interface ApiAssessment {
  id: string;
  chapterId: string;
  assessmentTypeId: string;
  kind: AssessmentKind;
  title: string;
  durationHours: number;
  passingCutoff: number;
  expertPercent?: number | null;
  intermediatePercent?: number | null;
  novicePercent?: number | null;
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
  assessmentType?: {
    id: string;
    name: string;
    submissionType: SubmissionType;
  };
  skills?: Array<{
    id: string;
    skillId: string;
    skill: {
      id: string;
      name: string;
      description?: string | null;
    };
  }>;
  questions?: Array<{
    id: string;
    questionText: string;
    orderIndex: number;
  }>;
  _count?: {
    questions: number;
    submissions: number;
    deadlines: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Assessment Deadline entity
export interface ApiAssessmentDeadline {
  id: string;
  assessmentId: string;
  batchId: string;
  deadline: string;
  assessment?: {
    id: string;
    title: string;
    kind: AssessmentKind;
    durationHours?: number;
    passingCutoff?: number;
    chapter?: {
      id: string;
      name: string;
      module?: {
        id: string;
        title: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

// ============ Assessment Request Types ============

// Assessment Type Requests
export interface CreateAssessmentTypeRequest {
  name: string;
  submissionType: SubmissionType;
}

export interface UpdateAssessmentTypeRequest {
  name?: string;
  submissionType?: SubmissionType;
}

// Assessment Requests
export interface CreateAssessmentRequest {
  chapterId: string;
  assessmentTypeId: string;
  kind: AssessmentKind;
  name: string;  // Required - assessment name
  title?: string; // Optional - display title
  durationHours: number;
  passingCutoff: number;
  expertPercent?: number;
  intermediatePercent?: number;
  novicePercent?: number;
  skillIds?: string[];
}

export interface UpdateAssessmentRequest {
  title?: string;
  durationHours?: number;
  passingCutoff?: number;
  expertPercent?: number;
  intermediatePercent?: number;
  novicePercent?: number;
  skillIds?: string[];
}

// Assessment Deadline Requests
export interface CreateAssessmentDeadlineRequest {
  assessmentId: string;
  batchId: string;
  deadline: string | Date;
}

export interface BulkCreateDeadlinesRequest {
  deadlines: Array<{
    assessmentId: string;
    batchId: string;
    deadline: string | Date;
  }>;
}

export interface UpdateAssessmentDeadlineRequest {
  deadline: string | Date;
}

// ============ Assessment Response Types ============

// Assessment Type Responses
export interface AssessmentTypeResponse {
  assessmentType: ApiAssessmentType;
}

export interface AssessmentTypesListResponse {
  assessmentTypes: ApiAssessmentType[];
}

// Assessment Responses
export interface AssessmentResponse {
  assessment: ApiAssessment;
}

export interface AssessmentsListResponse {
  assessments: ApiAssessment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Assessment Deadline Responses
export interface AssessmentDeadlineResponse {
  deadline: ApiAssessmentDeadline;
}

export interface AssessmentDeadlinesListResponse {
  deadlines: ApiAssessmentDeadline[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkDeadlineResponse {
  successCount: number;
  errorCount: number;
  created: ApiAssessmentDeadline[];
  errors: Array<{
    assessmentId: string;
    batchId: string;
    error: string;
  }>;
}

export interface DeadlinesByBatchResponse {
  batchId: string;
  deadlines: ApiAssessmentDeadline[];
  upcoming: ApiAssessmentDeadline[];
  past: ApiAssessmentDeadline[];
}

// ============ Question Types ============

export type QuestionType = 'MCQ' | 'SUBJECTIVE';

// Question entity
export interface ApiQuestion {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: QuestionType;
  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  rubric?: Record<string, unknown> | null;
  marks: number;
  orderIndex: number;
  assessment?: {
    id: string;
    title: string;
    kind: AssessmentKind;
    chapter?: {
      id: string;
      name: string;
    };
  };
  _count?: {
    answers: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ============ Question Request Types ============

export interface CreateQuestionRequest {
  assessmentId: string;
  questionText: string;
  questionType: QuestionType;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  rubric?: Record<string, unknown>;
  marks?: number;
}

export interface BulkCreateQuestionsRequest {
  questions: Array<Omit<CreateQuestionRequest, 'assessmentId'>>;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  rubric?: Record<string, unknown>;
  marks?: number;
  orderIndex?: number;
}

export interface ReorderQuestionsRequest {
  questionIds: string[];
}

// ============ Question Response Types ============

export interface QuestionResponse {
  question: ApiQuestion;
}

export interface QuestionsListResponse {
  questions: ApiQuestion[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ Grading Types ============

export type GradeLevel = 'EXPERT' | 'INTERMEDIATE' | 'NOVICE' | 'FAIL';

// Answer entity (for grading)
export interface ApiAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  score?: number | null;
  question?: {
    id: string;
    questionText: string;
    questionType: QuestionType;
    marks: number;
    correctAnswer?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// Submission entity (for grading)
export interface ApiSubmission {
  id: string;
  assessmentId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string | null;
  score?: number | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  assessment?: {
    id: string;
    title: string;
    kind: AssessmentKind;
  };
  answers?: ApiAnswer[];
  createdAt: string;
  updatedAt: string;
}

// ============ Grading Request Types ============

export interface GradeAnswerRequest {
  score: number;
}

export interface BulkGradeRequest {
  grades: Array<{
    answerId: string;
    score: number;
    feedback?: string;
  }>;
}

// ============ Grading Response Types ============

export interface PendingSubmissionsResponse {
  submissions: ApiSubmission[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GradeAnswerResponse {
  answer: ApiAnswer;
}

export interface BulkGradeResponse {
  success: Array<{ answerId: string; score: number }>;
  errors: Array<{ answerId: string; error: string }>;
}

export interface FinalizeGradingResponse {
  submission: ApiSubmission;
  totalScore: number;
  maxScore: number;
  percentage: number;
  gradeLevel: GradeLevel;
  passed: boolean;
}

export interface GradingStatsResponse {
  assessmentId: string;
  assessmentTitle: string;
  maxScore: number;
  passingCutoff: number;
  statistics: {
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingSubmissions: number;
    inProgressSubmissions: number;
    averageScore: number;
    averagePercentage: number;
    passCount: number;
    failCount: number;
    passRate: number;
  };
}
