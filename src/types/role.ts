// Permission object structure
export interface PermissionObject {
  module: string;
  actions: string[];
}

// Role types matching Prisma UserRole enum
export type RoleType = 'ADMIN' | 'TRAINER' | 'STUDENT' | 'PROGRAM_COORDINATOR';

// Role permission entity from API
export interface ApiRolePermission {
  id: string;
  role: RoleType;
  permissions: PermissionObject[];
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateRolePermissionRequest {
  role: RoleType;
  permissions: PermissionObject[];
}

export interface UpdateRolePermissionRequest {
  permissions: PermissionObject[];
}

// Response types
export interface RolePermissionResponse {
  rolePermission: ApiRolePermission;
}

export interface RolePermissionsListResponse {
  rolePermissions: ApiRolePermission[];
}

export interface InitializePermissionsResponse {
  results: Array<{
    role: string;
    status: 'created' | 'already_exists' | 'error';
    message?: string;
  }>;
}

export interface DeleteRoleResponse {
  message: string;
}

// Available modules for permissions
export const PERMISSION_MODULES = [
  'users',
  'roles',
  'designations',
  'courses',
  'modules',
  'chapters',
  'assessments',
  'questions',
  'colleges',
  'batches',
  'students',
  'sessions',
  'attendance',
  'reports',
] as const;

// Available actions for permissions
export const PERMISSION_ACTIONS = [
  '*',        // Full access
  'read',
  'create',
  'update',
  'delete',
] as const;

export type PermissionModule = typeof PERMISSION_MODULES[number];
export type PermissionAction = typeof PERMISSION_ACTIONS[number];
