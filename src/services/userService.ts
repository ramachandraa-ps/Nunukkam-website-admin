import api from './api';
import {
  ApiResponse,
  ApiUser,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersParams,
  UsersListResponse,
  UserResponse,
  DeactivatedUsersResponse,
} from '../types/user';

const USER_ENDPOINTS = {
  USERS: '/api/users',
  DEACTIVATED: '/api/users/deactivated',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  REACTIVATE: (id: string) => `/api/users/${id}/reactivate`,
};

export const userService = {
  /**
   * Create a new user
   * POST /api/users
   */
  createUser: async (data: CreateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post<ApiResponse<UserResponse>>(
      USER_ENDPOINTS.USERS,
      data
    );
    return response.data;
  },

  /**
   * Get all users with filtering & pagination
   * GET /api/users
   */
  getUsers: async (params?: GetUsersParams): Promise<ApiResponse<UsersListResponse>> => {
    const response = await api.get<ApiResponse<UsersListResponse>>(
      USER_ENDPOINTS.USERS,
      { params }
    );
    return response.data;
  },

  /**
   * Get all deactivated users
   * GET /api/users/deactivated
   */
  getDeactivatedUsers: async (): Promise<ApiResponse<DeactivatedUsersResponse>> => {
    const response = await api.get<ApiResponse<DeactivatedUsersResponse>>(
      USER_ENDPOINTS.DEACTIVATED
    );
    return response.data;
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<UserResponse>>(
      USER_ENDPOINTS.USER_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update user information
   * PUT /api/users/:id
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put<ApiResponse<UserResponse>>(
      USER_ENDPOINTS.USER_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Deactivate user (soft delete)
   * DELETE /api/users/:id
   */
  deactivateUser: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.delete<ApiResponse<UserResponse>>(
      USER_ENDPOINTS.USER_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Reactivate a deactivated user
   * POST /api/users/:id/reactivate
   */
  reactivateUser: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post<ApiResponse<UserResponse>>(
      USER_ENDPOINTS.REACTIVATE(id)
    );
    return response.data;
  },
};

export default userService;
