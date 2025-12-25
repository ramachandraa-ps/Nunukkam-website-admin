// User Management Types based on Backend API

export type UserRole = 'ADMIN' | 'TRAINER' | 'STUDENT' | 'PROGRAM_COORDINATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';

export interface ApiUser {
  id: string;
  displayId: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  designationId?: string | null;
  managerId?: string | null;
  designation?: {
    id: string;
    title: string;
  } | null;
  manager?: {
    id: string;
    username: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  designationId?: string;
  managerId?: string;
}

export interface UpdateUserRequest {
  designationId?: string;
  managerId?: string;
  status?: UserStatus;
}

// Query Parameters
export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  managerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface UsersListResponse {
  users: ApiUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  user: ApiUser;
}

export interface DeactivatedUsersResponse {
  users: ApiUser[];
}
