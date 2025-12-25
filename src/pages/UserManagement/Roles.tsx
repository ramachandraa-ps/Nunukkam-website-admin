import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import roleService from '../../services/roleService';
import userService from '../../services/userService';
import { ApiRolePermission, RoleType, PermissionObject, PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../types/role';

// Human-readable labels for modules
const moduleLabels: Record<string, string> = {
  users: 'User Management',
  roles: 'Roles & Permissions',
  designations: 'Designations',
  courses: 'Courses',
  modules: 'Course Modules',
  chapters: 'Chapters',
  assessments: 'Assessments',
  questions: 'Questions',
  colleges: 'Colleges',
  batches: 'Batches',
  students: 'Students',
  sessions: 'Sessions',
  attendance: 'Attendance',
  reports: 'Reports',
};

// Human-readable labels for actions
const actionLabels: Record<string, string> = {
  '*': 'Full Access',
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
};

// Role display names
const roleDisplayNames: Record<RoleType, string> = {
  ADMIN: 'Administrator',
  TRAINER: 'Trainer',
  STUDENT: 'Student',
  PROGRAM_COORDINATOR: 'Program Coordinator',
};

const Roles: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [rolePermissions, setRolePermissions] = useState<ApiRolePermission[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ApiRolePermission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; role: RoleType | null }>({ isOpen: false, role: null });

  const [formData, setFormData] = useState<{
    role: RoleType | '';
    permissions: PermissionObject[];
  }>({
    role: '',
    permissions: [],
  });

  // Fetch role permissions
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await roleService.getRolePermissions();
      if (response.success && response.data) {
        setRolePermissions(response.data.rolePermissions);
      }

      // Fetch user counts for each role
      const counts: Record<string, number> = {};
      const roles: RoleType[] = ['ADMIN', 'TRAINER', 'STUDENT', 'PROGRAM_COORDINATOR'];
      for (const role of roles) {
        try {
          const usersResponse = await userService.getUsers({ role, status: 'ACTIVE', limit: 1 });
          if (usersResponse.success && usersResponse.data) {
            counts[role] = usersResponse.data.pagination.total;
          }
        } catch {
          counts[role] = 0;
        }
      }
      setUserCounts(counts);
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
      addToast('error', 'Failed to load role permissions');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRoles = rolePermissions.filter(rp =>
    roleDisplayNames[rp.role].toLowerCase().includes(searchTerm.toLowerCase()) ||
    rp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (rolePermission?: ApiRolePermission) => {
    if (rolePermission) {
      setEditingRole(rolePermission);
      setFormData({
        role: rolePermission.role,
        permissions: rolePermission.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({
        role: '',
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const toggleModulePermission = (module: string, action: string) => {
    const existingModule = formData.permissions.find(p => p.module === module);

    if (existingModule) {
      if (action === '*') {
        // Toggle full access
        if (existingModule.actions.includes('*')) {
          // Remove full access, keep nothing
          setFormData({
            ...formData,
            permissions: formData.permissions.filter(p => p.module !== module),
          });
        } else {
          // Set to full access
          setFormData({
            ...formData,
            permissions: formData.permissions.map(p =>
              p.module === module ? { ...p, actions: ['*'] } : p
            ),
          });
        }
      } else {
        // Toggle specific action
        const newActions = existingModule.actions.includes(action)
          ? existingModule.actions.filter(a => a !== action && a !== '*')
          : [...existingModule.actions.filter(a => a !== '*'), action];

        if (newActions.length === 0) {
          // Remove module if no actions
          setFormData({
            ...formData,
            permissions: formData.permissions.filter(p => p.module !== module),
          });
        } else {
          setFormData({
            ...formData,
            permissions: formData.permissions.map(p =>
              p.module === module ? { ...p, actions: newActions } : p
            ),
          });
        }
      }
    } else {
      // Add new module permission
      setFormData({
        ...formData,
        permissions: [...formData.permissions, { module, actions: [action] }],
      });
    }
  };

  const hasPermission = (module: string, action: string): boolean => {
    const modulePermission = formData.permissions.find(p => p.module === module);
    if (!modulePermission) return false;
    return modulePermission.actions.includes(action) || modulePermission.actions.includes('*');
  };

  const handleSubmit = async () => {
    if (!formData.role || formData.permissions.length === 0) return;

    setIsSubmitting(true);
    try {
      if (editingRole) {
        const response = await roleService.updateRolePermission(formData.role as RoleType, {
          permissions: formData.permissions,
        });
        if (response.success) {
          addToast('success', 'Role permissions updated successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to update role');
        }
      } else {
        const response = await roleService.createRolePermission({
          role: formData.role as RoleType,
          permissions: formData.permissions,
        });
        if (response.success) {
          addToast('success', 'Role permissions created successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          addToast('error', response.error?.message || 'Failed to create role');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save role:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.role) return;

    try {
      const response = await roleService.deleteRolePermission(deleteConfirm.role);
      if (response.success) {
        addToast('success', 'Role permissions deleted successfully');
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to delete role');
      }
    } catch (error: unknown) {
      console.error('Failed to delete role:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to delete role');
    } finally {
      setDeleteConfirm({ isOpen: false, role: null });
    }
  };

  const handleInitializeDefaults = async () => {
    setIsSubmitting(true);
    try {
      const response = await roleService.initializeDefaultPermissions();
      if (response.success && response.data) {
        const created = response.data.results.filter(r => r.status === 'created').length;
        const existing = response.data.results.filter(r => r.status === 'already_exists').length;
        addToast('success', `Initialized: ${created} created, ${existing} already existed`);
        fetchData();
      } else {
        addToast('error', response.error?.message || 'Failed to initialize');
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      addToast('error', 'Failed to initialize default permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPermissionSummary = (permissions: PermissionObject[]): string => {
    if (permissions.some(p => p.module === 'users' && p.actions.includes('*'))) {
      return 'Full Access';
    }
    const moduleCount = permissions.length;
    return `${moduleCount} module${moduleCount !== 1 ? 's' : ''}`;
  };

  // Get available roles that don't have permissions yet
  const availableRoles: RoleType[] = (['ADMIN', 'TRAINER', 'STUDENT', 'PROGRAM_COORDINATOR'] as RoleType[])
    .filter(role => !rolePermissions.some(rp => rp.role === role));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading role permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, role: null })}
        onConfirm={handleDelete}
        title="Delete Role Permissions"
        message={`Are you sure you want to delete permissions for "${deleteConfirm.role ? roleDisplayNames[deleteConfirm.role] : ''}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? `Edit ${roleDisplayNames[editingRole.role]} Permissions` : 'Create Role Permissions'} size="lg">
        <div className="space-y-4">
          {!editingRole && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
              >
                <option value="">Select role</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{roleDisplayNames[role]}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">Permissions *</label>
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-gray-500">Module</th>
                    {PERMISSION_ACTIONS.map(action => (
                      <th key={action} className="px-2 py-2 text-center text-xs font-bold uppercase text-gray-500">
                        {actionLabels[action]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {PERMISSION_MODULES.map(module => (
                    <tr key={module} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                        {moduleLabels[module] || module}
                      </td>
                      {PERMISSION_ACTIONS.map(action => (
                        <td key={action} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={hasPermission(module, action)}
                            onChange={() => toggleModulePermission(module, action)}
                            className="w-4 h-4 rounded text-primary-700 focus:ring-primary-700"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!editingRole && !formData.role) || formData.permissions.length === 0}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {editingRole ? 'Update' : 'Create'} Permissions
            </button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/users')} className="hover:text-primary-600">User Management</button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Roles</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
        <p className="text-sm text-gray-500">Define roles and their access permissions</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full group">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-700 transition-colors">search</span>
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleInitializeDefaults}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">restart_alt</span>
            Initialize Defaults
          </button>
          {availableRoles.length > 0 && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create Role
            </button>
          )}
        </div>
      </div>

      {rolePermissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">admin_panel_settings</span>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No role permissions configured</h3>
          <p className="text-sm text-gray-400 mb-4">Click "Initialize Defaults" to set up default permissions for all roles</p>
          <button
            onClick={handleInitializeDefaults}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800"
          >
            Initialize Default Permissions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoles.map(rolePermission => (
            <div key={rolePermission.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{roleDisplayNames[rolePermission.role]}</h3>
                  <p className="text-xs text-gray-400 mt-1">{rolePermission.role}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(rolePermission)}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title="Edit permissions"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, role: rolePermission.role })}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Delete permissions"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                  {userCounts[rolePermission.role] || 0} user{(userCounts[rolePermission.role] || 0) !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {rolePermission.permissions.slice(0, 4).map(perm => (
                    <span key={perm.module} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded font-medium">
                      {moduleLabels[perm.module] || perm.module}
                      {perm.actions.includes('*') && ' (Full)'}
                    </span>
                  ))}
                  {rolePermission.permissions.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded font-medium">
                      +{rolePermission.permissions.length - 4} more
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {getPermissionSummary(rolePermission.permissions)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Roles;
