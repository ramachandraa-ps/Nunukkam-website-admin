import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Role } from '../../store/useStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const availablePermissions = [
  { id: 'courses.view', label: 'View Courses' },
  { id: 'courses.manage', label: 'Manage Courses' },
  { id: 'students.view', label: 'View Students' },
  { id: 'students.manage', label: 'Manage Students' },
  { id: 'colleges.view', label: 'View Colleges' },
  { id: 'colleges.manage', label: 'Manage Colleges' },
  { id: 'schedules.view', label: 'View Schedules' },
  { id: 'schedules.manage', label: 'Manage Schedules' },
  { id: 'assessments.view', label: 'View Assessments' },
  { id: 'assessments.grade', label: 'Grade Assessments' },
  { id: 'users.view', label: 'View Users' },
  { id: 'users.manage', label: 'Manage Users' },
  { id: 'reports.view', label: 'View Reports' },
  { id: 'settings.manage', label: 'Manage Settings' },
  { id: 'all', label: 'Full Access (Admin)' },
];

const Roles: React.FC = () => {
  const navigate = useNavigate();
  const { roles, users, addRole, updateRole, deleteRole } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const [formData, setFormData] = useState({
    title: '',
    permissions: [] as string[],
    addedBy: 'Admin',
  });

  const filteredRoles = roles.filter(role =>
    role.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUsersCount = (roleName: string) => {
    return users.filter(u => u.role === roleName && u.status === 'active').length;
  };

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        title: role.title,
        permissions: role.permissions,
        addedBy: role.addedBy,
      });
    } else {
      setEditingRole(null);
      setFormData({
        title: '',
        permissions: [],
        addedBy: 'Admin',
      });
    }
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    if (permId === 'all') {
      setFormData({
        ...formData,
        permissions: formData.permissions.includes('all') ? [] : ['all'],
      });
    } else {
      const newPerms = formData.permissions.includes(permId)
        ? formData.permissions.filter(p => p !== permId)
        : [...formData.permissions.filter(p => p !== 'all'), permId];
      setFormData({ ...formData, permissions: newPerms });
    }
  };

  const handleSubmit = () => {
    if (formData.title.trim() && formData.permissions.length > 0) {
      if (editingRole) {
        updateRole(editingRole.id, formData);
      } else {
        addRole(formData);
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = () => {
    deleteRole(deleteConfirm.id);
    setDeleteConfirm({ isOpen: false, id: '' });
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={handleDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? 'Edit Role' : 'Create New Role'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Role Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Content Editor"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">Permissions *</label>
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map(perm => (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      formData.permissions.includes(perm.id)
                        ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                        : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.id) || (perm.id !== 'all' && formData.permissions.includes('all'))}
                      onChange={() => togglePermission(perm.id)}
                      disabled={perm.id !== 'all' && formData.permissions.includes('all')}
                      className="w-4 h-4 rounded text-primary-700 focus:ring-primary-700"
                    />
                    <span className={`text-sm font-medium ${formData.permissions.includes(perm.id) ? 'text-primary-700' : 'text-gray-700 dark:text-gray-300'}`}>
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || formData.permissions.length === 0}
              className="px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50"
            >
              {editingRole ? 'Update' : 'Create'} Role
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
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">admin_panel_settings</span>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No roles found</h3>
            <p className="text-sm text-gray-400">Create your first role to manage permissions</p>
          </div>
        ) : (
          filteredRoles.map(role => (
            <div key={role.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{role.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">Added by {role.addedBy}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(role)}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: role.id })}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                  {getUsersCount(role.title)} user{getUsersCount(role.title) !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.includes('all') ? (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-medium">Full Access</span>
                  ) : (
                    role.permissions.slice(0, 3).map(perm => (
                      <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                        {availablePermissions.find(p => p.id === perm)?.label || perm}
                      </span>
                    ))
                  )}
                  {role.permissions.length > 3 && !role.permissions.includes('all') && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded font-medium">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Roles;
