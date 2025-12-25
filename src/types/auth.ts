// Auth Types based on Backend API specification

export type UserRole = 'ADMIN' | 'STUDENT' | 'TRAINER' | 'PROGRAM_COORDINATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  displayId?: string;
  phoneNumber?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: 'STUDENT' | 'TRAINER' | 'PROGRAM_COORDINATOR';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
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

// Backend returns: { user: {...}, tokens: { accessToken, refreshToken } }
export interface LoginResponseData {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
  tokens: AuthTokens;
}

export interface SignupResponseData {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  tokens: AuthTokens;
}

// Backend returns: { user: {...}, tokens: { accessToken, refreshToken } }
export interface RefreshTokenResponseData {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
  tokens: AuthTokens;
}

export interface MeResponseData {
  user: {
    userId: string;
    email: string;
    username?: string;
    role: UserRole;
    status?: UserStatus;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}
