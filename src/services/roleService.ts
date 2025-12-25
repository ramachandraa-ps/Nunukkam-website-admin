import api from './api';
import {
  ApiResponse,
  RoleType,
  CreateRolePermissionRequest,
  UpdateRolePermissionRequest,
  RolePermissionResponse,
  RolePermissionsListResponse,
  InitializePermissionsResponse,
  DeleteRoleResponse,
} from '../types/role';

const ROLE_ENDPOINTS = {
  ROLES: '/api/roles',
  INITIALIZE: '/api/roles/initialize',
  ROLE_BY_TYPE: (role: RoleType) => `/api/roles/${role}`,
};

export const roleService = {
  /**
   * Create a new role permission configuration
   * POST /api/roles
   * Access: ADMIN
   */
  createRolePermission: async (data: CreateRolePermissionRequest): Promise<ApiResponse<RolePermissionResponse>> => {
    const response = await api.post<ApiResponse<RolePermissionResponse>>(
      ROLE_ENDPOINTS.ROLES,
      data
    );
    return response.data;
  },

  /**
   * Initialize default permissions for all roles
   * POST /api/roles/initialize
   * Access: ADMIN
   */
  initializeDefaultPermissions: async (): Promise<ApiResponse<InitializePermissionsResponse>> => {
    const response = await api.post<ApiResponse<InitializePermissionsResponse>>(
      ROLE_ENDPOINTS.INITIALIZE
    );
    return response.data;
  },

  /**
   * Get all role permissions
   * GET /api/roles
   * Access: ADMIN
   */
  getRolePermissions: async (): Promise<ApiResponse<RolePermissionsListResponse>> => {
    const response = await api.get<ApiResponse<RolePermissionsListResponse>>(
      ROLE_ENDPOINTS.ROLES
    );
    return response.data;
  },

  /**
   * Get specific role permission by role type
   * GET /api/roles/:role
   * Access: ADMIN
   */
  getRolePermissionByRole: async (role: RoleType): Promise<ApiResponse<RolePermissionResponse>> => {
    const response = await api.get<ApiResponse<RolePermissionResponse>>(
      ROLE_ENDPOINTS.ROLE_BY_TYPE(role)
    );
    return response.data;
  },

  /**
   * Update role permission configuration
   * PUT /api/roles/:role
   * Access: ADMIN
   */
  updateRolePermission: async (role: RoleType, data: UpdateRolePermissionRequest): Promise<ApiResponse<RolePermissionResponse>> => {
    const response = await api.put<ApiResponse<RolePermissionResponse>>(
      ROLE_ENDPOINTS.ROLE_BY_TYPE(role),
      data
    );
    return response.data;
  },

  /**
   * Delete role permission configuration
   * DELETE /api/roles/:role
   * Access: ADMIN
   * Note: Cannot delete if users have this role
   */
  deleteRolePermission: async (role: RoleType): Promise<ApiResponse<DeleteRoleResponse>> => {
    const response = await api.delete<ApiResponse<DeleteRoleResponse>>(
      ROLE_ENDPOINTS.ROLE_BY_TYPE(role)
    );
    return response.data;
  },
};

export default roleService;
