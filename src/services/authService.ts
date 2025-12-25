import api, { TokenStorage } from './api';
import {
  ApiResponse,
  LoginRequest,
  LoginResponseData,
  SignupRequest,
  SignupResponseData,
  RefreshTokenResponseData,
  MeResponseData,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
  User,
} from '../types/auth';

const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  CHANGE_PASSWORD: '/api/auth/change-password',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  VERIFY_RESET_TOKEN: '/api/auth/verify-reset-token',
  RESET_PASSWORD: '/api/auth/reset-password',
};

export const authService = {
  /**
   * Login with email and password
   * Backend returns: { success: true, data: { user: {...}, tokens: { accessToken, refreshToken } } }
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponseData> & { user?: User }> => {
    const response = await api.post<ApiResponse<LoginResponseData>>(
      AUTH_ENDPOINTS.LOGIN,
      data
    );

    if (response.data.success && response.data.data) {
      const { tokens, user } = response.data.data;
      TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      TokenStorage.setUser(user);
    }

    return response.data;
  },

  /**
   * Register a new user
   */
  signup: async (data: SignupRequest): Promise<ApiResponse<SignupResponseData>> => {
    const response = await api.post<ApiResponse<SignupResponseData>>(
      AUTH_ENDPOINTS.SIGNUP,
      data
    );

    if (response.data.success && response.data.data) {
      const { tokens, user } = response.data.data;
      TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      TokenStorage.setUser(user);
    }

    return response.data;
  },

  /**
   * Refresh access token
   * Backend returns: { success: true, data: { user: {...}, tokens: { accessToken, refreshToken } } }
   */
  refreshToken: async (): Promise<ApiResponse<RefreshTokenResponseData>> => {
    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<ApiResponse<RefreshTokenResponseData>>(
      AUTH_ENDPOINTS.REFRESH,
      { refreshToken }
    );

    if (response.data.success && response.data.data) {
      const { tokens, user } = response.data.data;
      TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      TokenStorage.setUser(user);
    }

    return response.data;
  },

  /**
   * Logout and invalidate refresh token
   */
  logout: async (): Promise<MessageResponse> => {
    const refreshToken = TokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
      }
    } finally {
      TokenStorage.clearTokens();
    }

    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Get current user information
   */
  me: async (): Promise<ApiResponse<MeResponseData>> => {
    const response = await api.get<ApiResponse<MeResponseData>>(AUTH_ENDPOINTS.ME);

    if (response.data.success && response.data.data) {
      TokenStorage.setUser(response.data.data.user);
    }

    return response.data;
  },

  /**
   * Change password for authenticated user
   */
  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Request password reset link
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Verify reset token validity
   */
  verifyResetToken: async (token: string): Promise<ApiResponse<{ valid: boolean }>> => {
    const response = await api.get<ApiResponse<{ valid: boolean }>>(
      `${AUTH_ENDPOINTS.VERIFY_RESET_TOKEN}/${token}`
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      `${AUTH_ENDPOINTS.RESET_PASSWORD}/${token}`,
      data
    );
    return response.data;
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated: (): boolean => {
    return !!TokenStorage.getAccessToken();
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    const userStr = TokenStorage.getUser();
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

export default authService;
